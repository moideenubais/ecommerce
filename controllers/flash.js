const { Flash, validate } = require("../models/flash");

const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const common = require("../common/common");
const { Review } = require("../models/review");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.listFlashs = async (req, res) => {
  let query = { status: true };
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["resourceBundle.name"] = { $regex: req.query.search, $options: "i" };
  }

  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const flashCount = await Flash.count(query);
    const allFlashs = await Flash.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate(
        "products.product_id",
        "_id resourceBundle prices product_image_small_url"
      )
      .select("-__v")
      .lean();
    if (_.isEmpty(allFlashs)) return res.json({ msg: "No flashs found" });
    allFlashs.forEach(async (flash) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        flash.resourceBundle
      );
      flash.i18nResourceBundle = i18nResourceBundle;
      if (!_.isEmpty(flash.products)) {
        flash.products.forEach((product) => {
          const i18nResourceBundle = common.getResourceBundle(
            languageCode,
            product.product_id.resourceBundle
          );
          product.product_id.i18nResourceBundle = i18nResourceBundle;
          delete product.product_id.resourceBundle;
        });
        await Promise.all(
          flash.products.map(async (product) => {
            product.rating = 4;
            let reviews = [];
            try {
              reviews = await Review.find({
                product_id: product.product_id,
                publish: true,
              });
            } catch (error) {
              console.log(
                "Error while fetching reviews in flash.listFlashs",
                error
              );
              return res.send(500).json({
                err: "Error  while fetching reviews in flash.listFlashs",
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
          })
        );
      }
      delete flash.resourceBundle;
    });
    return res.json({
      flashs: allFlashs,
      info: {
        totalNumber: flashCount,
        hasNextPage: ITEMS_PER_PAGE * page < flashCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(flashCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in flash.getFlashs", error);
    return res.status(500).send("Server Error in flash.getFlashs");
  }
};

exports.createFlash = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    deleteUploadedFiles(req.file);
    return res.status(400).json({ err: error.details[0].message });
  }

  req.body.products.forEach(async (product) => {
    const productExist = await common.productCheck(product.product_id);
    if (productExist.error) {
      deleteUploadedFiles(req.file);
      return res.status(productExist.statusCode || 400).json({
        err: productExist.msg || "Error in product check",
      });
    }
  });

  const flash = new Flash({ ...req.body });
  if (!_.isEmpty(req.body.products)) flash.products = req.body.products;
  if (!_.isEmpty(req.file)) flash.banner_url = req.file.path;
  try {
    const savedFlash = await flash.save();
    return res.json(savedFlash);
  } catch (err) {
    console.log("Server Error in flash.postFlash", err);
    return res.status(400).send("Server Error in flash.postFlash");
  }
};

exports.getSingleFlash = async (req, res) => {
  try {
    const flash = await Flash.findById(req.params.id).select("-__v");

    if (!flash)
      return res
        .status(404)
        .json({ msg: "The flash with the given ID was not found." });

    res.send(flash);
  } catch (err) {
    console.log("Server Error in flash.getSingleFlash", err);
    return res.status(400).send("Server Error in flash.getSingleFlash");
  }
};

exports.deleteFlash = async (req, res) => {
  try {
    const flash = await Flash.findByIdAndRemove(req.params.id);

    if (!flash)
      return res
        .status(404)
        .json({ msg: "The flash with the given ID was not found." });

    if (flash.banner_url && fs.existsSync(flash.banner_url))
      fs.unlinkSync(flash.banner_url);

    return res.send(flash);
  } catch (error) {
    console.log("Server Error in flash.deleteFlash", error);
    return res.status(400).json({
      err: "Server Error in flash.deleteFlash",
    });
  }
};

exports.updateFlash = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ msg: "Empty body" });
  }

  const { error } = validateFlash(req.body);
  if (error) {
    deleteUploadedFiles(req.file);
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingFlash = await Flash.findOne({ _id: req.params.id });
    if (!existingFlash)
      return res
        .status(404)
        .json({ msg: "The flash with the given ID was not found." });

    const flashContent = {};
    if (!_.isEmpty(req.body.resourceBundle))
      flashContent.resourceBundle = req.body.resourceBundle;
    if (!_.isEmpty(req.body.duration))
      flashContent.duration = req.body.duration;
    if (!_.isEmpty(req.body.bg_color))
      flashContent.bg_color = req.body.bg_color;
    if (!_.isUndefined(req.body.featured))
      flashContent.featured = req.body.featured;
    if (!_.isUndefined(req.body.status)) flashContent.status = req.body.status;

    if (!_.isEmpty(req.body.text_color))
      flashContent.text_color = req.body.text_color;
    if (!_.isEmpty(req.body.products))
      flashContent.products = req.body.products;
    if (!_.isEmpty(req.file)) {
      if (existingFlash.banner_url && fs.existsSync(existingFlash.banner_url))
        fs.unlinkSync(existingFlash.banner_url);
      flashContent.banner_url = req.file.path;
    }
    const flash = await Flash.findByIdAndUpdate(req.params.id, flashContent, {
      new: true,
    });

    res.send(flash);
  } catch (error) {
    console.log("Server Error in flash.updateFlash", error);
    return res.status(500).send("Server Error in flash.updateFlash");
  }
};

function validateFlash(flash) {
  const schema = Joi.object({
    resourceBundle: Joi.array().items(
      Joi.object({
        _id: Joi.objectId(),
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
      }).required()
    ),
    duration: Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required(),
    }),
    bg_color: Joi.string(),
    text_color: Joi.string(),
    products: Joi.array().items(
      Joi.object({
        _id: Joi.objectId(),
        product_id: Joi.objectId().required(),
        discount_type: Joi.string().required(),
        discount: Joi.number().required(),
      }).required()
    ),
    featured: Joi.boolean(),
    status: Joi.boolean(),
  });

  return schema.validate(flash);
}

const deleteUploadedFiles = (file) => {
  try {
    if (file) fs.unlinkSync(file.path);
  } catch (error) {
    console.log("Error while deleting the file in flash.postFlash", error);
    return res.status(400).json({
      err: "Error while deleting the file in flash.postFlash",
    });
  }
};
