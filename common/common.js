const { Brand } = require("../models/brand");
const { Category } = require("../models/category");
const { Product } = require("../models/product");
const { User } = require("../models/user");

const _ = require("lodash");
const mongoose = require("mongoose");
const { Shop } = require("../models/shop");
const { userTypeMap } = require("./constants");

exports.categoryCheck = async (category_id) => {
  if (!mongoose.Types.ObjectId.isValid(category_id))
    return {
      error: true,
      msg: `Invalid id : ${category_id}`,
      statusCode: 400,
    };
  try {
    const category = await Category.findOne({ _id: category_id });
    if (!category)
      return {
        error: true,
        msg: `Category with id ${category_id} not found`,
        statusCode: 400,
      };
    else return { error: false };
  } catch (error) {
    console.log("Server Error in common.CategoryCheck", error);
    return {
      error: true,
      msg: "Server Error in common.CategoryCheck",
      statusCode: 500,
      err: error,
    };
  }
};

exports.brandCheck = async (brand_id) => {
  if (!mongoose.Types.ObjectId.isValid(brand_id))
    return {
      error: true,
      msg: `Invalid id : ${brand_id}`,
      statusCode: 400,
    };
  try {
    const brand = await Brand.findOne({ _id: brand_id });
    if (!brand)
      return {
        error: true,
        msg: `Brand with id ${brand_id} not found`,
        statusCode: 400,
      };
    else return { error: false };
  } catch (error) {
    console.log("Server Error in common.brandCheck", error);
    return {
      error: true,
      msg: "Server Error in common.brandCheck",
      statusCode: 500,
      err: error,
    };
  }
};

exports.productCheck = async (product_id) => {
  if (!mongoose.Types.ObjectId.isValid(product_id))
    return {
      error: true,
      msg: `Invalid id : ${product_id}`,
      statusCode: 400,
    };
  try {
    const product = await Product.findOne({ _id: product_id });
    if (!product)
      return {
        error: true,
        msg: `Product with id ${product_id} not found`,
        statusCode: 400,
      };
    else return { error: false };
  } catch (error) {
    console.log("Server Error in common.productCheck", error);
    return {
      error: true,
      msg: "Server Error in common.productCheck",
      statusCode: 500,
      err: error,
    };
  }
};

exports.userCheck = async (user_id) => {
  if (!mongoose.Types.ObjectId.isValid(user_id))
    return {
      error: true,
      msg: `Invalid id : ${user_id}`,
      statusCode: 400,
    };
  try {
    const user = await User.findOne({ _id: user_id });
    if (!user)
      return {
        error: true,
        msg: `User with id ${user_id} not found`,
        statusCode: 400,
      };
    else return { error: false };
  } catch (error) {
    console.log("Server Error in common.userCheck", error);
    return {
      error: true,
      msg: "Server Error in common.userCheck",
      statusCode: 500,
      err: error,
    };
  }
};

exports.shopCheck = async (shop_id) => {
  if (!mongoose.Types.ObjectId.isValid(shop_id))
    return {
      error: true,
      msg: `Invalid id : ${shop_id}`,
      statusCode: 400,
    };
  try {
    const shop = await Shop.findOne({ _id: shop_id });
    if (!shop)
      return {
        error: true,
        msg: `Shop with id ${shop_id} not found`,
        statusCode: 400,
      };
    else return { error: false };
  } catch (error) {
    console.log("Server Error in common.shopCheck", error);
    return {
      error: true,
      msg: "Server Error in common.shopCheck",
      statusCode: 500,
      err: error,
    };
  }
};

/*
 * Get's the resourceBundle in the input languageCode
 */
exports.getResourceBundle = function (inputLanguageCode, resourceBundle) {
  if (_.isEmpty(resourceBundle)) {
    return {};
  }
  var outputResourceBundle = {};
  var defaultResourceBundle = {};
  for (var i = 0; i < resourceBundle.length; i++) {
    if (resourceBundle[i].languageCode == inputLanguageCode) {
      outputResourceBundle = resourceBundle[i];
      break;
    } else if (resourceBundle[i].languageCode == "en") {
      defaultResourceBundle = resourceBundle[i];
    }
  }
  var finalResourceBundle = _.isEmpty(outputResourceBundle)
    ? defaultResourceBundle
    : outputResourceBundle;

  return _.isEmpty(finalResourceBundle)
    ? resourceBundle[0]
    : finalResourceBundle;
};

exports.getAccessibleUserTypes = (user_type) => {
  let user_priority = userTypeMap.find(
    (type) => type.name == user_type
  ).priority;
  return userTypeMap
    .filter((type) => type.priority > user_priority)
    .map((t) => t.name);
};
