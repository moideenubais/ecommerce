const express = require("express");
const router = express.Router();

const attribute = require("../controllers/attribute");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const policy = require("../policies/attribute");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get(attribute.listAttributes)
  .post([auth, policy.isAllowed], attribute.createAttribute);

router
  .route("/value/:id")
  .all(validateObjectId, auth, policy.isAllowed)
  .put(attribute.updateAttributeValue)
  .delete(attribute.deleteAttributeValue);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(attribute.getSingleAttribute)
  .put([auth, policy.isAllowed], attribute.updateAttribute)
  .delete(auth, policy.isAllowed, attribute.deleteAttribute);

module.exports = router;
