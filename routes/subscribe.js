const express = require("express");
const router = express.Router();
const webpush = require("web-push");

const auth = require("../middleware/auth");

webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

//TODO: Add Policy
// const policy = require("../policies/policy");

router
  .route("/")
  //TODO: add authentication
  //   .all(auth)
  .post((req, res) => {
    const subscription = req.body;
    console.log(subscription);

    const payload = subscription.data
      ? JSON.stringify(subscription.data)
      : JSON.stringify({
          title: "Hello!",
          body: "It works.",
        });

    webpush
      .sendNotification(subscription.subscription, payload)
      .then((result) => {
        // console.log(result);
      })
      .catch((error) => console.error(error.stack));
    res.status(200).json({ success: true });
  });

module.exports = router;
