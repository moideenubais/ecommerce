const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const ColorSchema = new mongoose.Schema(
  {
    resourceBundle: [
      {
        languageCode: {
          type: String,
          required: "Please fill the langugage code for the item",
        },
        name: {
          type: String,
          required: "Please fill Color Name",
          trim: true,
          maxlength: 255,
        },
      },
    ],
    value: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Color = mongoose.model("Color", ColorSchema);

function validateColor(color) {
  const schema = Joi.object({
    resourceBundle: Joi.array()
      .items(
        Joi.object({
          languageCode: Joi.string().valid("en", "ar").required(),
          name: Joi.string().required(),
        }).required()
      )
      .required(),
    value: Joi.string().required(),
  });

  return schema.validate(color);
}

exports.Color = Color;
exports.validate = validateColor;
