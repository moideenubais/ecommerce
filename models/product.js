const mongoose = require("mongoose");
// require('mongoose-long')(mongoose);
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// const materializedPlugin = require("mongoose-materialized");

const ProductSchema = new mongoose.Schema(
  {
    item_code: {
      type: String,
    },
    resourceBundle: [
      {
        languageCode: {
          type: String,
          required: "Please fill the langugage code for the product",
        },
        name: {
          type: String,
          required: "Please fill Product Name",
          trim: true,
          maxlength: 255,
        },
        description: String,
        modal_name: {
          type: String,
          trim: true,
          maxlength: 255,
        },
        manufactured_by: {
          type: String,
          trim: true,
          maxlength: 255,
        },
        manufacturing_country: {
          type: String,
          trim: true,
          maxlength: 255,
        },
      },
    ],
    category_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    brand_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
      default: null,
      // required: true,
    },
    unit: {
      type: String,
      trim: true,
    },
    minimum_purchase_quantity: Number,
    tags: [String],
    product_image_big_url: [
      {
        type: String,
        trim: true,
      },
    ],
    product_image_small_url: {
      type: String,
      trim: true,
    },
    product_video_url: {
      type: String,
      trim: true,
    },
    color_array: [
      {
        type: String,
        trim: true,
      },
    ],
    attribute_array: [String],
    attribute_value_object: [{}],
    prices: {
      type: [
        {
          barcode: {
            type: String,
            trim: true,
          },
          // varient_name: {
          //   type: String,
          //   required: "Please fill the varient_name for the product",
          //   trim: true,
          //   enum: ["size", "color", "default"],
          // },
          varient_value: {
            type: String,
            // required: "Please fill varient_value for the product",
            trim: true,
            maxlength: 255,
          },
          unit_price: {
            type: Number,
            required: true,
          },
          discount_range: {
            from: Date,
            to: Date,
          },
          discount_type: {
            type: String,
            enum: ["flat", "percentage"],
          },
          discount_amount: Number,
          quantity: {
            type: Number,
            required: true,
          },
          sold: [
            {
              //number of sold items with date
              date: {
                type: Date,
                required: true,
              },
              quantity: {
                type: Number,
                required: true,
              },
            },
          ],
          sku: String,
        },
      ],
      required: true,
    },
    //free shipping or not, if not does the shipping charge multiplied with the number of product
    shipping_config: {
      type: String,
      required: true,
      enum: ["free", "flat_rate"],
    },
    shipping_cost: Number,
    product_quantity_multiply: Boolean,
    //number of the product to show the stock quantity warining
    low_stock_warning: Number,
    stock_visible: {
      type: Boolean,
      default: false,
    },
    cash_on_delivery: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    todays_deal: {
      type: Boolean,
      default: false,
    },
    publish: {
      type: Boolean,
      default: false,
    },
    //estimated shipping time for the product
    shipping_time: {
      type: String,
      trim: true,
    },
    vat_tax: Number,
    created_by: {
      type: String,
      enum: ["admin", "seller"],
      required: true,
    },
    created_by_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
      // required: true,
      default: null,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

function validateProduct(product) {
  const schema = Joi.object({
    item_code: Joi.string(),
    resourceBundle: Joi.array()
      .items(
        Joi.object({
          languageCode: Joi.string().valid("en", "ar").required(),
          name: Joi.string().required(),
          description: Joi.string(),
          modal_name: Joi.string(),
          manufactured_by: Joi.string(),
          manufacturing_country: Joi.string(),
        }).required()
      )
      .required(),
    category_id: Joi.objectId().required(),
    brand_id: Joi.objectId(),

    unit: Joi.string(),
    minimum_purchase_quantity: Joi.number(),
    tags: Joi.string(),
    color_array: Joi.array().items(Joi.string()),
    attribute_array: Joi.array().items(Joi.string()),
    attribute_value_object: Joi.array().items(Joi.object()),
    prices: Joi.array()
      .items(
        Joi.object({
          barcode: Joi.string(),
          // varient_name: Joi.string()
          //   .valid("color", "size", "default")
          //   .required(),
          varient_value: Joi.string(),
          unit_price: Joi.number().required(),
          discount_range: Joi.object({
            from: Joi.date().greater("now"),
            to: Joi.date().greater(Joi.ref("from")),
          }),
          discount_type: Joi.string().valid("flat", "percentage"),
          discount_amount: Joi.number(),
          quantity: Joi.number().required(),
          sku: Joi.string(),
        }).required()
      )
      .required(),
    shipping_config: Joi.string().valid("free", "flat_rate").required(),
    shipping_cost: Joi.number(),
    product_quantity_multiply: Joi.boolean(),
    low_stock_warning: Joi.number(),
    stock_visible: Joi.boolean(),
    cash_on_delivery: Joi.boolean(),
    featured: Joi.boolean(),
    todays_deal: Joi.boolean(),
    publish: Joi.boolean(),
    shipping_time: Joi.string(),
    vat_tax: Joi.string(),
    product_video_url: Joi.string(),
    flash: Joi.object({
      flash_id: Joi.objectId().required(),
      discount_amount: Joi.number().required(),
      discount_type: Joi.string().valid("flat", "percentage").required(),
    }),
    // rating: Joi.string(),
  });

  return schema.validate(product);
}

exports.Product = Product;
exports.validate = validateProduct;
