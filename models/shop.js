const mongoose = require("mongoose");
// require('mongoose-long')(mongoose);
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// const materializedPlugin = require("mongoose-materialized");

const ShopSchema = new mongoose.Schema(
  {
    resourceBundle: [
      {
        languageCode: {
          type: String,
          required: "Please fill the langugage code for the shop",
        },
        name: {
          type: String,
          required: "Please fill Shop Name",
          trim: true,
          maxlength: 255,
        },
        address: {
          type: {
            building_name: String,
            street: String,
            city: String,
          },
        },
        pickup_point: String,
      },
    ],
    mobile: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },
    earnings: {
      type: Number,
    },
    commission_per_product: {
      type: Number,
      required: true,
    },
    banner_urls: [
      {
        type: String,
        trim: true,
      },
    ],
    logo_url: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", ShopSchema);

function validateShop(shop) {
  const schema = Joi.object({
    mobile: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    commission_per_product: Joi.number().required(),
    resourceBundle: Joi.array()
      .items(
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
      )
      .required(),
  });

  return schema.validate(shop);
}

exports.Shop = Shop;
exports.validate = validateShop;
