const express = require("express");
const router = express.Router();

const shop = require("../controllers/shop");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ShopImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

const policy = require("../policies/shop");

router
  .route("/")
  //TODO: add authentication
  //   .all(auth)
  .get(shop.listShops)
  .post(
    auth,
    policy.isAllowed,
    upload.fields([
      {
        name: "banner",
        maxCount: 5,
      },
      {
        name: "logo",
        maxCount: 1,
      },
    ]),
    shop.createShop
  );

router.route("/registerSeller").post(shop.registerSeller);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(shop.getSingleShop)
  .put(
    auth,
    policy.isAllowed,
    upload.fields([
      {
        name: "banner",
        maxCount: 5,
      },
      {
        name: "logo",
        maxCount: 1,
      },
    ]),
    shop.updateShop
  )
  .delete(auth, policy.isAllowed, shop.deleteShop);

module.exports = router;
