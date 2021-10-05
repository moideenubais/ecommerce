// const common = require("../common/common");
// const { Content } = require("../models/content");
const { Brand, validate } = require("../models/brand");
const { Product } = require("../models/product");
// const log = require("./log");

const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// const { Associate } = require("../models/associate");

const common = require("../common/common");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.listBrands = async (req, res) => {
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
    const brandCount = await Brand.count(query);
    const allBrands = await Brand.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("-__v")
      .lean();
    if (_.isEmpty(allBrands)) return res.json({ msg: "No brands found" });
    allBrands.forEach((brand) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        brand.resourceBundle
      );
      brand.i18nResourceBundle = i18nResourceBundle;
      delete brand.resourceBundle;
    });
    return res.json({
      brands: allBrands,
      info: {
        totalNumber: brandCount,
        hasNextPage: ITEMS_PER_PAGE * page < brandCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(brandCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in brand.getBrands", error);
    return res.status(500).send("Server Error in brand.getBrands");
  }
};

exports.createBrand = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    try {
      if (req.file) fs.unlinkSync(req.file.path);
    } catch (error) {
      console.log("Error while deleting the file in brand.postBrand", error);
      return res.status(400).json({
        err: "Error while deleting the file in brand.postBrand",
      });
    }
    return res.status(400).json({ err: error.details[0].message });
  }

  const { resourceBundle } = req.body;
  const brand = new Brand({ resourceBundle });
  if (!_.isEmpty(req.file)) brand.logo_url = req.file.path;
  try {
    const savedBrand = await brand.save();
    return res.json(savedBrand);
  } catch (err) {
    console.log("Server Error in brand.postBrand", err);
    return res.status(400).send("Server Error in brand.postBrand");
  }
};

exports.getSingleBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).select("-__v");

    if (!brand)
      return res
        .status(404)
        .json({ msg: "The brand with the given ID was not found." });

    res.send(brand);
  } catch (err) {
    console.log("Server Error in brand.getSingleBrand", err);
    return res.status(400).send("Server Error in brand.getSingleBrand");
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const existingBrand = await Brand.findById(req.params.id);
    if (!existingBrand)
      return res
        .status(404)
        .json({ msg: "The brand with the given ID was not found." });

    const brandExistsInProducts = await Product.findOne({
      brand_id: existingBrand._id,
    });
    if (brandExistsInProducts)
      return res
        .status(404)
        .json({ msg: "There are products under this brand." });
    const brand = await Brand.findByIdAndRemove(req.params.id);

    if (brand.logo_url && fs.existsSync(brand.logo_url))
      fs.unlinkSync(brand.logo_url);

    return res.send(brand);
  } catch (error) {
    console.log("Server Error in brand.deleteBrand", error);
    return res.status(400).json({
      err: "Server Error in brand.deleteBrand",
    });
  }
};

exports.updateBrand = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ msg: "Empty body" });
  }

  const { error } = validateBrand(req.body);
  if (error) {
    try {
      if (req.file) fs.unlinkSync(req.file.path);
    } catch (error) {
      console.log("Error while deleting the file in brand.updateBrand", error);
      return res.status(400).json({
        err: "Error while deleting the file in brand.updateBrand",
      });
    }
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingBrand = await Brand.findOne({ _id: req.params.id });
    if (!existingBrand)
      return res
        .status(404)
        .json({ msg: "The brand with the given ID was not found." });

    const brandContent = {};
    if (!_.isEmpty(req.body.resourceBundle))
      brandContent.resourceBundle = req.body.resourceBundle;
    if (!_.isEmpty(req.file)) {
      if (existingBrand.logo_url && fs.existsSync(existingBrand.logo_url))
        fs.unlinkSync(existingBrand.logo_url);
      brandContent.logo_url = req.file.path;
    }
    const brand = await Brand.findByIdAndUpdate(req.params.id, brandContent, {
      new: true,
    });

    res.send(brand);
  } catch (error) {
    console.log("Server Error in brand.updateBrand", error);
    return res.status(500).send("Server Error in brand.updateBrand");
  }
};

function validateBrand(brand) {
  const schema = Joi.object({
    resourceBundle: Joi.array().items(
      Joi.object({
        _id: Joi.objectId(),
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
      }).required()
    ),
  });

  return schema.validate(brand);
}
