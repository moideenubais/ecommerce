const express = require("express");
const router = express.Router();

const category = require("../controllers/category");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./CategoryImages");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
const policy = require("../policies/category");

// router.get("/", service.getServices);
// router.post("/", [ upload.single("serviceImage")], service.postService);
// router.get("/:id", validateObjectId, service.getSingleService);
// router.delete("/:id", validateObjectId, service.deleteService);
// router.put("/:id", [upload.single("serviceImage")], service.updateService);

router
  .route("/")
  //TODO: add authentication
  //   .all(auth)
  .get(category.createRootNode, category.listCategorys)
  .post(
    auth,
    policy.isAllowed,
    upload.fields([
      {
        name: "category_banner",
        maxCount: 1,
      },
      {
        name: "category_icon",
        maxCount: 1,
      },
    ]),
    category.createRootNode,
    category.createCategory
  );

// router
//   .route("/children/")
//   //TODO: add authentication
// //   .all(auth,policy.isAllowed)
//   .get(category.getChildren);

router
  .route("/:id")
  //TODO: add authentication and policy
  .all(validateObjectId)
  .get(category.getSingleCategory)
  .put(
    auth,
    policy.isAllowed,
    upload.fields([
      {
        name: "category_banner",
        maxCount: 1,
      },
      {
        name: "category_icon",
        maxCount: 1,
      },
    ]),
    category.updateCategory
  )
  .delete(auth, policy.isAllowed, category.deleteCategory);

module.exports = router;
