const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const OrderSchema = new mongoose.Schema(
  {
    order_code: {
      type: String,
      required: true,
    },
    products: {
      type: [
        {
          product_id: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Product",
          },
          varient_id: {
            type: mongoose.Schema.ObjectId,
            required: true,
            // ref: "Product",
          },
          varient_value: {
            type: String,
            trim: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          sku: String,
          name: {
            type: String,
            required: true,
          },
          shipping_config: {
            type: String,
            required: true,
          },
          shipping_cost: Number,
          product_quantity_multiply: Boolean,
          cost: {
            type: Number,
            required: true,
          },
          discount: Number,
          discount_type: {
            type: String,
            enum: ["flat", "percentage"],
          },
        },
      ],
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      //   required: true,
      //customer can place order witout logging in
    },
    customer_name: {
      type: String,
      required: true,
    },
    delivery_boy_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    shipping_address: {
      type: {
        building_name: String,
        street: String,
        city: String,
      },
      required: true,
    },
    delivery_note: String,
    delivery_time: {
      type: String,
      required: true,
    },
    delivery_status: {
      type: String,
      default: "yet_to_dispatch",
      enum: [
        "yet_to_dispatch",
        "dispatched",
        "in_transit",
        "out_for_delivery",
        "delivered",
      ],
    },
    order_status: {
      type: String,
      required: true,
      enum: ["open", "confirmed", "completed", "cancelled"],
    },
    payment_status: {
      type: String,
      required: true,
      enum: ["unpaid", "failed", "expired", "paid"],
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["cod", "card"],
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

function validateOrder(order) {
  const schema = Joi.object({
    products: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.objectId().required(),
          quantity: Joi.number().required(),
          varient_id: Joi.objectId().required(),
          varient_value: Joi.string().required(),
        }).required()
      )
      .required(),
    customer_id: Joi.string(),
    customer_name: Joi.string().required(),
    shipping_address: Joi.object({
      building_name: Joi.string(),
      street: Joi.string(),
      city: Joi.string(),
    }),
    delivery_note: Joi.string(),
    delivery_time: Joi.string().required(),
    // order_status: Joi.string()
    //   .valid("confirmed", "completed", "cancelled")
    //   .required(),
    payment_status: Joi.string()
      .valid("unpaid", "failed", "expired", "paid")
      .required(),
    payment_method: Joi.string().valid("cod", "card").required(),
  });

  return schema.validate(order);
}

exports.Order = Order;
exports.validate = validateOrder;
