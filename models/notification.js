const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum:["order"]
    },
    type_id: mongoose.Schema.ObjectId,
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

function validateNotification(notification) {
  const schema = Joi.object({
    type: Joi.string().required(),
    name: Joi.objectId(),
  });

  return schema.validate(notification);
}

exports.Notification = Notification;
exports.validate = validateNotification;
