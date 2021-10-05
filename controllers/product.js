const { Product, validate } = require("../models/product");
const _ = require("lodash");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const fs = require("fs");
const { Category } = require("../models/category");
const csv = require("csv");
const async = require("async");

const common = require("../common/common");
const { Order } = require("../models/order");
const { Flash } = require("../models/flash");
const { Review } = require("../models/review");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.createProduct = async (req, res) => {
  // console.log("files", req.files);
  // return;
  const { error } = validate(req.body);
  //   if (error) return res.status(400).json({ err: error.details[0].message });
  if (!_.isEmpty(req.body.category_id)) {
    const category = await common.categoryCheck(req.body.category_id);
    if (category.error) {
      deleteUploadedFiles(req.files);
      return res.status(category.statusCode || 400).json({
        err: category.msg || "Error in category check",
      });
    }
  }

  if (!_.isEmpty(req.body.brand_id)) {
    const brand = await common.brandCheck(req.body.brand_id);
    if (brand.error) {
      deleteUploadedFiles(req.files);
      return res.status(brand.statusCode || 400).json({
        err: brand.msg || "Error in brand check",
      });
    }
  }
  if (error) {
    deleteUploadedFiles(req.files);
    return res.status(400).json({ err: error.details[0].message });
  }

  const newProduct = new Product({
    resourceBundle: req.body.resourceBundle,
    category_id: req.body.category_id,
    // brand_id: req.body.brand_id,
    prices: req.body.prices,
    shipping_config: req.body.shipping_config,
  });

  if (!_.isEmpty(req.body.item_code)) newProduct.item_code = req.body.item_code;
  if (!_.isEmpty(req.body.color_array))
    newProduct.color_array = req.body.color_array;
  if (!_.isEmpty(req.body.attribute_array))
    newProduct.attribute_array = req.body.attribute_array;
  if (!_.isEmpty(req.body.attribute_value_object))
    newProduct.attribute_value_object = req.body.attribute_value_object;
  if (!_.isEmpty(req.body.brand_id)) newProduct.brand_id = req.body.brand_id;
  if (!_.isEmpty(req.body.unit)) newProduct.unit = req.body.unit;
  if (!_.isEmpty(req.body.minimum_purchase_quantity))
    newProduct.minimum_purchase_quantity = req.body.minimum_purchase_quantity;
  if (!_.isEmpty(req.body.tags)) {
    let tagArray = req.body.tags.split(",");
    tagArray = tagArray.filter((item) => item.trim());
    if (!_.isEmpty(tagArray)) newProduct.tags = tagArray;
  }
  if (!_.isEmpty(req.body.low_stock_warning))
    newProduct.low_stock_warning = req.body.low_stock_warning;
  if (!_.isEmpty(req.body.product_video_url))
    newProduct.product_video_url = req.body.product_video_url;
  if (!_.isUndefined(req.body.stock_visible))
    newProduct.stock_visible = req.body.stock_visible;
  if (!_.isEmpty(req.body.shipping_cost))
    newProduct.shipping_cost = req.body.shipping_cost;
  if (!_.isUndefined(req.body.product_quantity_multiply))
    newProduct.product_quantity_multiply = req.body.product_quantity_multiply;
  if (!_.isUndefined(req.body.cash_on_delivery))
    newProduct.cash_on_delivery = req.body.cash_on_delivery;
  if (!_.isUndefined(req.body.featured))
    newProduct.featured = req.body.featured;
  if (!_.isUndefined(req.body.todays_deal))
    newProduct.todays_deal = req.body.todays_deal;
  if (!_.isUndefined(req.body.publish)) newProduct.publish = req.body.publish;
  if (req.user.user_type === "seller") newProduct.publish = false;
  if (!_.isEmpty(req.body.shipping_time))
    newProduct.shipping_time = req.body.shipping_time;
  if (!_.isEmpty(req.body.vat_tax)) newProduct.vat_tax = req.body.vat_tax;
  if (
    req.user.user_type == "admin" ||
    req.user.user_type == "org_admin" ||
    req.user.user_type == "super_admin"
  ) {
    newProduct.created_by = "admin";
    newProduct.shop_id = null;
  } else if (req.user.user_type == "seller") {
    newProduct.created_by = "seller";
    newProduct.shop_id = req.user.shop_id;
  }
  newProduct.created_by_id = req.user._id;
  //Rating not set while creating
  //   if (!_.isEmpty(req.body.rating)) newProduct.rating = req.body.rating;

  if (req.files && !_.isEmpty(req.files.product_image_big)) {
    newProduct.product_image_big_url = req.files.product_image_big.map(
      (bigImage) => bigImage.path
    );
  }
  // newProduct.product_image_big_url = req.files.product_image_big[0].path;
  if (req.files && req.files.product_image_small)
    newProduct.product_image_small_url = req.files.product_image_small[0].path;
  // if (req.files && req.files.product_video)
  //   newProduct.product_video_url = req.files.product_video[0].path;
  try {
    await newProduct.save();
    if (!_.isEmpty(req.body.flash)) {
      await updateFlash(req.body.flash, newProduct._id);
    }
    res.send(newProduct);
  } catch (error) {
    console.log("Server Error in product.createProduct", error);
    res.status(500).json({ err: "Server Error in product.createProduct" });
  }
};

exports.listProducts = async (req, res) => {
  let query = {};
  let sort = { createdAt: 1 };
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["resourceBundle.name"] = {
      $regex: req.query.search,
      $options: "i",
    };
  }
  if (req.query.user_type == "user") {
    query["publish"] = true;
  }
  if (!_.isUndefined(req.query.featured)) {
    query["featured"] = req.query.featured;
  }
  if (!_.isUndefined(req.query.todays_deal)) {
    query["todays_deal"] = req.query.todays_deal;
  }
  if (!_.isEmpty(req.query.category_id)) {
    if (!mongoose.Types.ObjectId.isValid(req.query.category_id))
      return res.status(404).json({ msg: "Invalid category Id" });
    query["category_id"] = req.query.category_id;
  }
  if (!_.isEmpty(req.query.brand_id)) {
    if (!mongoose.Types.ObjectId.isValid(req.query.brand_id))
      return res.status(404).json({ msg: "Invalid brand Id" });
    query["brand_id"] = req.query.brand_id;
  }
  if (!_.isEmpty(req.query.created_by)) {
    query["created_by"] = req.query.created_by;
  }
  if (!_.isEmpty(req.query.shop_id)) {
    query["shop_id"] = req.query.shop_id;
  }
  if (!_.isEmpty(req.query.sort_by)) {
    switch (req.query.sort_by) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "price_low_to_high":
        sort = { "prices.unit_price": 1 };
        break;
      case "price_high_to_low":
        sort = { "prices.unit_price": -1 };
        break;
      default:
        return res.status(404).json({ msg: "Invalid sort value" });
    }
  }

  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const productCount = await Product.count(query);
    const allProducts = await Product.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort(sort)
      .select("-__v")
      .lean();
    if (_.isEmpty(allProducts)) return res.json({ msg: "No products found" });
    allProducts.forEach((product) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        product.resourceBundle
      );
      product.i18nResourceBundle = i18nResourceBundle;
      // delete product.resourceBundle;
    });
    await Promise.all(
      allProducts.map(async (product) => {
        product.rating = 4;
        let reviews = [];
        try {
          reviews = await Review.find({
            product_id: product._id,
            publish: true,
          });
        } catch (error) {
          console.log(
            "Error while fetching reviews in product.listProducts",
            error
          );
          return res.send(500).json({
            err: "Error  while fetching reviews in product.listProducts",
          });
        }
        if (!_.isEmpty(reviews)) {
          let totalRatings = 0;
          let ratingSum = reviews.reduce((sum, singleReview) => {
            totalRatings++;
            return sum + singleReview.rating;
          }, 0);
          product.rating = ratingSum / totalRatings;
        }
        //needed only for admin dashboard, not need to send to user
        if (req.query.user_type !== "user" && !_.isEmpty(product.prices)) {
          let totalSale = product.prices.reduce((sum, singleVarient) => {
            // totalRatings++;
            let varientSum = 0;
            if (!_.isEmpty(singleVarient.sold)) {
              singleVarient.sold.forEach((singleSold) => {
                varientSum += singleSold.quantity;
              });
            }
            return sum + varientSum;
          }, 0);
          let base_price_object = product.prices.reduce((prev, curr) => {
            return prev.unit_price < curr.unit_price ? prev : curr;
          });
          let varient_stock = product.prices.map((varient) => {
            if (varient.varient_value) {
              return {
                varient_value: varient.varient_value,
                quantity: varient.quantity,
              };
            }
          });
          if (_.isEmpty(varient_stock))
            varient_stock = [
              {
                varient_value: "default",
                quantity: product.prices[0].quantity,
              },
            ];
          product.num_of_sale = totalSale;
          product.varient_stock = varient_stock;
          product.base_price = base_price_object.unit_price;
        }
        let queryForFlash = {
          "duration.from": { $lte: new Date() },
          "duration.to": { $gt: new Date() },
          "products.product_id": product._id,
          status: true,
        };
        //sort descending , so there are multiple flashs created last one picked
        const flashExists = await Flash.findOne(queryForFlash).sort(
          "-createdAt"
        );
        if (flashExists) {
          const productInFlash = flashExists.products.find((flashProduct) =>
            flashProduct.product_id.equals(product._id)
          );
          product.flash = {
            flash_id: flashExists._id,
            discount_amount: productInFlash.discount,
            discount_type: productInFlash.discount_type,
          };
        }
      })
    );
    // res.send(allProducts);
    return res.json({
      products: allProducts,
      info: {
        totalNumber: productCount,
        hasNextPage: ITEMS_PER_PAGE * page < productCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(productCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in product.getProducts", error);
    return res.status(500).send("Server Error in product.getProducts");
  }
};

exports.getSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).select("-__v").lean();

  if (!product)
    return res
      .status(404)
      .json({ err: "The product with the given ID was not found." });

  product.rating = 4;
  let reviews = [];
  try {
    reviews = await Review.find({
      product_id: product._id,
      publish: true,
    });
  } catch (error) {
    console.log(
      "Error while fetching reviews in product.getSingleProduct",
      error
    );
    return res.send(500).json({
      err: "Error  while fetching reviews in product.getSingleProduct",
    });
  }
  if (!_.isEmpty(reviews)) {
    let totalRatings = 0;
    let ratingSum = reviews.reduce((sum, singleReview) => {
      totalRatings++;
      return sum + singleReview.rating;
    }, 0);
    product.rating = ratingSum / totalRatings;
  }
  const queryForFlash = {
    "duration.from": { $lte: new Date() },
    "duration.to": { $gt: new Date() },
    status: true,
    "products.product_id": req.params.id,
  };
  // console.log(queryForFlash, new Date());

  const flashExists = await Flash.findOne(queryForFlash).sort("-createdAt");
  if (flashExists) {
    const productInFlash = flashExists.products.find((product) =>
      product.product_id.equals(req.params.id)
    );
    product.flash = {
      flash_id: flashExists._id,
      discount_amount: productInFlash.discount,
      discount_type: productInFlash.discount_type,
    };
  }

  res.send(product);
};

exports.deleteProduct = async (req, res) => {
  try {
    const productExist = await Product.findOne({ _id: req.params.id });
    if (!productExist)
      return res
        .status(404)
        .json({ err: "The product with the given ID was not found." });

    const ExistsInOrder = await Order.find({
      "products.product_id": req.params.id,
      $or: [{ order_status: "open" }, { order_status: "confirmed" }],
    });

    if (!_.isEmpty(ExistsInOrder)) {
      return res.status(400).json({
        err: "Can't delete, there are incompleted orders with the product",
      });
    }

    const ExistsInFalsh = await Flash.find({
      "products.product_id": req.params.id,
    });

    if (!_.isEmpty(ExistsInFalsh)) {
      return res.status(400).json({
        err: "Can't delete, please remove the product from flash deals first",
      });
    }
    // return;

    if (req.user.user_type === "seller") {
      if (!productExist.created_by_id.equals(req.user._id)) {
        return res
          .status(400)
          .json({ err: "You are not authorized to delete this product" });
      }
    }
    // return;

    const product = await Product.findByIdAndRemove(req.params.id);

    if (!_.isEmpty(product.product_image_big_url)) {
      product.product_image_big_url.forEach((bigImage) => {
        if (fs.existsSync(bigImage)) fs.unlinkSync(bigImage);
      });
    }
    if (
      product.product_image_small_url &&
      fs.existsSync(product.product_image_small_url)
    )
      fs.unlinkSync(product.product_image_small_url);

    if (product.product_video_url && fs.existsSync(product.product_video_url))
      fs.unlinkSync(product.product_video_url);

    res.send(product);
  } catch (error) {
    console.log("Server Error in product.deleteProduct", error);
    return res
      .status(400)
      .json({ err: "Server Error in product.deleteProduct" });
  }
};

exports.updateProduct = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.files) return res.json({ err: "Empty body" });
  }
  const { error } = validateProduct(req.body);
  if (!_.isEmpty(req.body.category_id)) {
    const category = await common.categoryCheck(req.body.category_id);
    if (category.error) {
      deleteUploadedFiles(req.files);
      return res.status(category.statusCode || 400).json({
        err: category.msg || "Error in category check",
      });
    }
  }
  if (!_.isEmpty(req.body.brand_id)) {
    const brand = await common.brandCheck(req.body.brand_id);
    if (brand.error) {
      deleteUploadedFiles(req.files);
      return res.status(brand.statusCode || 400).json({
        err: brand.msg || "Error in brand check",
      });
    }
  }
  if (error) {
    deleteUploadedFiles(req.files);
    return res.status(400).json({ err: error.details[0].message });
  }

  if (req.user.user_type === "seller" && !_.isUndefined(req.body.publish)) {
    return res
      .status(400)
      .json({ err: "You are not authorized to update 'Published'" });
  }

  const productContent = {};
  const currentProduct = await Product.findOne({ _id: req.params.id });
  if (!currentProduct)
    return res.json({ err: "Product with the given id not found" });

  if (req.user.user_type === "seller") {
    if (!currentProduct.created_by_id.equals(req.user._id)) {
      deleteUploadedFiles(req.files);
      return res
        .status(400)
        .json({ err: "You are not authorized to update this product" });
    }
  }

  if (!_.isEmpty(req.body.resourceBundle)) {
    productContent.resourceBundle = req.body.resourceBundle;
  }
  if (!_.isEmpty(req.body.category_id)) {
    productContent.category_id = req.body.category_id;
  }
  if (!_.isEmpty(req.body.brand_id)) {
    productContent.brand_id = req.body.brand_id;
  }
  if (!_.isEmpty(req.body.prices)) {
    let currentPrices = currentProduct.prices;
    let newPrices = req.body.prices;
    let finalPriceArray = [];
    let currentVarientIds = currentPrices.map((varient) =>
      varient._id.toString()
    );
    let newVarientWithIds = newPrices
      .map((varient) => varient._id)
      .filter((item) => item);
    let varientIdsToDelete = _.difference(currentVarientIds, newVarientWithIds);

    if (!_.isEmpty(varientIdsToDelete)) {
      const ExistsInOrder = await Order.find({
        "products.product_id": req.params.id,
        "products.varient_id": { $in: varientIdsToDelete },
        order_status: { $in: ["open", "confirmed"] },
      });

      // console.log(ExistsInOrder)
      if (!_.isEmpty(ExistsInOrder))
        return res.json({
          err: "Cannot delete product varients, it has incompleted orders",
        });
    }
    // console.log(currentVarientIds,newVarientWithIds,varientIdsToDelete);
    // return;

    try {
      await Promise.all(
        newPrices.map(async (newPrice) => {
          //new varients won't have id
          if (newPrice._id) {
            let currentPrice = currentPrices.find((currentPrice) =>
              currentPrice._id.equals(newPrice._id)
            );
            if (_.isEmpty(currentPrice)) {
              throw {
                err: `There is not product varient with id ${newPrice._id}`,
              };
            }
            if (
              currentPrice.unit_price != newPrice.unit_price ||
              // currentPrice.varient_name != newPrice.varient_name ||
              currentPrice.varient_value != newPrice.varient_value
            ) {
              // console.log("current",currentPrice,"kneew",newPrice);
              //Check if there is any order with status open
              // try {
              const ExistsInOrder = await Order.find({
                "products.product_id": req.params.id,
                "products.varient_id": currentPrice._id,
                order_status: "open",
              });
              if (!_.isEmpty(ExistsInOrder)) {
                throw {
                  err: "Can't Update Price, Varient name or Varient value, there are opened orders with the product",
                };
              }

              // } catch (error) {
              //   console.log("Server Error in product.updateProduct ",error);
              //   return res.json({err:"Server Error in product.updateProduct"})
              // }
            }
          }
          finalPriceArray.push(newPrice);
        })
      );
    } catch (error) {
      return res.status(400).json(error);
    }
    productContent.prices = finalPriceArray;
    // console.log("in 4", finalPriceArray);

    // return;
    // const ExistsInOrder = await Order.find({
    //   "products.product_id": req.params.id,
    //   $or: [{ order_status: "open" }, { order_status: "confirmed" }],
    // });

    // if (!_.isEmpty(ExistsInOrder)) {
    //   return res.status(400).json({
    //     err: "Can't delete, there are incompleted orders with the product",
    //   });
    // }
    // productContent.prices = req.body.prices;
  }
  if (!_.isEmpty(req.body.shipping_config)) {
    productContent.shipping_config = req.body.shipping_config;
  }

  if (!_.isEmpty(req.body.item_code))
    productContent.item_code = req.body.item_code;
  if (!_.isEmpty(req.body.unit)) productContent.unit = req.body.unit;
  if (!_.isEmpty(req.body.color_array))
    productContent.color_array = req.body.color_array;
  if (!_.isEmpty(req.body.attribute_array))
    productContent.attribute_array = req.body.attribute_array;
  if (!_.isEmpty(req.body.attribute_value_object))
    productContent.attribute_value_object = req.body.attribute_value_object;
  if (!_.isEmpty(req.body.brand_id))
    productContent.brand_id = req.body.brand_id;
  if (!_.isEmpty(req.body.minimum_purchase_quantity))
    productContent.minimum_purchase_quantity =
      req.body.minimum_purchase_quantity;
  if (!_.isEmpty(req.body.tags)) {
    let tagArray = req.body.tags.split(",");
    tagArray = tagArray.filter((item) => item.trim());
    if (!_.isEmpty(tagArray)) productContent.tags = tagArray;
  }
  if (!_.isEmpty(req.body.low_stock_warning))
    productContent.low_stock_warning = req.body.low_stock_warning;
  if (!_.isEmpty(req.body.product_video_url))
    productContent.product_video_url = req.body.product_video_url;
  if (!_.isUndefined(req.body.stock_visible))
    productContent.stock_visible = req.body.stock_visible;
  if (!_.isEmpty(req.body.shipping_cost))
    productContent.shipping_cost = req.body.shipping_cost;
  if (!_.isUndefined(req.body.product_quantity_multiply))
    productContent.product_quantity_multiply =
      req.body.product_quantity_multiply;
  if (!_.isUndefined(req.body.cash_on_delivery))
    productContent.cash_on_delivery = req.body.cash_on_delivery;
  if (!_.isUndefined(req.body.featured))
    productContent.featured = req.body.featured;
  if (!_.isUndefined(req.body.todays_deal))
    productContent.todays_deal = req.body.todays_deal;
  if (!_.isUndefined(req.body.publish))
    productContent.publish = req.body.publish;
  if (!_.isEmpty(req.body.shipping_time))
    productContent.shipping_time = req.body.shipping_time;
  if (!_.isEmpty(req.body.vat_tax)) productContent.vat_tax = req.body.vat_tax;

  if (!_.isEmpty(req.files.product_image_big)) {
    if (
      !_.isEmpty(currentProduct.product_image_big_url)
      //  &&
      // fs.existsSync(currentProduct.product_image_big_url)
    ) {
      currentProduct.product_image_big_url.forEach((bigImage) => {
        if (fs.existsSync(bigImage)) fs.unlinkSync(bigImage);
      });
    }
    productContent.product_image_big_url = req.files.product_image_big.map(
      (bigImage) => bigImage.path
    );
  }
  if (!_.isEmpty(req.files.product_image_small)) {
    if (
      currentProduct.product_image_small_url &&
      fs.existsSync(currentProduct.product_image_small_url)
    )
      fs.unlinkSync(currentProduct.product_image_small_url);
    productContent.product_image_small_url =
      req.files.product_image_small[0].path;
  }
  if (!_.isEmpty(req.files.product_video)) {
    if (
      currentProduct.product_video_url &&
      fs.existsSync(currentProduct.product_video_url)
    )
      fs.unlinkSync(currentProduct.product_video_url);
    productContent.product_video_url = req.files.product_video[0].path;
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productContent,
      { new: true }
    );
    if (!_.isEmpty(req.body.flash)) {
      await updateFlash(req.body.flash, req.params.id);
    }

    res.send(product);
  } catch (error) {
    console.log("Server Error in product.updateProduct", error);
    res.status(500).json({ err: "Server Error in product.updateProduct" });
  }
};

exports.loadProductDataFromCSV = function (req, res, next) {
  let file = req.file;

  if (_.isEmpty(file)) {
    console.log("error", "No file in request. Aborting.");
    return res.status(400).end({
      err: "No file in request. Aborting.",
    });
  }

  let fileNameWithPath = file.path;
  req.fileNameWithPath = fileNameWithPath; //This will be used later to remove this file

  // Using the first line of the CSV data to discover the column names
  let rs = fs.createReadStream(fileNameWithPath);
  let parser = csv.parse(
    {
      columns: true,
    },
    function (err, data) {
      if (err) {
        console.error(
          "Error in loadProductsdateFromCSV during productBulkUpload. ",
          err
        );
        return res.status(400).send({
          err:
            "Error in loadProductsdateFromCSV during productBulkUpload  " + err,
        });
      }
      if (data.length < 1) {
        //Either empty or just header present
        console.error("The input records either empty or contain only headers");
        return res.status(400).send({
          err: "The input records either empty or contain only headers",
        });
      } else {
        req.recordArray = data;
        next();
      }
    }
  );
  rs.pipe(parser);
};

const checkNull = (value) => {
  if (!value) {
    return true;
  } else {
    if (_.isEmpty(value.trim())) {
      return true;
    }
    return false;
  }
};

exports.ProductBulkUpload = async (req, res, next) => {
  // console.log("Array.............", req.recordArray);
  // return res.json({ arr: req.recordArray });
  req.newTags = [];
  let recordArray = req.recordArray;
  let recordKeys = _.keys(recordArray[0]);
  // let userUploadLog = req.userUploadLog;
  let mandatoryKeys = [
    // "Id",
    "Name",
    "Language",
    "Category Id",
    // "Brand Id",
    // "Varient Name 1",
    "Varient Value 1",
    "Varient Price 1",
    "Varient Quantity 1",
    // "Varient SKU 1",
    // "Varient Name 2",
    // "Varient Value 2",
    // "Varient Price 2",
    // "Varient Quantity 2",
    // "Varient SKU 2",
    // "Varient Name 3",
    // "Varient Value 3",
    // "Varient Price 3",
    // "Varient Quantity 3",
    // "Varient SKU 3",
    "Shipping Type",
    // "Shipping Cost",
    // "Product Quantity Multiply",
    // "Low Stock Warning",
    // "Stock Visible",
    // "Cash On Delivery",
    // "Featured",
    // "Today's Deal",
    // "Publish",
    // "Shipping Time",
    // "Description",
    // "Modal Name",
    // "Manufactured By",
    // "Manufacturing Country",
    // "Unit",
    // "Minimum Purchase Quantity",
    // "Tags",
    // "Small Image URL",
    // "Big Image URL",
    // "Video URL",
  ];
  if (!_.isEmpty(_.difference(mandatoryKeys, recordKeys))) {
    // console.info('Input keys are: ', JSON.stringify(recordKeys));
    // console.info('validRecordKeys', JSON.stringify(validRecordKeys));
    console.log(
      "error",
      "Please check column header. Mandatory columns are " +
        JSON.stringify(mandatoryKeys)
    );
    return res.status(400).json({
      err:
        "Please check column header.It should have these following fields " +
        JSON.stringify(mandatoryKeys),
    });
  }

  //this is to update product a product by product ID
  // let isProductIdExist = false;
  // if(_.includes(recordKeys, 'Product ID')){
  //   isProductIdExist = true;
  // }
  // req.isProductIdExist = isProductIdExist;

  // req.validatedProducts = [];
  let recordId = 0;
  const validationArray = [];
  // async.eachSeries(
  //   recordArray,
  //   async (record, asyncRecordCallback) => {
  try {
    await Promise.all(
      recordArray.map(async (record) => {
        // console.log("asdks", asyncRecordCallback());
        // let division = req.body.selectDivision;
        let name = record["Name"] ? record["Name"].trim() : record["Name"];
        let language = record["Language"]
          ? record["Language"].trim()
          : record["Language"];
        let category_id = record["Category Id"]
          ? record["Category Id"].trim()
          : record["Category Id"];
        let brand_id = record["Brand Id"]
          ? record["Brand Id"].trim()
          : record["Brand Id"];
        let varient_value_1 = record["Varient Value 1"]
          ? record["Varient Value 1"].trim()
          : record["Varient Value 1"];
        let varient_price_1 = record["Varient Price 1"]
          ? record["Varient Price 1"].trim()
          : record["Varient Price 1"];
        let varient_quantity_1 = record["Varient Quantity 1"]
          ? record["Varient Quantity 1"].trim()
          : record["Varient Quantity 1"];
        let shipping_config = record["Shipping Type"]
          ? record["Shipping Type"].trim()
          : record["Shipping Type"];
        let productId = record["Id"] ? record["Id"].trim() : record["Id"];
        // let distractors = record["Distractors"];
        // let feedback = record['Feedback'];
        // let language = record['Language'];
        // let languageCode = '';
        // let productLanguage = '';
        recordId++;
        const validationObject = { recordId };
        validationObject.messages = [];

        // Check Null for Fields
        if (_.isEmpty(name)) {
          validationObject.messages.push("Name column value cannot be blank");
        }
        if (_.isEmpty(language)) {
          validationObject.messages.push(
            "Language column value cannot be blank"
          );
        }
        if (_.isEmpty(category_id)) {
          validationObject.messages.push(
            "Category Id column value cannot be blank"
          );
        }
        // if (_.isEmpty(brand_id)) {
        //   validationObject.messages.push(
        //     "Brand Id column value cannot be blank"
        //   );
        // }
        if (_.isEmpty(varient_value_1)) {
          validationObject.messages.push(
            "Varient Value 1 column value cannot be blank"
          );
        }
        if (_.isEmpty(varient_quantity_1)) {
          validationObject.messages.push(
            "Varient Quantity 1 column value cannot be blank"
          );
        }
        if (_.isEmpty(varient_price_1)) {
          validationObject.messages.push(
            "Varient Price 1 column value cannot be blank"
          );
        }
        if (_.isEmpty(shipping_config)) {
          validationObject.messages.push(
            "Shipping Type column value cannot be blank"
          );
        }
        validationArray.push(validationObject);
        if (!_.isEmpty(category_id)) {
          const category = await common.categoryCheck(category_id);
          if (category.error) {
            validationObject.messages.push(category.msg);
          }
        }
        if (!_.isEmpty(brand_id)) {
          const brand = await common.brandCheck(brand_id);
          if (brand.error) {
            validationObject.messages.push(brand.msg);
          }
        }
        if (!_.isEmpty(language)) {
          let lang = ["en", "ar"];
          if (!lang.includes(language)) {
            validationObject.messages.push("Language Should be ar or en");
          }
        }
        // if (!_.isEmpty(varient_name_1)) {
        //   let varient_names = ["color", "size", "default"];
        //   if (!varient_names.includes(varient_name_1)) {
        //     validationObject.messages.push(
        //       "Varient Name Should be color, size or default"
        //     );
        //   }
        // }
        if (!_.isEmpty(varient_price_1)) {
          if (isNaN(varient_price_1))
            validationObject.messages.push("Price Must be a number");
        }
        if (!_.isEmpty(varient_quantity_1)) {
          if (isNaN(varient_quantity_1))
            validationObject.messages.push("Quantity Must be a number");
        }
        if (_.isEmpty(shipping_config)) {
          let config_names = ["free", "flat_rate"];
          if (!config_names.includes(shipping_config)) {
            validationObject.messages.push(
              "Shipping Type Should be free or flat_rate"
            );
          }
        }
        if (!_.isEmpty(productId)) {
          const product = await common.productCheck(productId);
          if (product.error) {
            validationObject.messages.push(product.msg);
          }
        }
        // if (!_.isEmpty(validationObject.messages)) return false;

        //saving or updating the single product in the db

        // let varient_value_1 = record["Varient Value 1"]
        //     ? record["Varient Value 1"].trim()
        //     : record["Varient Value 1"],
        let varient_sku_1 = record["Varient SKU 1"]
            ? record["Varient SKU 1"].trim()
            : record["Varient SKU 1"],
          // varient_name_2 = record["Varient Name 2"]
          //   ? record["Varient Name 2"].trim()
          //   : record["Varient Name 2"],
          varient_value_2 = record["Varient Value 2"]
            ? record["Varient Value 2"].trim()
            : record["Varient Value 2"],
          varient_price_2 = record["Varient Price 2"]
            ? record["Varient Price 2"].trim()
            : record["Varient Price 2"],
          varient_quantity_2 = record["Varient Quantity 2"]
            ? record["Varient Quantity 2"].trim()
            : record["Varient Quantity 2"],
          varient_sku_2 = record["Varient SKU 2"]
            ? record["Varient SKU 2"].trim()
            : record["Varient SKU 2"],
          // varient_name_3 = record["Varient Name 3"]
          //   ? record["Varient Name 3"].trim()
          //   : record["Varient Name 3"],
          varient_value_3 = record["Varient Value 3"]
            ? record["Varient Value 3"].trim()
            : record["Varient Value 3"],
          varient_price_3 = record["Varient Price 3"]
            ? record["Varient Price 3"].trim()
            : record["Varient Price 3"],
          varient_quantity_3 = record["Varient Quantity 3"]
            ? record["Varient Quantity 3"].trim()
            : record["Varient Quantity 3"],
          varient_sku_3 = record["Varient SKU 3"]
            ? record["Varient SKU 3"].trim()
            : record["Varient SKU 3"],
          shipping_cost = record["Shipping Cost"]
            ? record["Shipping Cost"].trim()
            : record["Shipping Cost"],
          product_quantity_multiply = record["Product Quantity Multiply"]
            ? record["Product Quantity Multiply"].trim()
            : record["Product Quantity Multiply"],
          low_stock_warning = record["Low Stock Warning"]
            ? record["Low Stock Warning"].trim()
            : record["Low Stock Warning"],
          stock_visible = record["Stock Visible"]
            ? record["Stock Visible"].trim()
            : record["Stock Visible"],
          cash_on_delivery = record["Cash On Delivery"]
            ? record["Cash On Delivery"].trim()
            : record["Cash On Delivery"],
          featured = record["Featured"]
            ? record["Featured"].trim()
            : record["Featured"],
          todays_deal = record["Today's Deal"]
            ? record["Today's Deal"].trim()
            : record["Today's Deal"],
          publish = record["Publish"]
            ? record["Publish"].trim()
            : record["Publish"],
          shipping_time = record["Shipping Time"]
            ? record["Shipping Time"].trim()
            : record["Shipping Time"],
          description = record["Description"]
            ? record["Description"].trim()
            : record["Description"],
          modal_name = record["Modal Name"]
            ? record["Modal Name"].trim()
            : record["Modal Name"],
          manufactured_by = record["Manufactured By"]
            ? record["Manufactured By"].trim()
            : record["Manufactured By"],
          manufacturing_country = record["Manufacturing Country"]
            ? record["Manufacturing Country"].trim()
            : record["Manufacturing Country"],
          unit = record["Unit"] ? record["Unit"].trim() : record["Unit"],
          minimum_purchase_quantity = record["Minimum Purchase Quantity"]
            ? record["Minimum Purchase Quantity"].trim()
            : record["Minimum Purchase Quantity"],
          tags = record["Tags"] ? record["Tags"].trim() : record["Tags"],
          product_image_small_url = record["Small Image URL"]
            ? record["Small Image URL"].trim()
            : record["Small Image URL"],
          product_image_big_url = record["Big Image URL"]
            ? record["Big Image URL"].trim()
            : record["Big Image URL"],
          product_video_url = record["Video URL"]
            ? record["Video URL"].trim()
            : record["Video URL"],
          product_id = record["Id"] ? record["Id"].trim() : record["Id"];
        // keys;

        let resourceBundle = [];
        let resourceBundleObject = {
          languageCode: language,
          name,
        };
        if (!_.isEmpty(description)) {
          resourceBundleObject.description = description;
        }
        if (!_.isEmpty(modal_name)) {
          resourceBundleObject.modal_name = modal_name;
        }
        if (!_.isEmpty(manufactured_by)) {
          resourceBundleObject.manufactured_by = manufactured_by;
        }
        if (!_.isEmpty(manufacturing_country)) {
          resourceBundleObject.manufacturing_country = manufacturing_country;
        }
        resourceBundle.push(resourceBundleObject);

        let prices = [];
        let priceObject = {};
        if (
          !_.isEmpty(varient_value_1) &&
          !_.isEmpty(varient_price_1) &&
          !_.isEmpty(varient_quantity_1)
        )
          priceObject = {
            varient_value: varient_value_1,
            unit_price: varient_price_1,
            quantity: varient_quantity_1,
            // varient_value: 0,
          };
        if (!_.isEmpty(varient_sku_1)) priceObject.sku = varient_sku_1;
        // if (!_.isEmpty(varient_value_1))
        //   priceObject.varient_value = varient_value_1;

        prices.push(priceObject);

        if (
          !_.isEmpty(varient_value_2) &&
          !_.isEmpty(varient_price_2) &&
          !_.isEmpty(varient_quantity_2)
        ) {
          let priceObject2 = {
            varient_value: varient_value_2,
            unit_price: varient_price_2,
            quantity: varient_quantity_2,
          };
          if (!_.isEmpty(varient_sku_2)) priceObject2.sku = varient_sku_2;
          // if (!_.isEmpty(varient_value_2))
          //   priceObject2.varient_value = varient_value_2;

          prices.push(priceObject2);
        }

        if (
          !_.isEmpty(varient_value_3) &&
          !_.isEmpty(varient_price_3) &&
          !_.isEmpty(varient_quantity_3)
        ) {
          let priceObject3 = {
            varient_value: varient_value_3,
            unit_price: varient_price_3,
            quantity: varient_quantity_3,
          };
          if (!_.isEmpty(varient_sku_3)) priceObject3.sku = varient_sku_3;
          // if (!_.isEmpty(varient_value_3))
          //   priceObject3.varient_value = varient_value_3;

          prices.push(priceObject3);
        }

        // creating the product object for saving

        const productObject = {
          resourceBundle,
          category_id,
          // brand_id,
          prices,
          shipping_config,
        };

        // if (!_.isEmpty(req.body.item_code))
        //   newProduct.item_code = req.body.item_code;
        if (!_.isEmpty(unit)) productObject.unit = unit;
        if (!_.isEmpty(brand_id)) productObject.brand_id = brand_id;
        if (!_.isEmpty(minimum_purchase_quantity)) {
          if (isNaN(minimum_purchase_quantity))
            validationObject.messages.push(
              "Minimum Purchace Quantity Must be a number"
            );
          else
            productObject.minimum_purchase_quantity = minimum_purchase_quantity;
        }
        if (!_.isEmpty(publish) && req.user.user_type === "seller") {
          validationObject.messages.push(
            "You are not autherized to set Publish"
          );
        }
        if (!_.isEmpty(tags)) {
          let tagArray = tags.split(",");
          tagArray = tagArray.filter((item) => item.trim());
          if (!_.isEmpty(tagArray)) productObject.tags = tagArray;
        }
        if (!_.isEmpty(low_stock_warning))
          productObject.low_stock_warning = low_stock_warning;
        if (!_.isEmpty(stock_visible))
          productObject.stock_visible = stock_visible == "Yes" ? true : false;
        if (!_.isEmpty(shipping_cost))
          productObject.shipping_cost = shipping_cost;
        if (!_.isEmpty(product_quantity_multiply))
          productObject.product_quantity_multiply =
            product_quantity_multiply == "Yes" ? true : false;
        if (!_.isEmpty(cash_on_delivery))
          productObject.cash_on_delivery = cash_on_delivery ? true : false;
        if (!_.isEmpty(featured))
          productObject.featured = featured == "Yes" ? true : false;
        if (!_.isEmpty(todays_deal))
          productObject.todays_deal = todays_deal == "Yes" ? true : false;
        if (!_.isEmpty(publish))
          productObject.publish = publish == "Yes" ? true : false;
        if (!_.isEmpty(shipping_time))
          productObject.shipping_time = shipping_time;
        // if (!_.isEmpty(vat_tax)) productObject.vat_tax = vat_tax;
        if (
          req.user.user_type == "admin" ||
          req.user.user_type == "org_admin" ||
          req.user.user_type == "super_admin"
        ) {
          productObject.created_by = "admin";
          productObject.shop_id = null;
        } else if (req.user.user_type == "seller") {
          productObject.created_by = "seller";
          productObject.shop_id = req.user.shop_id;
        }
        productObject.created_by_id = req.user._id;

        if (!_.isEmpty(product_image_big_url))
          productObject.product_image_big_url = product_image_big_url;
        if (!_.isEmpty(product_image_small_url))
          productObject.product_image_small_url = product_image_small_url;
        if (!_.isEmpty(product_video_url))
          productObject.product_video_url = product_video_url;

        if (!_.isEmpty(validationObject.messages)) return false;

        if (!_.isEmpty(product_id)) {
          try {
            const product = await Product.findByIdAndUpdate(
              product_id,
              productObject,
              { new: true }
            );
            validationObject.updated = true;
          } catch (error) {
            console.log("error while updating product in bulkUpload " + error);
            throw {
              err: "error while updating product in bulkUpload " + error,
            };
          }
          // asyncRecordCallback();
        } else {
          try {
            const newProduct = new Product(productObject);
            await newProduct.save();
            validationObject.updated = false;

            // asyncRecordCallback();
          } catch (error) {
            console.log("error while saving product in bulkUpload " + error);
            throw {
              err: "error while saving product in bulkUpload " + error,
            };
          }
        }
      })
    );
  } catch (error) {
    return res.json(error);
  }

  if (req.fileNameWithPath && fs.existsSync(req.fileNameWithPath))
    fs.unlinkSync(req.fileNameWithPath);

  return res.send(validationArray);

  // }
  // function (err) {
  //   //End of async
  //   // if any of the file processing produced an error, err would equal that error
  //   if (err) {
  //     // One of the iterations produced an error.
  //     // All processing will now stop.
  //     console.log(
  //       "error",
  //       "A record failed to process :" + err
  //     );
  //     return res.json({err:"Server Error in Bulk Upload"})
  //   } else {
  //     // if (!_.isEmpty(req.validationErrors)) {
  //     //   //Let us group the validationErrors by recordId
  //     //   let groupedValidationErrors = _.groupBy(req.validationErrors, "id");
  //     //   let uploadedProductsLog = userUploadLog;
  //     //   uploadedProductsLog.validationErrors = groupedValidationErrors;
  //     //   uploadedProductsLog.uploadedUserList = null;
  //     //   userUploadLog.status = "Failed";
  //     //   userUploadLog.save(function (err) {
  //     //     if (err) {
  //     //       console.log("error", "A record failed:" + JSON.stringify(err));
  //     //     }
  //     //   });
  //     // } else {
  //     //   next();
  //     // }
  //     return res.send(validationArray);
  //   }
  // }
  // );
};

function validateProduct(product) {
  const schema = Joi.object({
    item_code: Joi.string(),
    resourceBundle: Joi.array().items(
      Joi.object({
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
        description: Joi.string(),
        modal_name: Joi.string(),
        manufactured_by: Joi.string(),
        manufacturing_country: Joi.string(),
      }).required()
    ),
    category_id: Joi.objectId(),
    brand_id: Joi.objectId(),

    unit: Joi.string(),
    minimum_purchase_quantity: Joi.number(),
    tags: Joi.string(),
    color_array: Joi.array().items(Joi.string()),
    attribute_array: Joi.array().items(Joi.string()),
    attribute_value_object: Joi.array().items(Joi.object()),
    prices: Joi.array().items(
      Joi.object({
        _id: Joi.objectId(),
        barcode: Joi.string(),
        // varient_name: Joi.string().valid("color", "size", "default").required(),
        varient_value: Joi.string().required(),
        unit_price: Joi.number().required(),
        discount_range: Joi.object({
          from: Joi.date().greater("now"),
          to: Joi.date().greater(Joi.ref("from")),
        }),
        discount_type: Joi.string().valid("flat", "percentage"),
        discount_amount: Joi.number(),
        quantity: Joi.number().required(),
        sku: Joi.string(),
        // sold: Joi.number(),
      }).required()
    ),
    shipping_config: Joi.string().valid("free", "flat_rate"),
    shipping_cost: Joi.number(),
    product_quantity_multiply: Joi.boolean(),
    low_stock_warning: Joi.number(),
    stock_visible: Joi.boolean(),
    cash_on_delivery: Joi.boolean(),
    featured: Joi.boolean(),
    todays_deal: Joi.string(),
    publish: Joi.boolean(),
    shipping_time: Joi.string(),
    vat_tax: Joi.string(),
    product_video_url: Joi.string(),
    flash: Joi.object({
      flash_id: Joi.objectId().required(),
      discount_amount: Joi.number().required(),
      discount_type: Joi.string().valid("flat", "percentage").required(),
    }),
    // rating: Joi.string(),
  });

  return schema.validate(product);
}

function validateRatingUpdate(product) {
  const schema = Joi.object({
    rating: Joi.number().min(0).max(5).required(),
  });

  return schema.validate(product);
}

const deleteUploadedFiles = (uploadedFiles) => {
  try {
    if (!_.isEmpty(uploadedFiles)) {
      if (!_.isEmpty(uploadedFiles.product_image_big)) {
        uploadedFiles.product_image_big.forEach((bigImage) => {
          if (fs.existsSync(bigImage.path)) fs.unlinkSync(bigImage.path);
        });
      }
      if (uploadedFiles.product_image_small)
        if (fs.existsSync(uploadedFiles.product_image_small[0].path))
          fs.unlinkSync(uploadedFiles.product_image_small[0].path);
      if (uploadedFiles.product_video)
        if (fs.existsSync(uploadedFiles.product_video[0].path))
          fs.unlinkSync(uploadedFiles.product_video[0].path);
    }
  } catch (error) {
    console.log("Error while deleting the file in postProduct", error);
  }
};

const updateFlash = (flash, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingFlash = await Flash.findOne({ _id: flash.flash_id });
      if (!existingFlash) reject("The flash with the given ID was not found.");

      if (!_.isEmpty(existingFlash.products)) {
        const currentProductExists = existingFlash.products.find((product) =>
          product.product_id.equals(productId)
        );
        if (!_.isEmpty(currentProductExists)) {
          currentProductExists.discount_type = flash.discount_type;
          currentProductExists.discount = flash.discount_amount;
        } else {
          existingFlash.products.push({
            product_id: productId,
            discount_type: flash.discount_type,
            discount: flash.discount_amount,
          });
        }
      } else {
        existingFlash.products.push({
          product_id: productId,
          discount_type: flash.discount_type,
          discount: flash.discount_amount,
        });
      }

      await existingFlash.save();
      resolve();
    } catch (error) {
      console.log("Server Error in product.updateFlash", error);
      reject("Server Error in product.updateFlash");
    }
  });
};
