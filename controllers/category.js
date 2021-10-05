const { Category, validate } = require("../models/category");
const _ = require("lodash");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const fs = require("fs");

const common = require("../common/common");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.createRootNode = async (req, res, next) => {
  let query = {
    parentId: null,
  };

  try {
    const rootCategory = await Category.findOne(query);
    if (_.isEmpty(rootCategory)) {
      //   Category.Building(function () {
      //     // building materialized path
      //   });
      const newRootCategory = new Category({
        resourceBundle: [
          {
            languageCode: "en",
            name: "Root Category",
          },
        ],
      });

      const response = await newRootCategory.save();
      req.rootCategory = response;
      next();
    } else {
      req.rootCategory = rootCategory;
      next();
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ err: "Server Error in category.createRootNode" });
  }
};

exports.createCategory = async (req, res) => {
  const { error } = validate(req.body);
  //   if (error) return res.status(400).json({ err: error.details[0].message });
  if (error) {
    try {
      if (req.files) {
        if (req.files.category_banner)
          fs.unlinkSync(req.files.category_banner[0].path);
        if (req.files.category_icon)
          fs.unlinkSync(req.files.category_icon[0].path);
      }
    } catch (error) {
      console.log("Error while deleting the file in postCategory", error);
      return res.status(400).json({
        err:
          "Error while deleting the file in postCategory \n" +
          error.details[0].message,
      });
    }
    return res.status(400).json({ err: error.details[0].message });
  }

  const rootCategory = req.rootCategory;

  if (req.body.parentId) {
    try {
      const category = await Category.findOne({ _id: req.body.parentId });
      if (!category) {
        // try {
        if (req.files) {
          if (req.files.category_banner)
            fs.unlinkSync(req.files.category_banner[0].path);
          if (req.files.category_icon)
            fs.unlinkSync(req.files.category_icon[0].path);
        }

        // } catch (error) {
        // console.log("Error while deleting the file in postCategory", error);
        // return res.status(400).json({
        //   err: "Error while deleting the file in postCategory \n" + error.details[0].message,
        // });
        // }
        return res.json({ err: "Parent Category not found" });
      }
    } catch (error) {
      console.log(
        "Server Error in category.createCategory checking if parent id exists",
        error
      );
      res.status(500).json({
        err: "Server Error in category.createCategory checking if parent id exists",
      });
    }
  }

  const newCategory = new Category({
    resourceBundle: req.body.resourceBundle,
    order: req.body.order,
    parentId: req.body.parentId ? req.body.parentId : req.rootCategory._id,
  });

  if (!_.isEmpty(req.body.order)) newCategory.order = req.body.order;
  if (!_.isEmpty(req.body.featured)) newCategory.featured = req.body.featured;

  if (req.files && req.files.category_banner)
    newCategory.banner_url = req.files.category_banner[0].path;
  if (req.files && req.files.category_icon)
    newCategory.icon_url = req.files.category_icon[0].path;
  try {
    await newCategory.save();

    res.send(newCategory);
  } catch (error) {
    console.log("Server Error in category.createCategory", error);
    res.status(500).json({ err: "Server Error in category.createCategory" });
  }
};

exports.listCategorys = async (req, res) => {
  let query = { parentId: { $ne: null } };
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;

  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["resourceBundle.name"] = { $regex: req.query.search, $options: "i" };
  }
  if (!_.isUndefined(req.query.featured)) {
    query["featured"] = req.query.featured;
  }

  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const categoryCount = await Category.count(query);
    const allCategories = await Category.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("-__v")
      .lean();
    if (_.isEmpty(allCategories))
      return res.json({ msg: "No categories found" });
    allCategories.forEach((category) => {
      const i18nResourceBundle = common.getResourceBundle(
        languageCode,
        category.resourceBundle
      );
      category.i18nResourceBundle = i18nResourceBundle;
      delete category.resourceBundle;
    });
    return res.json({
      categories: allCategories,
      info: {
        totalNumber: categoryCount,
        hasNextPage: ITEMS_PER_PAGE * page < categoryCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(categoryCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in category.getCategories", error);
    return res.status(500).send("Server Error in category.getCategories");
  }
};

exports.getSingleCategory = async (req, res) => {
  const category = await Category.findById(req.params.id).select("-__v");

  if (!category)
    return res
      .status(404)
      .json({ err: "The category with the given ID was not found." });

  res.send(category);
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryExist = await Category.findOne({ _id: req.params.id });
    if (!categoryExist)
      return res
        .status(404)
        .json({ err: "The category with the given ID was not found." });

    const category = await Category.findByIdAndRemove(req.params.id);

    if (category.banner_url && fs.existsSync(category.banner_url))
      fs.unlinkSync(category.banner_url);

    if (category.icon_url && fs.existsSync(category.icon_url))
      fs.unlinkSync(category.icon_url);

    res.send(category);
  } catch (error) {
    console.log("Server Error in category.deleteCategory", error);
    return res
      .status(400)
      .json({ err: "Server Error in category.deleteCategory" });
  }
};

exports.updateCategory = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.files) return res.json({ err: "Empty body" });
  }
  const { error } = validateCategory(req.body);
  if (error) {
    try {
      if (req.files) {
        if (req.files.category_banner)
          fs.unlinkSync(req.files.category_banner[0].path);
        if (req.files.category_icon)
          fs.unlinkSync(req.files.category_icon[0].path);
      }
    } catch (error) {
      console.log("Error while deleting the file in postCategory", error);
      return res.status(400).json({
        err:
          "Error while deleting the file in postCategory \n" +
          error.details[0].message,
      });
    }
    return res.status(400).json({ err: error.details[0].message });
  }

  const categoryContent = {};
  const currentCategory = await Category.findOne({ _id: req.params.id });
  if (!currentCategory)
    return res.json({ err: "Category with the given id not found" });

  if (!_.isEmpty(req.body.resourceBundle)) {
    categoryContent.resourceBundle = req.body.resourceBundle;
  }
  if (!_.isEmpty(req.body.order)) {
    categoryContent.order = req.body.order;
  }
  if (!_.isEmpty(req.body.featured)) {
    categoryContent.featured = req.body.featured;
  }
  if (!_.isEmpty(req.body.parentId)) {
    const parentCategory = await Category.findOne({ _id: req.body.parentId });
    if (!parentCategory) {
      try {
        if (req.files) {
          if (req.files.category_banner)
            fs.unlinkSync(req.files.category_banner[0].path);
          if (req.files.category_icon)
            fs.unlinkSync(req.files.category_icon[0].path);
        }
      } catch (error) {
        console.log("Error while deleting the file in postCategory", error);
        return res.status(400).json({
          err: "Error while deleting the file in postCategory ",
        });
      }
      return res.json({ err: "Parent Category not found" });
    }
    categoryContent.parentId = req.body.parentId;
  }
  if (!_.isEmpty(req.files.category_banner)) {
    if (currentCategory.banner_url && fs.existsSync(currentCategory.banner_url))
      fs.unlinkSync(currentCategory.banner_url);
    categoryContent.banner_url = req.files.category_banner[0].path;
  }
  if (!_.isEmpty(req.files.category_icon)) {
    if (currentCategory.icon_url && fs.existsSync(currentCategory.icon_url))
      fs.unlinkSync(currentCategory.icon_url);
    categoryContent.icon_url = req.files.category_icon[0].path;
  }

  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      categoryContent,
      { new: true }
    );

    res.status(200).send(category);
  } catch (error) {
    console.log("Server Error in category.updateCategory", error);
    res.status(400).json({ err: "Server Error in category.updateCategory" });
  }
};

function validateCategory(category) {
  const schema = Joi.object({
    resourceBundle: Joi.array().items(
      Joi.object({
        _id: Joi.objectId(),
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
      }).required()
    ),
    order: Joi.number(),
    featured: Joi.boolean(),
    parentId: Joi.objectId(),
  });

  return schema.validate(category);
}
