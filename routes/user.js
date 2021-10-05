const express = require("express");
const router = express.Router();

const user = require("../controllers/user");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const policy = require("../policies/user");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./UserImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

router
  .route("/")
  // .all(auth, policy.isAllowed) //.all(kHubPolicy.isAllowed) need to include policy
  .get(auth, policy.isAllowed, user.getUsers)
  .post([upload.single("image")], auth, user.postUser);

router
  .route("/updateCart/:id")
  .all(validateObjectId)
  .put(auth, policy.isAllowed, user.updateCart);

router
  .route("/:id")
  .all(validateObjectId) //add auth and policy
  .get(auth, policy.isAllowed, user.getSingleUser)
  .put([auth, policy.isAllowed, upload.single("image")], user.updateUser)
  .delete(auth, policy.isAllowed, user.deleteUser);

module.exports = router;
