const express = require("express");
const router = express.Router();

const flash = require("../controllers/flash");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./FlashImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
const policy = require("../policies/flash");

router
  .route("/")
  .get(flash.listFlashs)
  .post([auth, policy.isAllowed, upload.single("banner")], flash.createFlash);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(flash.getSingleFlash)
  .put([auth, policy.isAllowed, upload.single("banner")], flash.updateFlash)
  .delete(auth, policy.isAllowed, flash.deleteFlash);

module.exports = router;
