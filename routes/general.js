const express = require("express");
const router = express.Router();

const general = require("../controllers/role");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

//TODO: Add Policy
// const policy = require("../policies/policy");

router
  .route("/getSingleRole/:id")
  //TODO: add authentication and policy
  .all(validateObjectId, auth)
  .get(general.getDocId, general.getSingleRole);

module.exports = router;
