const express = require("express");
const router = express.Router();

const product = require("../controllers/product");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ProductImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

const storageCSV = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const uploadCSV = multer({ storage: storageCSV });
//TODO: Add Policy
const policy = require("../policies/product");

router
  .route("/")
  //TODO: add authentication
  //   .all(auth)
  .get(auth, product.listProducts)
  .post(
    auth,
    policy.isAllowed,
    upload.fields([
      {
        name: "product_image_big",
        maxCount: 5,
      },
      {
        name: "product_image_small",
        maxCount: 1,
      },
      {
        name: "product_video",
        maxCount: 1,
      },
    ]),
    product.createProduct
  );

router
  .route("/productBulkUpload")
  //TODO: add authentication
  .all(auth, policy.isAllowed)
  .post(
    uploadCSV.single("file"),
    product.loadProductDataFromCSV,
    product.ProductBulkUpload
  );

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(product.getSingleProduct)
  .put(
    auth,
    policy.isAllowed,
    upload.fields([
      {
        name: "product_image_big",
        maxCount: 5,
      },
      {
        name: "product_image_small",
        maxCount: 1,
      },
      {
        name: "product_video",
        maxCount: 1,
      },
    ]),
    product.updateProduct
  )
  .delete(auth, policy.isAllowed, product.deleteProduct);

module.exports = router;
