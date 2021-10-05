const express = require("express");
const router = express.Router();

const ad = require("../controllers/ad");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./AdImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
//TODO: Add Policy
const policy = require("../policies/ad");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get(ad.getDocId, ad.listAds)
  .post(
    [auth, policy.isAllowed, ad.getDocId, upload.array("ad", 10)],
    ad.createAd
  );

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(ad.getDocId, ad.getSingleAd)
  .put(
    [auth, policy.isAllowed, ad.getDocId, upload.array("ad", 10)],
    ad.updateAd
  )
  .delete(auth, policy.isAllowed, ad.getDocId, ad.deleteAd);

module.exports = router;
