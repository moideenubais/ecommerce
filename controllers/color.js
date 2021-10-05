const { Color, validate } = require("../models/color");

const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");

const common = require("../common/common");
const { Product } = require("../models/product");

let ITEMS_PER_PAGE = 15;
let DEFAULT_LANGUAGE = "en";

exports.listColors = async (req, res) => {
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  if (!_.isEmpty(req.query.page)) {
    const page = +req.query.page || 1;
    // query.parentId = { $ne: null };
    // let sort = {name:1};
    if (!_.isEmpty(req.query.search)) {
      query["resourceBundle.name"] = {
        $regex: req.query.search,
        $options: "i",
      };
    }
    // if (!_.isEmpty(req.query.sort)) {
    //   if(req.query.sort == 'desc')
    //   sort.name = -1;
    // }

    if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
    try {
      const colorCount = await Color.count(query);
      const allColors = await Color.find(query)
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        // .populate("color", "name")
        .select("-__v")
        .lean();
      if (_.isEmpty(allColors)) return res.json({ msg: "No colors found" });
      allColors.forEach((color) => {
        const i18nResourceBundle = common.getResourceBundle(
          languageCode,
          color.resourceBundle
        );
        color.i18nResourceBundle = i18nResourceBundle;
        // delete color.resourceBundle;
      });
      // res.send(allColors);
      return res.json({
        colors: allColors,
        info: {
          totalNumber: colorCount,
          hasNextPage: ITEMS_PER_PAGE * page < colorCount,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(colorCount / ITEMS_PER_PAGE),
        },
      });
    } catch (error) {
      console.log("Server Error in color.getColors", error);
      return res.status(500).send("Server Error in color.getColors");
    }
  }
  try {
    const allColors = await Color.find();
    if (_.isEmpty(allColors)) return res.json({ msg: "No colors found" });
    res.send(allColors);
  } catch (error) {
    return res.status(500).send("Server Error in color.getColors");
  }
};

exports.createColor = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  const { resourceBundle, value } = req.body;
  try {
    const valueExists = await Color.findOne({ value: value });
    if (valueExists)
      return res
        .status(404)
        .json({ msg: "The color with the given value exists already." });
  } catch (error) {
    console.log("Server Error in color.postColor", err);
    return res.status(400).send("Server Error in color.postColor");
  }
  const color = new Color({ resourceBundle, value });
  try {
    const savedColor = await color.save();
    return res.json(savedColor);
  } catch (err) {
    console.log("Server Error in color.postColor", err);
    return res.status(400).send("Server Error in color.postColor");
  }
};

exports.getSingleColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id).select("-__v");

    if (!color)
      return res
        .status(404)
        .json({ msg: "The color with the given ID was not found." });

    res.send(color);
  } catch (err) {
    console.log("Server Error in color.getSingleColor", err);
    return res.status(400).send("Server Error in color.getSingleColor");
  }
};

exports.deleteColor = async (req, res) => {
  try {
    const existingColor = await Color.findById(req.params.id);
    if (!existingColor)
      return res
        .status(404)
        .json({ msg: "The color with the given ID was not found." });
    const colorExistsInProducts = await Product.findOne({
      color_array: existingColor._id,
    });
    if (colorExistsInProducts)
      return res
        .status(404)
        .json({ msg: "There are products under this color." });
    const color = await Color.findByIdAndRemove(req.params.id);
    return res.send(color);
  } catch (error) {
    console.log("Server Error in color.deleteColor", error);
    return res.status(400).json({
      err: "Server Error in color.deleteColor",
    });
  }
};

exports.updateColor = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ msg: "Empty body" });
  }

  const { error } = validateColor(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingColor = await Color.findOne({ _id: req.params.id });
    if (!existingColor)
      return res
        .status(404)
        .json({ msg: "The color with the given ID was not found." });

    const colorContent = {};
    if (!_.isEmpty(req.body.resourceBundle))
      colorContent.resourceBundle = req.body.resourceBundle;
    if (!_.isEmpty(req.body.value)) {
      try {
        const valueExists = await Color.findOne({
          value: req.body.value,
          _id: { $ne: req.params.id },
        });
        if (valueExists)
          return res
            .status(404)
            .json({ msg: "The color with the given value exists already." });
        colorContent.value = req.body.value;
      } catch (error) {
        console.log("Server Error in color.updateColor", err);
        return res.status(400).send("Server Error in color.updateColor");
      }
    }
    const color = await Color.findByIdAndUpdate(req.params.id, colorContent, {
      new: true,
    });

    res.send(color);
  } catch (error) {
    console.log("Server Error in color.updateColor", error);
    return res.status(500).send("Server Error in color.updateColor");
  }
};

function validateColor(color) {
  const schema = Joi.object({
    resourceBundle: Joi.array().items(
      Joi.object({
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
      }).required()
    ),
    value: Joi.string(),
  });

  return schema.validate(color);
}
