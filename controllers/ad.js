const { Common } = require("../models/common");
const util = require("util");

const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");

const common = require("../common/common");
const { isEmpty } = require("lodash");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.listAds = async (req, res) => {
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  if (!_.isEmpty(req.query.search)) {
    query["ads.name"] = { $regex: req.query.search, $options: "i" };
  }

  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const adCount = await Common.aggregate([
      { $match: query },
      {
        $project: {
          // item: 1,
          numberOfAds: {
            $cond: {
              if: { $isArray: "$ads" },
              then: { $size: "$ads" },
              else: "NA",
            },
          },
        },
      },
    ]);
    const allAds = await Common.find(query, {
      ads: { $slice: [(page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE] },
    });
    if (_.isEmpty(allAds) || _.isEmpty(allAds[0].ads))
      return res.json({ msg: "No ads found" });
    if (!_.isEmpty(req.query.search)) {
      allAds[0].ads = allAds[0].ads.filter((ad) => {
        let regX = new RegExp(req.query.search, "i");
        return regX.test(ad.name);
      });
    }
    return res.json({
      ads: allAds[0].ads,
      info: {
        totalNumber: adCount[0].numberOfAds,
        hasNextPage: ITEMS_PER_PAGE * page < adCount[0].numberOfAds,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(adCount[0].numberOfAds / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in ad.getAds", error);
    return res.status(500).send("Server Error in ad.getAds");
  }
};

exports.getDocId = async (req, res, next) => {
  const commonDoc = await Common.find();
  if (_.isEmpty(commonDoc))
    return res.status(400).json({ err: "no document found in common db" });
  req.documentId = commonDoc[0]._id;
  next();
};

exports.createAd = async (req, res) => {
  const { error } = validateAdCreate(req.body);
  //   console.log("body", req.body, "filses", req.files);
  if (error) {
    deleteUploadedFiles(req.files);
    return res.status(400).json({ err: error.details[0].message });
  }

  let documentId = req.documentId;
  let adObject = { ad_type: req.body.ad_type };
  let { name } = req.body;
  if (!_.isEmpty(name)) adObject.name = name;
  if (!_.isEmpty(req.files)) {
    let pathArray = [];
    req.files.forEach((file) => {
      pathArray.push(file.path);
    });
    adObject.ad_url = pathArray;
  }

  try {
    const updated = await Common.findOneAndUpdate(
      { _id: documentId },
      { $push: { ads: adObject } },
      { new: true }
    );
    return res.json(updated.ads);
  } catch (err) {
    console.log("Server Error in ad.postAd", err);
    return res.status(400).send("Server Error in ad.postAd");
  }
};

exports.getSingleAd = async (req, res) => {
  try {
    const ad = await Common.find({
      _id: req.documentId,
      "ads._id": req.params.id,
    }).select("-__v");
    // console.log("ad",ad[0]);

    let currentAd = null;
    if (!_.isEmpty(ad)) {
      if (!_.isEmpty(ad[0].ads))
        currentAd = ad[0].ads.find((ad) => ad._id.equals(req.params.id));
    }

    if (_.isEmpty(currentAd))
      return res
        .status(404)
        .json({ msg: "The ad with the given ID was not found." });

    res.send(currentAd);
  } catch (err) {
    console.log("Server Error in ad.getSingleAd", err);
    return res.status(400).send("Server Error in ad.getSingleAd");
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const ad = await Common.find({
      _id: req.documentId,
    }).select("-__v");

    let currentAd = null;
    if (!_.isEmpty(ad)) {
      if (!_.isEmpty(ad[0].ads))
        currentAd = ad[0].ads.find((ad) => ad._id.equals(req.params.id));
    }

    if (_.isEmpty(currentAd))
      return res
        .status(404)
        .json({ msg: "The ad with the given ID was not found." });

    const updatedAd = await Common.updateMany(
      { _id: req.documentId },
      { $pull: { ads: { _id: req.params.id } } }
    );

    if (!_.isEmpty(currentAd.ad_url))
      currentAd.ad_url.forEach((url) => {
        if (url && fs.existsSync(url)) fs.unlinkSync(url);
      });

    return res.send(currentAd);
  } catch (error) {
    console.log("Server Error in ad.deleteAd", error);
    return res.status(400).json({
      err: "Server Error in ad.deleteAd",
    });
  }
};

exports.updateAd = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ msg: "Empty body" });
  }

  const { error } = validateAdUpdate(req.body);
  if (error) {
    deleteUploadedFiles(req.files);
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const ad = await Common.findOne(req.documentId).select("-__v");
    // console.log("ad",ad[0]);

    let currentAd = null;
    if (!_.isEmpty(ad)) {
      if (!_.isEmpty(ad.ads))
        currentAd = ad.ads.find((ad) => ad._id.equals(req.params.id));
    }

    if (_.isEmpty(currentAd))
      return res
        .status(404)
        .json({ msg: "The ad with the given ID was not found." });

    if (!_.isEmpty(req.body.ad_type)) currentAd.ad_type = req.body.ad_type;
    if (!_.isEmpty(req.body.name)) currentAd.name = req.body.name;

    if (!_.isEmpty(req.files)) {
      if (!_.isEmpty(currentAd.ad_url)) {
        currentAd.ad_url.forEach((url) => {
          if (fs.existsSync(url)) fs.unlinkSync(url);
        });
      }
      currentAd.ad_url = req.files.map((url) => url.path);
    }

    await ad.save();
    return res.send(currentAd);
  } catch (error) {
    console.log("Server Error in ad.updateAd", error);
    return res.status(500).send("Server Error in ad.updateAd");
  }
};

function validateAdCreate(ad) {
  const schema = Joi.object({
    // ads: Joi.object({
    ad_type: Joi.string().valid("removable_top", "top", "middle").required(),
    name: Joi.string(),
    // }),
  });

  return schema.validate(ad);
}
function validateAdUpdate(ad) {
  const schema = Joi.object({
    // ads: Joi.object({
    ad_type: Joi.string().valid("removable_top", "top", "middle"),
    name: Joi.string(),
    // }),
  });

  return schema.validate(ad);
}

const deleteUploadedFiles = (uploadedFiles) => {
  try {
    if (!_.isEmpty(uploadedFiles)) {
      uploadedFiles.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
  } catch (error) {
    console.log("Error while deleting the file in createAd", error);
    return res.status(400).json({
      err: "Error while deleting the file in createAd \n",
    });
  }
};
