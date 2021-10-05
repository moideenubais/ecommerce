const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const ReviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Product",
    },
    product_owner: {
      type: String,
      required: true,
      trim: true,
    },
    customer_name: {
      type: String,
      trim: true,
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: String,
    publish: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);

function validateReview(review) {
  const schema = Joi.object({
    //only those who ordered the product can review after the order is completed
    order_id: Joi.objectId().required(),
    product_id: Joi.objectId().required(),
    product_owner: Joi.string().required(),
    customer_name: Joi.string().required(),
    customer_id: Joi.objectId(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string(),
  });

  return schema.validate(review);
}

exports.Review = Review;
exports.validate = validateReview;
