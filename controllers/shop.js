const { Shop, validate } = require("../models/shop");
const _ = require("lodash");
const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity").default;
Joi.objectId = require("joi-objectid")(Joi);
const nodemailer = require("nodemailer");
const fs = require("fs");

const common = require("../common/common");
const { Order } = require("../models/order");
const { Flash } = require("../models/flash");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const { getShopRegisterHtml } = require("../common/htmls");

let ITEMS_PER_PAGE = 10000;
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

exports.createShop = async (req, res) => {
  // console.log("files", req.files);
  // return;
  const { error } = validate(req.body);

  if (error) {
    deleteUploadedFiles(req.files);
    return res.status(400).json({ err: error.details[0].message });
  }

  const newShop = new Shop({
    resourceBundle: req.body.resourceBundle,
    mobile: req.body.mobile,
    commission_per_product: req.body.commission_per_product,
  });

  if (req.files && !_.isEmpty(req.files.banner)) {
    newShop.banner_urls = req.files.banner.map((Image) => Image.path);
  }
  if (req.files && req.files.logo) newShop.logo_url = req.files.logo[0].path;
  try {
    await newShop.save();

    res.send(newShop);
  } catch (error) {
    console.log("Server Error in shop.createShop", error);
    res.status(500).json({ err: "Server Error in shop.createShop" });
  }
};

exports.listShops = async (req, res) => {
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["resourceBundle.name"] = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const shopCount = await Shop.count(query);
    const allShops = await Shop.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort("-createdAt")
      .select("-__v")
      .lean();
    if (_.isEmpty(allShops)) return res.json({ msg: "No shops found" });
    allShops.forEach((shop) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        shop.resourceBundle
      );
      shop.i18nResourceBundle = i18nResourceBundle;
      // delete shop.resourceBundle;
    });
    return res.json({
      shops: allShops,
      info: {
        totalNumber: shopCount,
        hasNextPage: ITEMS_PER_PAGE * page < shopCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(shopCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in shop.getShops", error);
    return res.status(500).send("Server Error in shop.getShops");
  }
};

exports.getSingleShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id).select("-__v").lean();

  if (!shop)
    return res
      .status(404)
      .json({ err: "The shop with the given ID was not found." });

  res.send(shop);
};

exports.deleteShop = async (req, res) => {
  try {
    const shopExist = await Shop.findOne({ _id: req.params.id });
    if (!shopExist)
      return res
        .status(404)
        .json({ err: "The shop with the given ID was not found." });

    const ExistsInProducts = await Product.find({
      shop_id: req.params.id,
    });

    if (!_.isEmpty(ExistsInProducts)) {
      return res.status(400).json({
        err: "Can't delete, there are products under the shop",
      });
    }
    const ExistsSellers = await User.find({
      shop_id: req.params.id,
    });

    if (!_.isEmpty(ExistsSellers)) {
      return res.status(400).json({
        err: "Can't delete, there are sellers under the shop",
      });
    }

    const shop = await Shop.findByIdAndRemove(req.params.id);

    if (!_.isEmpty(shop.banner_urls)) {
      shop.banner_urls.forEach((url) => {
        if (fs.existsSync(url)) fs.unlinkSync(url);
      });
    }
    if (shop.logo_url && fs.existsSync(shop.logo_url))
      fs.unlinkSync(shop.logo_url);

    res.send(shop);
  } catch (error) {
    console.log("Server Error in shop.deleteShop", error);
    return res.status(400).json({ err: "Server Error in shop.deleteShop" });
  }
};

exports.updateShop = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.files) return res.json({ err: "Empty body" });
  }
  const { error } = validateShop(req.body);

  if (error) {
    deleteUploadedFiles(req.files);
    return res.status(400).json({ err: error.details[0].message });
  }

  const shopContent = {};
  const currentShop = await Shop.findOne({ _id: req.params.id });
  if (!currentShop)
    return res.json({ err: "Shop with the given id not found" });

  if (!_.isEmpty(req.body.resourceBundle)) {
    shopContent.resourceBundle = req.body.resourceBundle;
  }
  if (!_.isEmpty(req.body.mobile)) {
    shopContent.mobile = req.body.mobile;
  }

  if (!_.isEmpty(req.body.commission_per_product)) {
    shopContent.commission_per_product = req.body.commission_per_product;
  }

  if (!_.isEmpty(req.files.banner)) {
    if (!_.isEmpty(currentShop.banner_urls)) {
      currentShop.banner_urls.forEach((image) => {
        if (fs.existsSync(image)) fs.unlinkSync(image);
      });
    }
    shopContent.banner_urls = req.files.banner.map((image) => image.path);
  }
  if (!_.isEmpty(req.files.logo)) {
    if (currentShop.logo_url && fs.existsSync(currentShop.logo_url))
      fs.unlinkSync(currentShop.logo_url);
    shopContent.logo_url = req.files.logo[0].path;
  }
  const shop = await Shop.findByIdAndUpdate(req.params.id, shopContent, {
    new: true,
  });

  res.send(shop);
};

exports.registerSeller = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.files) return res.json({ err: "Empty body" });
  }
  const { error } = validateRegisterSeller(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  const htmlData = getShopRegisterHtml(req.body);
  const mailOptions = {
    from: `Q Sales <${process.env.NODEMAILER_EMAIL}>`,
    to: process.env.ADMIN_MAIL,
    subject: "Shop Registration",
    html: htmlData,
  };
  return;
  try {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(
          "Error while sending email from shop.sendEmailToAdmin",
          error
        );
        return res.status(400).json({ err: "Error in sending email" });
      }
      return res.status(200).json({ msg: "success" });
    });
  } catch (err) {
    console.log("Error while sending email from shop.sendEmailToAdmin", err);
  }
};

function validateShop(shop) {
  const schema = Joi.object({
    mobile: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/),
    commission_per_product: Joi.number(),
    resourceBundle: Joi.array().items(
      Joi.object({
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
        address: Joi.object({
          building_name: Joi.string(),
          street: Joi.string(),
          city: Joi.string(),
        }),
        pickup_point: Joi.string(),
      }).required()
    ),
  });

  return schema.validate(shop);
}

function validateRegisterSeller(shop) {
  const schema = Joi.object({
    shop_name: Joi.string().required(),
    address: Joi.object({
      building_name: Joi.string(),
      street: Joi.string(),
      city: Joi.string(),
    }),
    mobile: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    pickup_point: Joi.string().required(),
    user_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: passwordComplexity().required(),
    confirm_password: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("confirm password")
      .options({ messages: { "any.only": "{{#label}} does not match" } }),
    language: Joi.string(),
  });

  return schema.validate(shop);
}

const deleteUploadedFiles = (uploadedFiles) => {
  try {
    if (uploadedFiles) {
      if (!_.isEmpty(uploadedFiles.banner)) {
        uploadedFiles.banner.forEach((ban) => {
          fs.unlinkSync(ban.path);
        });
      }
      if (uploadedFiles.logo) fs.unlinkSync(uploadedFiles.logo[0].path);
    }
  } catch (error) {
    console.log("Error while deleting the file in postShop", error);
    return res.status(400).json({
      err: "Error while deleting the file in postShop \n",
    });
  }
};
