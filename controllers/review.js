const { Review, validate } = require("../models/review");

const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const common = require("../common/common");
const { Product } = require("../models/product");
const { Order } = require("../models/order");

let ITEMS_PER_PAGE = 15;
let DEFAULT_LANGUAGE = "en";

exports.listReviews = async (req, res) => {
  let query = {};
  let sort = { rating: 1 };
  if (!_.isEmpty(req.query.ratings) && req.query.ratings === "high_to_low") {
    sort.rating = -1;
  }
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  if (!_.isEmpty(req.query.page)) {
    const page = +req.query.page || 1;
    // query.parentId = { $ne: null };
    // let sort = {name:1};
    if (!_.isEmpty(req.query.search)) {
      query["resourceBundle.name"] = {
        $regex: req.query.search,
        $options: "i",
      };
    }
    // if (!_.isEmpty(req.query.sort)) {
    //   if(req.query.sort == 'desc')
    //   sort.name = -1;
    // }

    if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
    try {
      const reviewCount = await Review.count(query);
      const allReviews = await Review.find(query)
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate("product_id", "resourceBundle")
        .sort(sort)
        .select("-__v")
        .lean();
      if (_.isEmpty(allReviews)) return res.json({ msg: "No reviews found" });
      allReviews.forEach((review) => {
        const i18nResourceBundle = common.getResourceBundle(
          languageCode,
          review.product_id.resourceBundle
        );
        review.productI18nResourceBundle = i18nResourceBundle;
        // delete review.resourceBundle;
      });
      // res.send(allReviews);
      return res.json({
        reviews: allReviews,
        info: {
          totalNumber: reviewCount,
          hasNextPage: ITEMS_PER_PAGE * page < reviewCount,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(reviewCount / ITEMS_PER_PAGE),
        },
      });
    } catch (error) {
      console.log("Server Error in review.getReviews", error);
      return res.status(500).send("Server Error in review.getReviews");
    }
  }
  try {
    const allReviews = await Review.find();
    if (_.isEmpty(allReviews)) return res.json({ msg: "No reviews found" });
    res.send(allReviews);
  } catch (error) {
    return res.status(500).send("Server Error in review.getReviews");
  }
};

exports.createReview = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  const {
    product_id,
    product_owner,
    customer_name,
    customer_id,
    rating,
    comment,
  } = req.body;
  const productExist = await common.productCheck(product_id);
  if (productExist.error) {
    return res.status(productExist.statusCode || 400).json({
      err: productExist.msg || "Error in product check",
    });
  }
  if (!_.isEmpty(customer_id)) {
    const user = await common.userCheck(customer_id);
    if (user.error) {
      return res.status(user.statusCode || 400).json({
        err: user.msg || "Error in user check",
      });
    }
  }
  const orderExists = await Order.findOne({ _id: req.body.order_id });
  if (!orderExists) {
    return res.status(400).json({ err: "Order with the given id not found" });
  }
  if (orderExists.order_status !== "completed") {
    return res
      .status(400)
      .json({ err: "Only completed order can be reviewed" });
  }
  //Not checking if the user has already done the review....not possible as not logged in user can order and review products
  const review = new Review({
    product_id,
    product_owner,
    customer_name,
    rating,
  });
  if (!_.isEmpty(customer_id)) review.customer_id = customer_id;
  if (!_.isEmpty(comment)) review.comment = comment;
  try {
    const savedReview = await review.save();
    return res.json(savedReview);
  } catch (err) {
    console.log("Server Error in review.postReview", err);
    return res.status(400).send("Server Error in review.postReview");
  }
};

exports.getSingleReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).select("-__v");

    if (!review)
      return res
        .status(404)
        .json({ msg: "The review with the given ID was not found." });

    res.send(review);
  } catch (err) {
    console.log("Server Error in review.getSingleReview", err);
    return res.status(400).send("Server Error in review.getSingleReview");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const existingReview = await Review.findById(req.params.id);
    if (!existingReview)
      return res
        .status(404)
        .json({ msg: "The review with the given ID was not found." });

    const review = await Review.findByIdAndRemove(req.params.id);
    return res.send(review);
  } catch (error) {
    console.log("Server Error in review.deleteReview", error);
    return res.status(400).json({
      err: "Server Error in review.deleteReview",
    });
  }
};

exports.updateReview = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ msg: "Empty body" });
  }

  const { error } = validateReview(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingReview = await Review.findOne({ _id: req.params.id });
    if (!existingReview)
      return res
        .status(404)
        .json({ msg: "The review with the given ID was not found." });

    const reviewContent = {};
    if (!_.isEmpty(req.body.product_id)) {
      const productExist = await common.productCheck(req.body.product_id);
      if (productExist.error) {
        return res.status(productExist.statusCode || 400).json({
          err: productExist.msg || "Error in product check",
        });
      }
      reviewContent.product_id = req.body.product_id;
    }
    if (!_.isEmpty(req.body.customer_id)) {
      const user = await common.userCheck(req.body.customer_id);
      if (user.error) {
        return res.status(user.statusCode || 400).json({
          err: user.msg || "Error in user check",
        });
      }
      reviewContent.product_id = req.body.product_id;
    }
    if (!_.isEmpty(req.body.product_owner))
      reviewContent.product_owner = req.body.product_owner;
    if (!_.isEmpty(req.body.customer_name))
      reviewContent.customer_name = req.body.customer_name;
    if (!_.isEmpty(req.body.rating)) reviewContent.rating = req.body.rating;
    if (!_.isEmpty(req.body.comment)) reviewContent.comment = req.body.comment;
    if (!_.isUndefined(req.body.publish))
      reviewContent.publish = req.body.publish;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      reviewContent,
      {
        new: true,
      }
    );

    res.send(review);
  } catch (error) {
    console.log("Server Error in review.updateReview", error);
    return res.status(500).send("Server Error in review.updateReview");
  }
};

function validateReview(review) {
  const schema = Joi.object({
    product_id: Joi.objectId(),
    product_owner: Joi.string(),
    customer_name: Joi.string(),
    customer_id: Joi.objectId(),
    rating: Joi.number().min(1).max(5),
    comment: Joi.string(),
    publish: Joi.boolean(),
  });

  return schema.validate(review);
}
