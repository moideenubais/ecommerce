const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const BrandSchema = new mongoose.Schema(
  {
    resourceBundle: [
      {
        languageCode: {
          type: String,
          required: "Please fill the langugage code for the item",
        },
        name: {
          type: String,
          required: "Please fill Brand Name",
          trim: true,
          maxlength: 255,
        },
      },
    ],
    logo_url: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", BrandSchema);

function validateBrand(brand) {
  const schema = Joi.object({
    resourceBundle: Joi.array()
      .items(
        Joi.object({
          languageCode: Joi.string().valid("en", "ar").required(),
          name: Joi.string().required(),
        }).required()
      )
      .required(),
  });

  return schema.validate(brand);
}

exports.Brand = Brand;
exports.validate = validateBrand;
