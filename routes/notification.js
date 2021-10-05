const express = require("express");
const router = express.Router();

const notification = require("../controllers/notification");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const policy = require("../policies/notification");

router
  .route("/")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(notification.listNotifications)
  .put(notification.updateNotifications);

module.exports = router;
