const { Notification } = require("../models/notification");
const _ = require("lodash");

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    // if(_.isEmpty(notifications))  return res.json({ msg: "No notifications found" });
    res.status(200).json({ notifications });
  } catch (error) {
    console.log("Server Error in notification.listNotifications", error);
    res
      .status(500)
      .json({ err: "Server Error in notification.listNotifications" });
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    if (_.isEmpty(req.body.type))
      return res.status(400).json({ err: "notification type is missing" });
    const notification = await Notification.deleteMany({ type: req.body.type });
    return res.json(notification);
  } catch (error) {
    console.log("Server Error in notification.updateNotificatons", error);
    res
      .status(500)
      .json({ err: "Server Error in notification.updateNotificatons" });
  }
};
