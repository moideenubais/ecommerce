const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const FlashSchema = new mongoose.Schema(
  {
    resourceBundle: {
      type: [
        {
          languageCode: {
            type: String,
            required: "Please fill the langugage code for the item",
          },
          name: {
            type: String,
            required: "Please fill Flash Name",
            trim: true,
            maxlength: 255,
          },
        },
      ],
      required: true,
    },
    duration: {
      type: mongoose.Schema({
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          required: true,
        },
      }),
      required: true,
    },
    bg_color: {
      type: String,
      trim: true,
      required: true,
    },
    text_color: {
      type: String,
      enum: ["white", "dark"],
      required: true,
    },
    banner_url: {
      type: String,
      trim: true,
    },
    products: {
      type: [
        {
          product_id: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Product",
          },
          discount_type: {
            type: String,
            required: true,
            enum: ["flat", "percentage"],
          },
          discount: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Flash = mongoose.model("Flash", FlashSchema);

function validateFlash(flash) {
  const schema = Joi.object({
    resourceBundle: Joi.array()
      .items(
        Joi.object({
          languageCode: Joi.string().valid("en", "ar").required(),
          name: Joi.string().required(),
        }).required()
      )
      .required(),
    duration: Joi.object({
      from: Joi.date().greater("now").required(),
      to: Joi.date().greater(Joi.ref("from")).required(),
    }).required(),
    bg_color: Joi.string().required(),
    text_color: Joi.string().valid("white","dark").required(),
    products: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.objectId().required(),
          discount_type: Joi.string().valid("flat","percentage").required(),
          discount: Joi.number().required(),
        }).required()
      )
      ,
    featured: Joi.boolean(),
    status: Joi.boolean(),

  });

  return schema.validate(flash);
}

exports.Flash = Flash;
exports.validate = validateFlash;
