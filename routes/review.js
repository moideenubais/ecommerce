const express = require("express");
const router = express.Router();

const review = require("../controllers/review");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const policy = require("../policies/review");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get(review.listReviews)
  .post([auth, policy.isAllowed], review.createReview);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(review.getSingleReview)
  .put([auth, policy.isAllowed], review.updateReview)
  .delete(auth, policy.isAllowed, review.deleteReview);

module.exports = router;
