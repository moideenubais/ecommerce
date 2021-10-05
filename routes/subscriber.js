const express = require("express");
const router = express.Router();

const subscriber = require("../controllers/subscriber");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const policy = require("../policies/subscriber");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get(auth, policy.isAllowed, subscriber.getDocId, subscriber.listSubscribers)
  .post(subscriber.getDocId, subscriber.createSubscriber);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(subscriber.getDocId, validateObjectId)
  //   .get(subscriber.getSingleSubscriber)
  //   .put([auth, policy.isAllowed, upload.single("logo")], subscriber.updateSubscriber)
  .delete(
    subscriber.getDocId,
    auth,
    policy.isAllowed,
    subscriber.deleteSubscriber
  );

module.exports = router;
