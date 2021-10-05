const express = require("express");
const router = express.Router();

const brand = require("../controllers/brand");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./BrandImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
const policy = require("../policies/brand");

router
  .route("/")
  //TODO: add authentication
  // .all(auth)
  .get(brand.listBrands)
  .post([auth, policy.isAllowed, upload.single("logo")], brand.createBrand);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(brand.getSingleBrand)
  .put([auth, policy.isAllowed, upload.single("logo")], brand.updateBrand)
  .delete(auth, policy.isAllowed, brand.deleteBrand);

module.exports = router;
