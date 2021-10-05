const { Common } = require("../models/common");
const util = require("util");

const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");

const common = require("../common/common");
const { isEmpty } = require("lodash");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.listSubscribers = async (req, res) => {
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["subscribers.email"] = { $regex: req.query.search, $options: "i" };
  }
  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const subscriberCount = await Common.aggregate([
      { $match: query },
      {
        $project: {
          // item: 1,
          numberOfSubscribers: {
            $cond: {
              if: { $isArray: "$subscribers" },
              then: { $size: "$subscribers" },
              else: "NA",
            },
          },
        },
      },
    ]);
    const allSubscribers = await Common.find(query, {
      subscribers: { $slice: [(page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE] },
    });
    if (_.isEmpty(allSubscribers) || _.isEmpty(allSubscribers[0].subscribers))
      return res.json({ msg: "No subscribers found" });
    if (!_.isEmpty(req.query.search)) {
      allSubscribers[0].subscribers = allSubscribers[0].subscribers.filter(
        (subscriber) => {
          let regX = new RegExp(req.query.search, "i");
          return regX.test(subscriber.email);
        }
      );
    }
    return res.json({
      subscribers: allSubscribers[0].subscribers,
      info: {
        totalNumber: subscriberCount[0].numberOfSubscribers,
        hasNextPage:
          ITEMS_PER_PAGE * page < subscriberCount[0].numberOfSubscribers,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(
          subscriberCount[0].numberOfSubscribers / ITEMS_PER_PAGE
        ),
      },
    });
  } catch (error) {
    console.log("Server Error in subscriber.getSubscribers", error);
    return res.status(500).send("Server Error in subscriber.getSubscribers");
  }
};

exports.getDocId = async (req, res, next) => {
  const commonDoc = await Common.find();
  if (_.isEmpty(commonDoc))
    return res.status(400).json({ err: "no document found in common db" });
  req.documentId = commonDoc[0]._id;
  next();
};

exports.createSubscriber = async (req, res) => {
  const { error } = validateSubscriberCreate(req.body);
  //   console.log("body", req.body, "filses", req.files);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  let documentId = req.documentId;
  let subscriberObject = { email: req.body.email };

  try {
    const updated = await Common.findOneAndUpdate(
      { _id: documentId },
      { $push: { subscribers: subscriberObject } },
      { new: true }
    );
    return res.json(updated.subscribers);
  } catch (err) {
    console.log("Server Error in subscriber.postSubscriber", err);
    return res.status(400).send("Server Error in subscriber.postSubscriber");
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Common.find({
      _id: req.documentId,
    }).select("-__v");

    let currentSubscriber = null;
    if (!_.isEmpty(subscriber)) {
      if (!_.isEmpty(subscriber[0].subscribers))
        currentSubscriber = subscriber[0].subscribers.find((subscriber) =>
          subscriber._id.equals(req.params.id)
        );
    }

    if (_.isEmpty(currentSubscriber))
      return res
        .status(404)
        .json({ msg: "The subscriber with the given ID was not found." });

    const updatedSubscriber = await Common.updateMany(
      { _id: req.documentId },
      { $pull: { subscribers: { _id: req.params.id } } }
    );

    return res.send(currentSubscriber);
  } catch (error) {
    console.log("Server Error in subscriber.deleteSubscriber", error);
    return res.status(400).json({
      err: "Server Error in subscriber.deleteSubscriber",
    });
  }
};

function validateSubscriberCreate(subscriber) {
  const schema = Joi.object({
    email: Joi.string().required(),
  });

  return schema.validate(subscriber);
}
