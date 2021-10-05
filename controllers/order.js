const { Order, validate } = require("../models/order");

const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const uniqid = require("uniqid");
const { Product } = require("../models/product");
const nodemailer = require("nodemailer");
const ejs = require("ejs");

const common = require("../common/common");
const { getOrderHtml } = require("../common/htmls");
const { User } = require("../models/user");
const { Notification } = require("../models/notification");
const { generatePdf } = require("../common/generatePdf");
const moment = require("moment");

let ITEMS_PER_PAGE = 15;
let DEFAULT_LANGUAGE = "en";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  secure: true,
  port: 465,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

exports.listOrders = async (req, res) => {
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  if (!_.isEmpty(req.query.page)) {
    const page = +req.query.page || 1;
    // query.parentId = { $ne: null };
    // let sort = {name:1};
    if (!_.isEmpty(req.query.search)) {
      query["order_code"] = { $regex: req.query.search, $options: "i" };
    }
    if (!_.isEmpty(req.query.user_id)) {
      query["customer_id"] = req.query.user_id;
    }
    // if (!_.isEmpty(req.query.sort)) {
    //   if(req.query.sort == 'desc')
    //   sort.name = -1;
    // }
    let productIds = [];
    if (req.user.user_type == "seller") {
      const queryForProduct = { created_by_id: req.user._id };
      const products = await Product.find(queryForProduct);
      if (_.isEmpty(products))
        return res.json({ err: "No products found under the current seller" });
      productIds = products.map((product) => product._id);
      query["products.product_id"] = { $in: productIds };
    }

    if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
    try {
      const orderCount = await Order.count(query);
      const allOrders = await Order.find(query)
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        // .populate("order", "name")
        .select("-__v")
        .lean();
      if (_.isEmpty(allOrders)) return res.json({ msg: "No orders found" });
      allOrders.forEach((order) => {
        // const i18nResourceBundle = common.getResourceBundle(
        //   languageCode,
        //   order.resourceBundle
        // );
        // order.i18nResourceBundle = i18nResourceBundle;
        let total_quantity = 0;
        let total_amount = 0;
        if (req.user.user_type == "seller") {
          // order.products.forEach((product) => {
          let products = order.products;
          for (let index = 0; index < products.length; index++) {
            if (productIds.inlcudes(products[index].product_id)) {
              total_quantity += products[index].quantity;
              if (!_.isEmpty(products[index].discount_type)) {
                if (products[index].discount_type == "percent") {
                  total_amount +=
                    products[index].quantity *
                    (products[index].cost -
                      0.01 * products[index].discount * products[index].cost);
                } else {
                  total_amount +=
                    products[index].quantity *
                    (products[index].cost - products[index].discount);
                }
              } else {
                total_amount += products[index].quantity * products[index].cost;
              }
            } else {
              order.products.splice(index, 1);
            }
            // });
          }
        } else {
          order.products.forEach((product) => {
            total_quantity += product.quantity;
            if (!_.isEmpty(product.discount_type)) {
              if (product.discount_type == "percent") {
                total_amount +=
                  product.quantity *
                  (product.cost - 0.01 * product.discount * product.cost);
              } else {
                total_amount +=
                  product.quantity * (product.cost - product.discount);
              }
            } else {
              total_amount += product.quantity * product.cost;
            }
          });
        }
        order.no_of_products = total_quantity;
        order.total_amount = total_amount;
        // delete order.resourceBundle;
      });
      // res.send(allOrders);
      return res.json({
        orders: allOrders,
        info: {
          totalNumber: orderCount,
          hasNextPage: ITEMS_PER_PAGE * page < orderCount,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(orderCount / ITEMS_PER_PAGE),
        },
      });
    } catch (error) {
      console.log("Server Error in order.getOrders", error);
      return res.status(500).send("Server Error in order.getOrders");
    }
  }
  try {
    const allOrders = await Order.find();
    if (_.isEmpty(allOrders)) return res.json({ msg: "No orders found" });
    res.send(allOrders);
  } catch (error) {
    return res.status(500).send("Server Error in order.getOrders");
  }
};

exports.createOrder = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  const order_code = uniqid("");
  const languageCode = "en";
  if (!_.isEmpty(req.query.lang)) {
    languageCode = req.query.lang;
  }
  const {
    products,
    customer_id,
    customer_name,
    shipping_address,
    delivery_note,
    delivery_time,
    // order_status,
    payment_status,
    payment_method,
  } = req.body;
  const order_status = "confirmed";

  if (!_.isEmpty(customer_id)) {
    const user = await common.userCheck(customer_id);
    if (user.error) {
      return res.status(user.statusCode || 400).json({
        err: user.msg || "Error in user check",
      });
    }
  }

  try {
    await Promise.all(
      products.map(async (product) => {
        const productDetails = await Product.findById(product.product_id);
        if (!productDetails)
          throw { err: `product with id ${product.product_id} not found` };
        if (!_.isUndefined(productDetails.minimum_purchase_quantity)) {
          if (productDetails.minimum_purchase_quantity > product.quantity)
            throw {
              err: `product id ${product.product_id} - minimum purchase quantity : ${productDetails.minimum_purchase_quantity}`,
            };
        }
        const i18nResourceBundle = common.getResourceBundle(
          languageCode,
          productDetails.resourceBundle
        );

        product.name = i18nResourceBundle.name;
        product.shipping_config = productDetails.shipping_config;
        if (!_.isUndefined(productDetails.shipping_cost)) {
          product.shipping_cost = productDetails.shipping_cost;
        }
        if (!_.isUndefined(productDetails.product_quantity_multiply)) {
          product.product_quantity_multiply =
            productDetails.product_quantity_multiply;
        }
        const varient = getProductVarient(productDetails, product.varient_id);
        if (varient.error) {
          throw {
            err: varient.msg || "Error in varient check",
          };
        }
        product.cost = varient.varient_cost;
        product.sku = varient.varient_sku;
        if (
          !_.isEmpty(varient.discount_range) &&
          !_.isEmpty(varient.discount_type) &&
          !_.isUndefined(varient.discount_amount)
        ) {
          if (
            +varient.discount_range.from <= +new Date() &&
            +varient.discount_range.to >= +new Date()
          ) {
            product.discount = varient.discount_amount;
            product.discount_type = varient.discount_type;
          }
        }
      })
    );
  } catch (error) {
    return res.status(404).json(error);
  }

  const { resourceBundle } = req.body;
  const order = new Order({
    order_code,
    products,
    customer_name,
    shipping_address,
    delivery_time,
    order_status,
    payment_status,
    payment_method,
  });

  try {
    await Promise.all(
      products.map(async (product) => {
        const { product_id, varient_id, quantity: ordered_quantity } = product;
        const existingProduct = await Product.findById(product_id);
        if (!existingProduct)
          throw {
            err: `Product with id ${product_id} not found`,
          };
        if (existingProduct.prices) {
          const currentVarient = existingProduct.prices.find((varient) =>
            varient._id.equals(varient_id)
          );
          if (!currentVarient)
            throw {
              err: `Product with id ${product_id} and varient id ${varient_id} not found`,
            };
          let existingQuantity = currentVarient.quantity;
          if (existingQuantity < ordered_quantity)
            throw {
              err: `Required Quantity not availabe for product with id ${product_id}`,
            };
          // currentVarient.quantity = existingQuantity - ordered_quantity;
          // await existingProduct.save();
        }
      })
    );
    await Promise.all(
      products.map(async (product) => {
        const { product_id, varient_id, quantity: ordered_quantity } = product;
        const existingProduct = await Product.findById(product_id);
        if (existingProduct.prices) {
          const currentVarient = existingProduct.prices.find((varient) =>
            varient._id.equals(varient_id)
          );
          let existingQuantity = currentVarient.quantity;
          currentVarient.quantity = existingQuantity - ordered_quantity;
          await existingProduct.save();
        }
      })
    );
  } catch (error) {
    console.log("Server error in createOrders", error);
    return res.status(400).json(error);
  }

  if (!_.isEmpty(customer_id)) order.customer_id = customer_id;
  if (!_.isEmpty(delivery_note)) order.delivery_note = delivery_note;
  try {
    const savedOrder = await order.save();
    res.json(savedOrder);
    const notification = new Notification({
      type: "order",
      type_id: savedOrder._id,
    });
    await notification.save();
    if (order_status === "confirmed") {
      sendEmailToAdmin(order);
    }
  } catch (err) {
    console.log("Server Error in order.postOrder", err);
    return res.status(400).send("Server Error in order.postOrder");
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    let productIds = [];
    const query = { _id: req.params.id };
    if (req.user.user_type == "seller") {
      const queryForProduct = { created_by_id: req.user._id };
      const products = await Product.find(queryForProduct);
      if (_.isEmpty(products))
        return res.json({ err: "No products found under the current seller" });
      productIds = products.map((product) => product._id);
      query["products.product_id"] = { $in: productIds };
    }
    const order = await Order.findOne(query)
      .populate(
        "products.product_id",
        "product_image_small_url shipping_cost shipping_config product_quantity_multiply"
      )
      .select("-__v")
      .lean();

    if (!order)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });
    if (req.user.user_type == "seller") {
      let products = order.products;
      for (let index = 0; index < products.length; index++) {
        if (!productIds.inlcudes(products[index].product_id)) {
          order.products.splice(index, 1);
        }
        // });
      }
    }
    order.createdAt = moment(order.createdAt).format("MMM Do YY");
    if (!_.isEmpty(order.products)) {
      let subTotal = 0;
      let shippingCost = 0;
      order.products.forEach((product) => {
        let productCost = product.cost;
        if (product.discount_type && product.discount) {
          productCost =
            product.discount_type === "flat"
              ? product.cost - product.discount
              : product.cost - product.cost * 0.01 * product.discount;
        }
        product.productCost = productCost;
        shippingCost +=
          product.shipping_config === "flat_rate"
            ? product.product_quantity_multiply
              ? product.quantity * product.shipping_cost
              : product.shipping_cost
            : 0;
        subTotal += product.quantity * productCost;
      });
      order.shippingCost = shippingCost;
      order.subTotal = subTotal;
    } else {
      return res
        .status(400)
        .json({ err: "No product found in this order of seller" });
    }

    res.send(order);
  } catch (err) {
    console.log("Server Error in order.getSingleOrder", err);
    return res.status(400).send("Server Error in order.getSingleOrder");
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderExists = await Order.findById(req.params.id);

    if (
      orderExists.order_status !== "completed" ||
      orderExists.order_status !== "cancelled"
    )
      return res
        .status(400)
        .json({ err: "The order is not completed or cancelled" });
    if (!orderExists)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    const order = await Order.findByIdAndRemove(req.params.id);
    return res.send(order);
  } catch (error) {
    console.log("Server Error in order.deleteOrder", error);
    return res.status(400).json({
      err: "Server Error in order.deleteOrder",
    });
  }
};

exports.updateDeliveryBoy = async (req, res) => {
  const { error } = validateDeliveryBoyUpdate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  // if (!_.isEmpty(req.body.delivery_boy_id)) {
  const user = await User.findOne({
    _id: req.body.delivery_boy_id,
    user_type: "delivery_boy",
  });
  if (!user) {
    return res.status(404).json({
      err: `Delivery boy with id ${req.body.delivery_boy_id} not found`,
    });
  }
  // }

  try {
    const existingOrder = await Order.findOne({ _id: req.params.id });
    if (!existingOrder)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    const orderContent = { delivery_boy_id: req.body.delivery_boy_id };
    const order = await Order.findByIdAndUpdate(req.params.id, orderContent, {
      new: true,
    });

    res.send(order);
  } catch (error) {
    console.log("Server Error in order.updateDeliveryBoy", error);
    return res.status(500).send("Server Error in order.updateDeliveryBoy");
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { error } = validateOrderStatusUpdate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  // const user = await User.findOne({
  //   _id: req.body.delivery_boy_id,
  //   user_type: "delivery_boy",
  // });
  // if (!user) {
  //   return res.status(404).json({
  //     err: `Delivery boy with id ${req.body.delivery_boy_id} not found`,
  //   });
  // }

  try {
    const existingOrder = await Order.findOne({ _id: req.params.id });
    if (!existingOrder)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    if (existingOrder.order_status === "completed") {
      return res
        .status(400)
        .json({ err: `Order status is already completed, cannot update` });
    }

    if (req.body.order_status == "completed") {
      await Promise.all(
        existingOrder.products.map(async (product) => {
          const {
            product_id,
            varient_id,
            quantity: ordered_quantity,
          } = product;
          const existingProduct = await Product.findById(product_id);
          if (!existingProduct)
            throw {
              err: `Product with id ${product_id} not found`,
            };
          if (existingProduct.prices) {
            const currentVarient = existingProduct.prices.find((varient) =>
              varient._id.equals(varient_id)
            );
            // console.log("kdj",currentVarient,existingProduct.prices);
            if (!currentVarient)
              throw {
                err: `Product with id ${product_id} and varient id ${varient_id} not found`,
              };
            // let existingSold = currentVarient.sold?currentVarient.sold:0;
            // currentVarient.sold = existingSold + ordered_quantity;
            // await existingProduct.save();
          }
        })
      );
      await Promise.all(
        existingOrder.products.map(async (product) => {
          const {
            product_id,
            varient_id,
            quantity: ordered_quantity,
          } = product;
          const existingProduct = await Product.findById(product_id);
          if (existingProduct.prices) {
            const currentVarient = existingProduct.prices.find((varient) =>
              varient._id.equals(varient_id)
            );
            let existingSold = currentVarient.sold ? currentVarient.sold : [];
            currentVarient.sold = existingSold.push({
              quantity: ordered_quantity,
              date: new Date(),
            });
            //  + ordered_quantity;
            await existingProduct.save();
          }
        })
      );
    }

    const orderContent = { order_status: req.body.order_status };
    const order = await Order.findByIdAndUpdate(req.params.id, orderContent, {
      new: true,
    });

    res.send(order);
  } catch (error) {
    console.log("Server Error in order.updateOrderStatus", error);
    return res.status(500).send("Server Error in order.updateOrderStatus");
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const { error } = validatePaymentStatusUpdate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  try {
    const existingOrder = await Order.findOne({ _id: req.params.id });
    if (!existingOrder)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    if (existingOrder.payment_status == req.body.payment_status) {
      return res
        .status(400)
        .json({ err: `Payment status is already ${req.body.payment_status}` });
    }
    const orderContent = { payment_status: req.body.payment_status };
    const order = await Order.findByIdAndUpdate(req.params.id, orderContent, {
      new: true,
    });

    res.send(order);
  } catch (error) {
    console.log("Server Error in order.updatePaymentStatus", error);
    return res.status(500).send("Server Error in order.updatePaymentStatus");
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  const { error } = validateDeliveryStatusUpdate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  try {
    const existingOrder = await Order.findOne({ _id: req.params.id });
    if (!existingOrder)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    if (existingOrder.delivery_status == req.body.delivery_status) {
      return res.status(400).json({
        err: `Delivery status is already ${req.body.delivery_status}`,
      });
    }
    if (
      req.body.delivery_status === "delivered" &&
      existingOrder.payment_status !== "paid"
    ) {
      return res.status(400).json({
        err: `Payment is not done for this order`,
      });
    }
    const orderContent = { delivery_status: req.body.delivery_status };
    if (req.body.delivery_status === "delivered") {
      orderContent.order_status = "completed";
      await Promise.all(
        existingOrder.products.map(async (product) => {
          const {
            product_id,
            varient_id,
            quantity: ordered_quantity,
          } = product;
          const existingProduct = await Product.findById(product_id);
          if (!existingProduct)
            throw {
              err: `Product with id ${product_id} not found`,
            };
          if (existingProduct.prices) {
            const currentVarient = existingProduct.prices.find((varient) =>
              varient._id.equals(varient_id)
            );
            // console.log("kdj",currentVarient,existingProduct.prices);
            if (!currentVarient)
              throw {
                err: `Product with id ${product_id} and varient id ${varient_id} not found`,
              };
            // let existingSold = currentVarient.sold?currentVarient.sold:0;
            // currentVarient.sold = existingSold + ordered_quantity;
            // await existingProduct.save();
          }
        })
      );
      await Promise.all(
        existingOrder.products.map(async (product) => {
          const {
            product_id,
            varient_id,
            quantity: ordered_quantity,
          } = product;
          const existingProduct = await Product.findById(product_id);
          if (existingProduct.prices) {
            const currentVarient = existingProduct.prices.find((varient) =>
              varient._id.equals(varient_id)
            );
            let existingSold = currentVarient.sold ? currentVarient.sold : [];
            currentVarient.sold = existingSold.push({
              quantity: ordered_quantity,
              date: new Date(),
            });
            //  + ordered_quantity;
            await existingProduct.save();
          }
        })
      );
    }
    const order = await Order.findByIdAndUpdate(req.params.id, orderContent, {
      new: true,
    });

    res.send(order);
  } catch (error) {
    console.log("Server Error in order.updateDeliveryStatus", error);
    return res.status(500).send("Server Error in order.updateDeliveryStatus");
  }
};

// exports.updateOrder = async (req, res) => {
//   if (_.isEmpty(req.body)) {
//     if (!req.file) return res.json({ msg: "Empty body" });
//   }

//   const { error } = validateOrder(req.body);
//   if (error) {
//     try {
//       if (req.file) fs.unlinkSync(req.file.path);
//     } catch (error) {
//       console.log("Error while deleting the file in order.updateOrder", error);
//       return res.status(400).json({
//         err: "Error while deleting the file in order.updateOrder",
//       });
//     }
//     return res.status(400).json({ err: error.details[0].message });
//   }

//   try {
//     const existingOrder = await Order.findOne({ _id: req.params.id });
//     if (!existingOrder)
//       return res
//         .status(404)
//         .json({ msg: "The order with the given ID was not found." });

//     const orderContent = {};
//     if (!_.isEmpty(req.body.resourceBundle))
//       orderContent.resourceBundle = req.body.resourceBundle;
//     if (!_.isEmpty(req.file)) {
//       if (existingOrder.logo_url && fs.existsSync(existingOrder.logo_url))
//         fs.unlinkSync(existingOrder.logo_url);
//       orderContent.logo_url = req.file.path;
//     }
//     const order = await Order.findByIdAndUpdate(req.params.id, orderContent, {
//       new: true,
//     });

//     res.send(order);
//   } catch (error) {
//     console.log("Server Error in order.updateOrder", error);
//     return res.status(500).send("Server Error in order.updateOrder");
//   }
// };

// function validateOrder(order) {
//   const schema = Joi.object({
//     resourceBundle: Joi.array().items(
//       Joi.object({
//         languageCode: Joi.string().valid("en", "ar").required(),
//         name: Joi.string().required(),
//       }).required()
//     ),
//   });

//   return schema.validate(order);
// }
function validateDeliveryBoyUpdate(order) {
  const schema = Joi.object({
    delivery_boy_id: Joi.objectId().required(),
  });

  return schema.validate(order);
}
function validateOrderStatusUpdate(order) {
  const schema = Joi.object({
    order_status: Joi.string().valid("completed").required(),
  });

  return schema.validate(order);
}

function validatePaymentStatusUpdate(order) {
  const schema = Joi.object({
    payment_status: Joi.string()
      .valid("unpaid", "failed", "expired", "paid")
      .required(),
  });

  return schema.validate(order);
}

function validateDeliveryStatusUpdate(order) {
  const schema = Joi.object({
    delivery_status: Joi.string()
      .valid(
        "yet_to_dispatch",
        "dispatched",
        "in_transit",
        "out_for_delivery",
        "delivered"
      )
      .required(),
  });

  return schema.validate(order);
}

const getI18nProduct = (productDetails, languageCode) => {
  //   _.forEach(productDetails, function (product, index) {
  const i18nResourceBundle = common.getResourceBundle(
    languageCode,
    productDetails.resourceBundle
  );

  return i18nResourceBundle;
  // product.index = index;
  // delete productDetails.resourceBundle;
  // if (!_.isEmpty(product.children)) {
  //   getI18Category(product.children, languageCode);
  // }
  //   });
};

const getProductVarient = (productDetails, varient_id) => {
  const product_varient = productDetails.prices.find((varient) => {
    return varient._id.equals(varient_id);
  });
  if (!product_varient) {
    return {
      error: true,
      msg: `varient with the id ${varient_id} not found`,
      statusCode: 400,
    };
  }
  // productDetails.varient_cost = product_varient.unit_price;
  // productDetails.varient_sku = product_varient.sku;
  // console.log("lkdjlksd",product_varient.unit_price)
  return {
    error: false,
    varient_cost: product_varient.unit_price,
    varient_sku: product_varient.sku,
    discount_range: product_varient.discount_range
      ? product_varient.discount_range
      : null,
    discount_type: product_varient.discount_type
      ? product_varient.discount_type
      : null,
    discount_amount: product_varient.discount_amount
      ? product_varient.discount_amount
      : null,
  };
};

exports.getOrderPdf = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate(
        "products.product_id",
        "product_image_small_url shipping_cost shipping_config product_quantity_multiply"
      )
      .select("-__v");

    if (!order)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    const tableRows = [];
    let subTotal = 0;
    let shippingCost = 0;
    const addressArray = [];
    if (!_.isEmpty(order.shipping_address)) {
      if (!_.isEmpty(order.shipping_address.building_name))
        addressArray.push({
          text: order.shipping_address.building_name,
          margin: [0, 10, 0, 0],
        });
      if (!_.isEmpty(order.shipping_address.city))
        addressArray.push({
          text: order.shipping_address.city,
          margin: [0, 0],
        });
      if (!_.isEmpty(order.shipping_address.street))
        addressArray.push({
          text: order.shipping_address.street,
          margin: [0, 0, 0, 10],
        });
    } else {
      addressArray.push({ text: "None", margin: [0, 10] });
    }
    if (!_.isEmpty(order.products)) {
      order.products.forEach((product) => {
        //find shipping cost
        if (product.product_id.shipping_config != "free") {
          if (product.product_id.product_quantity_multiply) {
            if (product.product_id.shipping_cost)
              shippingCost +=
                product.product_id.shipping_cost * product.quantity;
          } else {
            if (product.product_id.shipping_cost)
              shippingCost += product.product_id.shipping_cost;
          }
        }
        //end of shipping cost
        //find product cost
        let productCost = product.cost;
        if (product.discount_type && product.discount) {
          productCost =
            product.discount_type === "flat"
              ? product.cost - product.discount
              : product.cost - product.cost * 0.01 * product.discount;
        }
        //end
        let singleRow = [];
        singleRow.push({ text: product.name, margin: [0, 10] });
        if (product.varient_value && product.varient_value !== "default") {
          singleRow.push({ text: product.varient_value, margin: [0, 10] });
        } else {
          singleRow.push({ text: "", margin: [0, 10] });
        }
        singleRow.push({
          text: new Intl.NumberFormat("en-QA", {
            style: "currency",
            currency: "QAR",
          }).format(productCost),
          margin: [0, 10],
        });
        singleRow.push({ text: product.quantity, margin: [0, 10] });
        singleRow.push({
          text: new Intl.NumberFormat("en-QA", {
            style: "currency",
            currency: "QAR",
          }).format(productCost * product.quantity),
          margin: [0, 10],
        });
        tableRows.push(singleRow);
        subTotal += productCost * product.quantity;
      });
    }

    const docDefinition = {
      watermark: {
        text: "Q Sales",
        color: "grey",
        opacity: 0.1,
        bold: true,
        italics: false,
        angle: 0,
      },
      content: [
        // Header
        {
          columns: [
            // {
            //   image: path.join(__dirname, "..", "/public/images/Qsales.png"),
            //   width: 70,
            // },

            // [
            {
              text: "Q Sales",
              style: "invoiceTitle",
              alignment: "left",
            },
            {
              stack: ["support@qsales2022.com"],
              alignment: "right",
            },
          ],
          columnGap: 0,
        },
        //Invoice
        {
          text: "Invoice",
          // margin: [0, 10],
          style: "invoiceBillingTitle",
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 2,
              // lineColor: "#276fb8",
            },
          ],
        },

        //order number, date and shipping Address
        {
          columns: [
            {
              stack: [
                { text: "Order No.", margin: [0, 10] },
                { text: "Billing Date" },
              ],
            },
            {
              stack: [
                { text: order.order_code, margin: [0, 10] },
                { text: moment().format("MMM Do YY") },
              ],
            },
            { text: "Shipping Address: ", margin: [0, 10], alignment: "right" },
            { stack: addressArray },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 595 - 2 * 40,
              y2: 5,
              lineWidth: 2,
            },
          ],
        },
        //Table
        "\n\n\n",
        {
          // style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*"],
            body: [
              [
                { text: "Item", style: "tableHeader", margin: [0, 10] },
                { text: "Description", style: "tableHeader", margin: [0, 10] },
                { text: "Unit Price", style: "tableHeader", margin: [0, 10] },
                { text: "Quantity", style: "tableHeader", margin: [0, 10] },
                { text: "Total", style: "tableHeader", margin: [0, 10] },
              ],
              ...tableRows,
            ],
          },
          layout: "lightHorizontalLines",
        },
        //Table subtotal
        {
          columns: [
            { width: "*", text: "" },
            {
              stack: [
                {
                  // style: 'tableExample',
                  table: {
                    headerRows: 1,
                    widths: ["*", "*"],
                    body: [
                      ["", ""],
                      [
                        {
                          text: "Sub Total",
                          style: "tableHeader",
                          margin: [0, 10],
                        },
                        {
                          text: new Intl.NumberFormat("en-QA", {
                            style: "currency",
                            currency: "QAR",
                          }).format(subTotal),
                          style: "tableHeader",
                          margin: [0, 10],
                        },
                      ],
                      [
                        {
                          text: "Shipping",
                          style: "tableHeader",
                          margin: [0, 10],
                        },
                        {
                          text: new Intl.NumberFormat("en-QA", {
                            style: "currency",
                            currency: "QAR",
                          }).format(shippingCost),
                          style: "tableHeader",
                          margin: [0, 10],
                        },
                      ],
                      [
                        {
                          text: "TOTAL",
                          style: "tableHeader",
                          margin: [0, 10],
                        },
                        {
                          text: new Intl.NumberFormat("en-QA", {
                            style: "currency",
                            currency: "QAR",
                          }).format(shippingCost + subTotal),
                          style: "tableHeader",
                          margin: [0, 10],
                        },
                      ],
                    ],
                  },
                  layout: "lightHorizontalLines",
                  // alignment: "right",
                },
              ],
              width: 200,
            },
          ],
        },
      ],
      styles: {
        // Document Header
        documentHeaderLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: "left",
        },
        documentHeaderCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: "center",
        },
        documentHeaderRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: "right",
        },
        // Document Footer
        documentFooterLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: "left",
        },
        documentFooterCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: "center",
        },
        documentFooterRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: "right",
        },
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: "right",
          margin: [0, 0, 0, 15],
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          alignment: "right",
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: "right",
        },
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: "left",
          margin: [0, 20, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails: {
          alignment: "left",
        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true,
        },
        invoiceBillingAddress: {},
        // Items Header
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true,
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11,
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: "center",
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: "center",
        },

        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterSubTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: "right",
        },
        itemsFooterSubValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: "center",
        },
        itemsFooterTotalTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: "right",
        },
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: "center",
        },
        signaturePlaceholder: {
          margin: [0, 70, 0, 0],
        },
        signatureName: {
          bold: true,
          alignment: "center",
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: "center",
        },
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10,
        },
        center: {
          alignment: "center",
        },
      },
      defaultStyle: {
        columnGap: 20,
      },
    };

    generatePdf(docDefinition, (response) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + `order_${req.params.id}.pdf`
      );
      res.end(response, "binary");
    });
  } catch (err) {
    console.log("Server Error in order.getOrderPdf", err);
    return res.status(400).send("Server Error in order.getOrderPdf");
  }
};

exports.getDeliveryBoyAssignedOrders = async (req, res) => {
  let query = { delivery_boy_id: req.user._id, order_status: "confirmed" };
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["order_code"] = { $regex: req.query.search, $options: "i" };
  }
  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const orderCount = await Order.count(query);
    const allOrders = await Order.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("-__v")
      .lean();
    if (_.isEmpty(allOrders)) return res.json({ msg: "No orders found" });
    allOrders.forEach((order) => {
      let total_quantity = 0;
      let total_amount = 0;
      order.products.forEach((product) => {
        total_quantity += product.quantity;
        if (!_.isEmpty(product.discount_type)) {
          if (product.discount_type == "percent") {
            total_amount +=
              product.quantity *
              (product.cost - 0.01 * product.discount * product.cost);
          } else {
            total_amount +=
              product.quantity * (product.cost - product.discount);
          }
        } else {
          total_amount += product.quantity * product.cost;
        }
      });

      order.no_of_products = total_quantity;
      order.total_amount = total_amount;
    });
    return res.json({
      orders: allOrders,
      info: {
        totalNumber: orderCount,
        hasNextPage: ITEMS_PER_PAGE * page < orderCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(orderCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in order.getDeliveryBoyAssignedOrders", error);
    return res
      .status(500)
      .send("Server Error in order.getDeliveryBoyAssignedOrders");
  }
};

exports.getDeliveryBoyCompletedOrders = async (req, res) => {
  let query = { delivery_boy_id: req.user._id, order_status: "completed" };
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["order_code"] = { $regex: req.query.search, $options: "i" };
  }
  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const orderCount = await Order.count(query);
    const allOrders = await Order.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("-__v")
      .lean();
    if (_.isEmpty(allOrders)) return res.json({ msg: "No orders found" });
    allOrders.forEach((order) => {
      let total_quantity = 0;
      let total_amount = 0;
      order.products.forEach((product) => {
        total_quantity += product.quantity;
        if (!_.isEmpty(product.discount_type)) {
          if (product.discount_type == "percent") {
            total_amount +=
              product.quantity *
              (product.cost - 0.01 * product.discount * product.cost);
          } else {
            total_amount +=
              product.quantity * (product.cost - product.discount);
          }
        } else {
          total_amount += product.quantity * product.cost;
        }
      });

      order.no_of_products = total_quantity;
      order.total_amount = total_amount;
    });
    return res.json({
      orders: allOrders,
      info: {
        totalNumber: orderCount,
        hasNextPage: ITEMS_PER_PAGE * page < orderCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(orderCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in order.getDeliveryBoyCompletedOrders", error);
    return res
      .status(500)
      .send("Server Error in order.getDeliveryBoyCompletedOrders");
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const existingOrder = await Order.findOne({ _id: req.params.id });
    if (!existingOrder)
      return res
        .status(404)
        .json({ msg: "The order with the given ID was not found." });

    if (existingOrder.order_status === "cancelled") {
      return res.status(400).json({
        err: `This order is already cancelled`,
      });
    }
    if (existingOrder.order_status === "completed") {
      return res.status(400).json({
        err: `This order is completed, cannot cancel`,
      });
    }
    if (existingOrder.payment_status === "paid") {
      //Do what ever needed for refund
    }
    const { products } = existingOrder;
    if (!_.isEmpty(products)) {
      try {
        await Promise.all(
          products.map(async (product) => {
            const {
              product_id,
              varient_id,
              quantity: ordered_quantity,
            } = product;
            const existingProduct = await Product.findById(product_id);
            if (!existingProduct) {
              console.log(
                `The product with id ${product_id} not found, while increasing quantity on order cancel`
              );
            }
            if (existingProduct)
              if (existingProduct.prices) {
                const currentVarient = existingProduct.prices.find((varient) =>
                  varient._id.equals(varient_id)
                );
                if (!currentVarient)
                  console.log(
                    `The product with id ${product_id} and varient id ${varient_id} not found, while increasing quantity on order cancel`
                  );
                let existingQuantity = currentVarient.quantity;
                currentVarient.quantity = existingQuantity + ordered_quantity;
                await existingProduct.save();
              }
          })
        );
      } catch (error) {
        console.log("Server error in cancelOrders", error);
        return res.status(400).json(error);
      }
    }
    const orderContent = { order_status: "cancelled" };
    const order = await Order.findByIdAndUpdate(req.params.id, orderContent, {
      new: true,
    });

    res.send(order);
  } catch (error) {
    console.log("Server Error in order.updateDeliveryStatus", error);
    return res.status(500).send("Server Error in order.updateDeliveryStatus");
  }
};

async function sendEmailToAdmin(order) {
  order.invoiceDate = moment().format("MMM Do YY");
  if (!_.isEmpty(order.products)) {
    let subTotal = 0;
    let shippingCost = 0;
    order.products.forEach((product) => {
      let productCost = product.cost;
      if (product.discount_type && product.discount) {
        productCost =
          product.discount_type === "flat"
            ? product.cost - product.discount
            : product.cost - product.cost * 0.01 * product.discount;
      }
      product.productCost = productCost;
      shippingCost +=
        product.shipping_config === "flat_rate"
          ? product.product_quantity_multiply
            ? product.quantity * product.shipping_cost
            : product.shipping_cost
          : 0;
      subTotal += product.quantity * productCost;
    });
    order.shippingCost = shippingCost;
    order.subTotal = subTotal;
  }
  try {
    const htmlData = await ejs.renderFile(
      path.join(__dirname, "../templates/adminOrder.ejs"),
      { order }
    );
    // console.log("hekkkkkkkkkk", htmlData);
    // return;
    const mailOptions = {
      from: `Q Sales <${process.env.NODEMAILER_EMAIL}>`,
      to: process.env.ADMIN_MAIL,
      subject: "New Order",
      html: htmlData,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(
          "Error while sending email from order.sendEmailToAdmin",
          error
        );
      }
    });
  } catch (err) {
    console.log("Error while sending email from order.sendEmailToAdmin", err);
  }
}
