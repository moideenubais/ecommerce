const express = require("express");
const router = express.Router();

const roleRoute = require("../controllers/roleRoute");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

//TODO: Add Policy
const policy = require("../policies/roleRoute");

router
  .route("/")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(roleRoute.getDocId, roleRoute.listRoleRoutes)
  .post(roleRoute.getDocId, roleRoute.createRoleRoute);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId, auth, policy.isAllowed)
  .get(roleRoute.getDocId, roleRoute.getSingleRoleRoute)
  .put(roleRoute.getDocId, roleRoute.updateRoleRoute)
  .delete(roleRoute.getDocId, roleRoute.deleteRoleRoute);

module.exports = router;
