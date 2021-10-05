const express = require("express");
const router = express.Router();

const role = require("../controllers/role");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

//TODO: Add Policy
const policy = require("../policies/role");

router
  .route("/")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(role.getDocId, role.listRoles)
  .post(role.getDocId, role.createRole);

router
  .route("/roleMap")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(role.getDocId, role.getRoleMap)
  .put(role.getDocId, role.updateRoleMap);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId, auth, policy.isAllowed)
  .get(role.getDocId, role.getSingleRole)
  .put(role.getDocId, role.updateRole)
  .delete(role.getDocId, role.deleteRole);

module.exports = router;
