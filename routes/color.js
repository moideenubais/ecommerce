const express = require("express");
const router = express.Router();

const color = require("../controllers/color");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const policy = require("../policies/color");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get(color.listColors)
  .post([auth, policy.isAllowed], color.createColor);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(color.getSingleColor)
  .put([auth, policy.isAllowed], color.updateColor)
  .delete(auth, policy.isAllowed, color.deleteColor);

module.exports = router;
