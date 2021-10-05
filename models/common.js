const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const CommonSchema = new mongoose.Schema(
  {
    subscribers: [
      {
        email: {
          type: String,
          required: "Please fill the email",
        },
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    ads: [
      {
        ad_type: {
          type: String,
          required: "Please fill the ad type",
        },
        name: {
          type: String,
          required: "Please fill the ad type",
        },
        ad_url: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],
    roles: [
      {
        shop_id: {
          type: mongoose.Schema.ObjectId,
          // required: true,
          default: null,
          ref: "Shop",
        },
        role_name: String,
        routes: [
          {
            route_id: mongoose.Schema.ObjectId,
            route_name:String,
            paths: {
              type: [String],
              trim: true,
            },
          },
        ],
      },
    ],
    routes: [
      {
        route_name: String,
        paths: {
          type: [String],
          trim: true,
        },
      },
    ],
    user_role_map: {
      type: new mongoose.Schema({
        super_admin: mongoose.Schema.ObjectId,
        org_admin: mongoose.Schema.ObjectId,
        admin: mongoose.Schema.ObjectId,
        seller: mongoose.Schema.ObjectId,
        delivery_boy: mongoose.Schema.ObjectId,
        user: mongoose.Schema.ObjectId,
      }),
    },
  },
  { timestamps: true }
);

const Common = mongoose.model("Common", CommonSchema);

function validateCommon(common) {
  const schema = Joi.object({
    subscribers: Joi.array().items(Joi.string()),
    ads: Joi.array().items(
      Joi.object({
        ad_type: Joi.string().valid("top", "middle").required(),
        name: Joi.string(),
      })
    ),
  });

  return schema.validate(common);
}

exports.Common = Common;
// exports.validate = validateCommon;
