const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity").default;
const fs = require("fs");
const { Common } = require("../models/common");

const { User, validate } = require("../models/user");
const { userTypeMap } = require("../common/constants");
const common = require("../common/common");

let ITEMS_PER_PAGE = 10000;
let DEFAULT_LANGUAGE = "en";

exports.getUsers = async (req, res) => {
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  const page = +req.query.page || 1;
  let accessableUserTypes = common.getAccessibleUserTypes(req.user.user_type);
  if (!_.isEmpty(accessableUserTypes)) {
    query.user_type = { $in: accessableUserTypes };
    if (
      !_.isEmpty(req.query.user_type) &&
      accessableUserTypes.includes(req.query.user_type)
    ) {
      query["user_type"] = req.query.user_type;
    }
  } else {
    return res.status(400).json({ err: "you cannot access user details" });
  }
  if (!_.isEmpty(req.query.search)) {
    query["name"] = { $regex: req.query.search, $options: "i" };
  }

  if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
  try {
    const userCount = await User.count(query);
    const allUsers = await User.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .select("-__v -password")
      .lean();
    if (_.isEmpty(allUsers)) return res.json({ msg: "No users found" });
    return res.json({
      users: allUsers,
      info: {
        totalNumber: userCount,
        hasNextPage: ITEMS_PER_PAGE * page < userCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(userCount / ITEMS_PER_PAGE),
      },
    });
  } catch (error) {
    console.log("Server Error in user.getUsers", error);
    return res.status(500).send("Server Error in user.getUsers");
  }
};

exports.postUser = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    deleteUploadedFiles(req.file);
    return res.status(400).json({ err: error.details[0].message });
  }

  const userExist = await User.findOne({ email: req.body.email });

  if (userExist) {
    deleteUploadedFiles(req.file);
    return res
      .status(400)
      .json({ msg: "User already exists with the same email" });
  }

  const {
    name,
    email,
    password,
    address,
    card_info,
    active,
    language,
    salary,
    // commission_per_product,
    shop_id,
    user_type,
    // role
  } = req.body;

  const doc = await Common.find();
  if (
    _.isEmpty(doc) ||
    _.isEmpty(doc[0].user_role_map) ||
    _.isEmpty(doc[0].user_role_map[user_type])
  )
    return res.status(400).json({ err: "The user role map not found," });
  const userMap = doc[0].user_role_map;
  const role = userMap[user_type];

  //check if the user has autherisation to add this user type
  if (!_.isEmpty(user_type) && user_type != "user") {
    let type_priority = userTypeMap.find(
      (type) => type.name == user_type
    ).priority;
    let current_user_type_priority = userTypeMap.find(
      (type) => type.name == req.user.user_type
    ).priority;
    if (type_priority <= current_user_type_priority) {
      return res.status(400).json({
        err: `Cannot set user_type ${user_type} as you have no autherization`,
      });
    }
  }

  const user = new User({
    name,
    email,
    password,
    shop_id: null,
    user_type: "user",
    role,
  });

  //default privilege value
  user.language = "en";

  if (!_.isEmpty(req.file)) user.image_url = req.file.path;

  if (!_.isEmpty(address)) user.address = address;
  if (!_.isEmpty(active)) user.active = active;
  if (!_.isEmpty(card_info)) user.card_info = card_info;
  if (!_.isEmpty(language)) user.language = language;
  if (!_.isEmpty(salary)) user.salary = salary;
  if (!_.isEmpty(shop_id)) user.shop_id = shop_id;
  if (!_.isEmpty(user_type)) user.user_type = user_type;
  // if (!_.isEmpty(commission_per_product))
  //   user.commission_per_product = commission_per_product;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    await user.save();
    const token = user.generateAuthToken();
    return res.json({ token: token });
  } catch (err) {
    console.log("Server Error in user.postUser", err);
    return res.status(400).json({ err: "Server Error in user.postUser" });
  }
};

exports.getSingleUser = async (req, res) => {
  let accessableUserTypes = common.getAccessibleUserTypes(req.user.user_type);
  let query = { _id: req.params.id };
  if (!_.isEmpty(accessableUserTypes))
    query.user_type = { $in: accessableUserTypes };
  const user = await User.findOne(query).select("-__v -password");

  if (!user)
    return res
      .status(404)
      .json({ msg: "The user with the given ID was not found." });

  res.send(user);
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);

    if (!user)
      return res
        .status(404)
        .json({ msg: "The user with the given ID was not found." });

    if (user.image_url && fs.existsSync(user.image_url))
      fs.unlinkSync(user.image_url);

    return res.send(user);
  } catch (error) {
    console.log("Server Error in user.deleteUser ", error);
    return res.status(500).json({ err: "Server error in user.deleteUser" });
  }
};

exports.updateUser = async (req, res) => {
  if (req.user.user_type === "user" && req.user._id != req.params.id) {
    return res.json({ err: "You cannot update others details" });
  }
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ err: "Empty body" });
  }
  const { error } = validateUser(req.body);
  if (error) {
    deleteUploadedFiles(req.file);
    return res.status(400).json({ err: error.details[0].message });
  }
  try {
    if (!_.isEmpty(req.body.email)) {
      const userExist = await User.findOne({ email: req.body.email });

      if (userExist && userExist._id != req.params.id) {
        deleteUploadedFiles(req.file);
        return res
          .status(400)
          .json({ msg: "User already exists with the same email" });
      }
    }
    const {
      name,
      email,
      password,
      address,
      card_info,
      active,
      language,
      salary,
      // commission_per_product,
      shop_id,
      user_type,
      // role
    } = req.body;

    //check if the user has autherisation to add this user type
    if (!_.isEmpty(user_type) && user_type != "user") {
      let type_priority = userTypeMap.find(
        (type) => type.name == user_type
      ).priority;
      let current_user_type_priority = userTypeMap.find(
        (type) => type.name == req.user.user_type
      ).priority;
      if (type_priority <= current_user_type_priority) {
        return res.status(400).json({
          err: `Cannot set user_type ${user_type} as you have no autherization`,
        });
      }
    }

    const existingUser = await User.findOne({ _id: req.params.id });
    if (!existingUser)
      return res
        .status(404)
        .json({ msg: "The user with the given ID was not found." });

    const userContent = {};

    if (!_.isEmpty(name)) userContent.name = name;
    if (!_.isEmpty(email)) userContent.email = email;
    if (!_.isEmpty(password) && req.user.user_type !== "user") {
      const salt = await bcrypt.genSalt(10);
      userContent.password = await bcrypt.hash(password, salt);
    }
    if (!_.isEmpty(address)) userContent.address = address;
    if (!_.isEmpty(card_info)) userContent.card_info = card_info;
    if (!_.isEmpty(active) && req.user.user_type !== "user")
      userContent.active = active;
    if (!_.isEmpty(language)) userContent.language = language;
    if (
      !_.isEmpty(salary) &&
      req.user.user_type !== "user" &&
      existingUser.user_type === "delivery_boy"
    )
      userContent.salary = salary;
    if (!_.isEmpty(shop_id) && req.user.user_type !== "user")
      userContent.shop_id = shop_id;
    // if (!_.isEmpty(role)) userContent.role = role;
    if (!_.isEmpty(user_type) && req.user.user_type !== "user") {
      const doc = await Common.find();
      if (
        _.isEmpty(doc) ||
        _.isEmpty(doc[0].user_role_map) ||
        _.isEmpty(doc[0].user_role_map[user_type])
      )
        return res.status(400).json({ err: "The user role map not found," });
      const userMap = doc[0].user_role_map;
      userContent.role = userMap[user_type];
      userContent.user_type = user_type;
    }

    if (!_.isEmpty(req.file)) {
      if (existingUser.image_url && fs.existsSync(existingUser.image_url))
        fs.unlinkSync(existingUser.image_url);
      userContent.image_url = req.file.path;
    }
    const user = await User.findByIdAndUpdate(req.params.id, userContent, {
      new: true,
    });

    const token = user.generateAuthToken();

    return res.send({ token });
  } catch (error) {
    console.log("Server Error in user.upadateUser", error);
    return res.status(500).send("Server Error in user.upadateUser");
  }
};

exports.updateCart = async (req, res) => {
  if (req.user.user_type === "user" && req.user._id != req.params.id) {
    return res.json({ err: "You cannot update others' cart" });
  }
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ err: "Empty body" });
  }
  const { error } = validateUpdateCart(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  try {
    const existingUser = await User.findById(req.params.id);
    if (!existingUser)
      return res.status(400).json({ err: "user with the given id not found" });
    if (!_.isUndefined(req.body.clear) && req.body.clear)
      existingUser.cart = [];
    if (!_.isEmpty(req.body.cart)) existingUser.cart = req.body.cart;
    await existingUser.save();
    res.status(200).json({ msg: "success" });
  } catch (error) {
    console.log("Error while fetching user in updateCart", error);
    return res.status(400).json({ err: "Server Error in cartUpdate" });
  }
};

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().max(50),
    email: Joi.string().email(),
    password: passwordComplexity(),
    confirm_password: Joi.any()
      .equal(Joi.ref("password"))
      .label("confirm password")
      .options({ messages: { "any.only": "{{#label}} does not match" } }),
    address: Joi.object({
      building_name: Joi.string(),
      street: Joi.string(),
      city: Joi.string(),
    }),
    card_info: Joi.object({
      number: Joi.string(),
      expiry_date: Joi.date(),
    }),
    active: Joi.boolean(),
    // role: Joi.objectId(),
    user_type: Joi.string().valid(
      "seller",
      "delivery_boy",
      "user",
      "admin",
      "org_admin"
    ),
    language: Joi.string(),
    salary: Joi.number(),
    // commission_per_product: Joi.number(),
    shop_id: Joi.objectId(),
  });

  return schema.validate(user);
}

function validateUpdateCart(user) {
  const schema = Joi.object({
    cart: Joi.array().items(
      Joi.object({
        product_id: Joi.objectId().required(),
        varient_id: Joi.objectId().required(),
        quantity: Joi.number().required(),
        _id: Joi.objectId(),
      })
    ),
    clear: Joi.boolean(),
  });

  return schema.validate(user);
}

const deleteUploadedFiles = (file) => {
  try {
    if (file) fs.unlinkSync(file.path);
  } catch (error) {
    console.log("Error while deleting the file in user.postUser", error);
    return res.status(400).json({
      err: "Error while deleting the file in user.postUser",
    });
  }
};
