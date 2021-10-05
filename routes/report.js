const express = require("express");
const router = express.Router();

const report = require("../controllers/report");
const auth = require("../middleware/auth");

const policy = require("../policies/report");

router
  .route("/")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(report.getReportData);

router.route("/getGraphDataForCategory").get(report.getGraphDataForCategory);
router.route("/getGraphDataForBrand").get(report.getGraphDataForBrand);

router
  .route("/deliveryBoy")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(report.getDeliveryBoyReport);

router
  .route("/seller")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .get(report.getSellerReport);

module.exports = router;
