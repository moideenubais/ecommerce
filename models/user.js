const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity").default;
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: {
        building_name: String,
        street: String,
        city: String,
      },
    },
    card_info: {
      type: {
        number: {
          type: String,
          trim: true,
        },
        expiry_date: Date,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: mongoose.Schema.ObjectId,
      ref: "Role",
      required: true,
    },
    user_type: {
      type: String,
      enum: [
        "seller",
        "delivery_boy",
        "user",
        "admin",
        "org_admin",
        "super_admin",
      ],
    },
    language: {
      type: String,
      enum: ["ar", "en"],
      default: "en",
    },
    salary: {
      type: Number,
      // required: isDeliveryBoy,
    },
    image_url: {
      type: String,
      trim: true,
    },
    shop_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
      default: null,
      // required: true,
    },
    earnings: {
      type: Number,
    },
    //it will be in percentage
    // commission_per_product: {
    //   type: Number,
    //   required: isSeller,
    // },
    cart: [
      {
        product_id: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        varient_id: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      address: this.address,
      role: this.role,
      active: this.active,
      language: this.language,
      card_info: this.card_info,
      salary: this.salary,
      name: this.name,
      shop_id: this.shop_id,
      earnings: this.earnings,
      user_type: this.user_type,
      // commission_per_product: this.commission_per_product,
      image_url: this.image_url,
    },
    process.env.JWT_KEY
  );
  return token;
};

const User = mongoose.model("User", UserSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity().required(),
    confirm_password: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("confirm password")
      .options({ messages: { "any.only": "{{#label}} does not match" } }),
    address: Joi.object({
      building_name: Joi.string(),
      street: Joi.string(),
      city: Joi.string(),
    }),
    card_info: Joi.object({
      number: Joi.string(),
      expiry_date: Joi.date(),
    }),
    active: Joi.boolean(),
    // role: Joi.objectId().required(),
    language: Joi.string(),
    user_type: Joi.string().valid(
      "seller",
      "delivery_boy",
      "user",
      "admin",
      "org_admin"
    ),
    salary: Joi.number(),
    shop_id: Joi.objectId(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
