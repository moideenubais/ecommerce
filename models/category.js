const mongoose = require("mongoose");
// require('mongoose-long')(mongoose);
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const materializedPlugin = require("mongoose-materialized");

const CategorySchema = new mongoose.Schema(
  {
    resourceBundle:[{
        languageCode: {
          type: String,
          required: 'Please fill the langugage code for the item',
        },
        name: {
          type: String,
          required: 'Please fill Category Name',
          trim: true,
      maxlength: 255,
        },
      }],
    order: {
        type: Number,
        default:1
    },
    banner_url: {
        type: String,
        trim: true
    },
    icon_url:{
        type: String,
        trim: true
    },
    featured: {
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);

CategorySchema.plugin(materializedPlugin);
const Category = mongoose.model("Category", CategorySchema);

function validateCategory(category) {
  const schema = Joi.object({
    resourceBundle: Joi.array().items(
        Joi.object({
          languageCode: Joi.string().valid('en','ar').required(),
          name: Joi.string().required(),
        }).required()
      ).required(),
    order: Joi.number(),
    featured: Joi.boolean(),
    parentId: Joi.objectId(),
  });

  return schema.validate(category);
}

exports.Category = Category;
exports.validate = validateCategory;
