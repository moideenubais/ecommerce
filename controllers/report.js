const { Brand } = require("../models/brand");
const { Category } = require("../models/category");
const { User } = require("../models/user");

const _ = require("lodash");

const common = require("../common/common");
const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { Shop } = require("../models/shop");
const { range } = require("lodash");

exports.getGraphDataForCategory = async (req, res) => {
  const dateRange = req.query.range;
  try {
    const query = {};
    if (!_.isEmpty(dateRange)) {
      query["prices.sold.date"] = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      };
    }
    const categoryWiseProducts = await Product.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$category_id",
          pricesArray: { $push: "$prices" },
        },
      },
    ]);
    //get the sold for only the date in requested date range
    if (!_.isEmpty(categoryWiseProducts) && !_.isEmpty(dateRange)) {
      categoryWiseProducts.forEach((category) => {
        if (!_.isEmpty(category.pricesArray)) {
          category.pricesArray.forEach((prices) => {
            if (!_.isEmpty(prices)) {
              prices.forEach((price) => {
                if (!_.isEmpty(price) && !_.isEmpty(price.sold)) {
                  price.sold = price.sold.filter(
                    (singleSold) =>
                      singleSold.date >= dateRange.startDate &&
                      singleSold.date <= dateRange.endDate
                  );
                }
              });
            }
          });
        }
      });
    }

    categoryWiseProducts.forEach((category) => {
      let sold = 0;
      if (!_.isEmpty(category.pricesArray))
        category.pricesArray.forEach((prices) => {
          if (!_.isEmpty(prices))
            prices.forEach((varient) => {
              if (!_.isEmpty(varient.sold)) {
                varient.sold.forEach((singleSold) => {
                  sold += singleSold.quantity;
                });
              }
              // sold += varient.sold.quantity;
            });
        });
      category.sold = sold;
    });
    return res.json({
      categoryWiseProducts,
    });
  } catch (error) {
    console.log("Server Error in report.getGraphDataForCategory", error);
    return res
      .status(500)
      .send("Server Error in report.getGraphDataForCategory");
  }
};

exports.getGraphDataForBrand = async (req, res) => {
  const dateRange = req.query.range;
  try {
    const query = {};
    if (!_.isEmpty(dateRange)) {
      query["prices.sold.date"] = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      };
    }
    const brandWiseProducts = await Product.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$brand_id",
          pricesArray: { $push: "$prices" },
        },
      },
    ]);

    if (!_.isEmpty(brandWiseProducts) && !_.isEmpty(dateRange)) {
      brandWiseProducts.forEach((brand) => {
        if (!_.isEmpty(brand.pricesArray)) {
          brand.pricesArray.forEach((prices) => {
            if (!_.isEmpty(prices)) {
              prices.forEach((price) => {
                if (!_.isEmpty(price) && !_.isEmpty(price.sold)) {
                  price.sold = price.sold.filter(
                    (singleSold) =>
                      singleSold.date >= dateRange.startDate &&
                      singleSold.date <= dateRange.endDate
                  );
                }
              });
            }
          });
        }
      });
    }

    brandWiseProducts.forEach((category) => {
      let sold = 0;
      if (!_.isEmpty(category.pricesArray))
        category.pricesArray.forEach((prices) => {
          if (!_.isEmpty(prices))
            prices.forEach((varient) => {
              if (!_.isEmpty(varient.sold)) {
                varient.sold.forEach((singleSold) => {
                  sold += singleSold.quantity;
                });
              }
              // sold += varient.sold.quantity;
            });
        });
      category.sold = sold;
    });
    return res.json({
      brandWiseProducts,
    });
  } catch (error) {
    console.log("Server Error in report.getGraphDataForBrand", error);
    return res.status(500).send("Server Error in report.getGraphDataForBrand");
  }
};

exports.getReportData = async (req, res) => {
  let languageCode = req.user.language || "en";
  try {
    let query = { user_type: "user" };
    const userCount = await User.count(query);
    query = { parentId: { $ne: null } };
    const categories = await Category.find(query)
      .select("resourceBundle")
      .lean();
    const brands = await Brand.find().select("resourceBundle").lean();
    const orderCount = await Order.count();
    // const categoryWiseProducts = await Product.aggregate([
    //   {
    //     $group: {
    //       _id: "$category_id",
    //       pricesArray: { $push: "$prices" },
    //     },
    //   },
    // ]);
    // const brandWiseProducts = await Product.aggregate([
    //   {
    //     $group: {
    //       _id: "$brand_id",
    //       pricesArray: { $push: "$prices" },
    //     },
    //   },
    // ]);
    // categoryWiseProducts.forEach((category) => {
    //   let sold = 0;
    //   if (!_.isEmpty(category.pricesArray))
    //     category.pricesArray.forEach((prices) => {
    //       if (!_.isEmpty(prices))
    //         prices.forEach((varient) => {
    //           sold += varient.sold;
    //         });
    //     });
    //   category.sold = sold;
    // });
    // brandWiseProducts.forEach((category) => {
    //   let sold = 0;
    //   if (!_.isEmpty(category.pricesArray))
    //     category.pricesArray.forEach((prices) => {
    //       if (!_.isEmpty(prices))
    //         prices.forEach((varient) => {
    //           sold += varient.sold;
    //         });
    //     });
    //   category.sold = sold;
    // });
    categories.forEach((category) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        category.resourceBundle
      );
      category.name = i18nResourceBundle.name;
      delete category.resourceBundle;
    });

    brands.forEach((brand) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        brand.resourceBundle
      );
      brand.name = i18nResourceBundle.name;
      delete brand.resourceBundle;
    });
    return res.json({
      userCount,
      orderCount,
      categories,
      brands,
      // categoryWiseProducts,
      // brandWiseProducts,
    });
  } catch (error) {
    console.log("Server Error in report.getReportData", error);
    return res.status(500).send("Server Error in report.getReportData");
  }
};

exports.getDeliveryBoyReport = async (req, res) => {
  try {
    const response = {};
    const query = { delivery_boy_id: req.user._id, order_status: "completed" };
    const completedDelivery = await Order.count(query);
    response.completedDelivery = completedDelivery;
    query.order_status = "confirmed";
    const pendingDelivery = await Order.count(query);
    response.pendingDelivery = pendingDelivery;
    return res.json(response);
  } catch (error) {
    console.log("Server Error in report.getDeliveryBoyReport", error);
    return res.status(500).send("Server Error in report.getDeliveryBoyReport");
  }
};

exports.getSellerReport = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.shop_id);
    if (_.isEmpty(shop))
      return res.json({ err: "Couldn't find the shop of the seller" });
    const response = { totalSale: 0, earnings: 0, successfulOrders: 0 };
    const query = { created_by_id: req.user._id };
    const totalProducts = await Product.count(query);
    response.products = totalProducts;
    const products = await Product.find(query);
    if (!_.isEmpty(products)) {
      let totalSale = 0;
      products.forEach((product) => {
        if (!_.isEmpty(product.prices)) {
          product.prices.forEach((varient) => {
            if (!_.isEmpty(varient.sold)) {
              varient.sold.forEach((singleSold) => {
                totalSale += singleSold.quantity;
              });
            }
            // totalSale += varient.sold;
          });
        }
      });
      response.totalSale = totalSale;
      const productIds = products.map((product) => product._id);
      const orders = await Order.find({
        order_status: "completed",
        "products.product_id": { $in: productIds },
      });
      const ordersCount = await Order.count({
        order_status: "completed",
        "products.product_id": { $in: productIds },
      });
      // response.pendingOrders = await Order.count({
      //   order_status: "confirmed",
      //   "products.product_id": { $in: productIds },
      // });
      // response.cancelledOrders = await Order.count({
      //   order_status: "cancelled",
      //   "products.product_id": { $in: productIds },
      // });
      // response.totalOrders = await Order.count({
      //   "products.product_id": { $in: productIds },
      // });
      response.successfulOrders = ordersCount;
      if (!_.isEmpty(orders)) {
        let earnings = 0;
        orders.forEach((order) => {
          if (!_.isEmpty(order.products)) {
            order.products.forEach((product) => {
              if (productIds.inlcudes(prodcut.product_id)) {
                if (!_.isEmpty(product.discount_type)) {
                  if (product.discount_type == "percent") {
                    let discountedAmount =
                      product.cost - 0.01 * product.discount * product.cost;
                    earnings +=
                      product.quantity *
                      (discountedAmount -
                        0.01 * discountedAmount * shop.commission_per_product);
                  } else {
                    let discountedAmount = product.cost - product.discount;
                    earnings +=
                      product.quantity *
                      (discountedAmount -
                        0.01 * discountedAmount * shop.commission_per_product);
                  }
                } else {
                  earnings +=
                    product.quantity *
                    (product.cost -
                      0.01 * product.cost * shop.commission_per_product);
                }
              }
            });
          }
        });
        response.earnings = earnings;
      }
    }

    return res.json(response);
  } catch (error) {
    console.log("Server Error in report.getDeliveryBoyReport", error);
    return res.status(500).send("Server Error in report.getDeliveryBoyReport");
  }
};
