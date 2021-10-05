const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const AttributeSchema = new mongoose.Schema(
  {
    resourceBundle: [
      {
        languageCode: {
          type: String,
          required: "Please fill the langugage code for the item",
        },
        name: {
          type: String,
          required: "Please fill Attribute Name",
          trim: true,
          maxlength: 255,
        },
      },
    ],
    values: [
      {
        value: {
          type: String,
          trim: true,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Attribute = mongoose.model("Attribute", AttributeSchema);

function validateAttribute(attribute) {
  const schema = Joi.object({
    resourceBundle: Joi.array()
      .items(
        Joi.object({
          languageCode: Joi.string().valid("en", "ar").required(),
          name: Joi.string().required(),
        }).required()
      )
      .required(),
    values: Joi.array().items(
      Joi.object({
        value: Joi.string().required(),
      })
    ),
  });

  return schema.validate(attribute);
}

exports.Attribute = Attribute;
exports.validate = validateAttribute;
