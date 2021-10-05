const express = require("express");
const router = express.Router();

const order = require("../controllers/order");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const policy = require("../policies/order");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get([auth, policy.isAllowed], order.listOrders)
  .post(order.createOrder);

router
  .route("/deliveryBoyAssignedOrders")
  .all(auth, policy.isAllowed)
  .get(order.getDeliveryBoyAssignedOrders);

router
  .route("/deliveryBoyCompletedOrders")
  .all(auth, policy.isAllowed)
  .get(order.getDeliveryBoyCompletedOrders);

router.route("/getOrderPdf/:id").all(validateObjectId).get(order.getOrderPdf);

router
  .route("/updateOrderStatus/:id")
  .all(validateObjectId, auth, policy.isAllowed)
  .put(order.updateOrderStatus);

router
  .route("/updatePaymentStatus/:id")
  .all(validateObjectId, auth, policy.isAllowed)
  .put(order.updatePaymentStatus);

router
  .route("/updateDeliveryStatus/:id")
  .all(validateObjectId, auth, policy.isAllowed)
  .put(order.updateDeliveryStatus);

router
  .route("/updateDeliveryBoy/:id")
  .all(validateObjectId, auth, policy.isAllowed)
  .put(order.updateDeliveryBoy);

router
  .route("/cancelOrder/:id")
  .all(validateObjectId, auth, policy.isAllowed)
  .put(order.cancelOrder);

router
  .route("/:id")
  .all(validateObjectId)
  .get(auth, policy.isAllowed, order.getSingleOrder)
  //   .put([auth, policy.isAllowed], order.updateOrder)  not needed yet
  .delete(auth, policy.isAllowed, order.deleteOrder);

module.exports = router;
