const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity").default;
const bcrypt = require("bcrypt");
const _ = require("lodash");
const path = require("path");
const ejs = require("ejs");
const { User } = require("../models/user");
const { Common } = require("../models/common");
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// const log = require("../controllers/log");

const client = new OAuth2Client(process.env.OAUTH_ID);

const transporter = nodemailer.createTransport({
  // service: "gmail",
  host: "smtp.zoho.com",
  secure: true,
  port: 465,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).json({ err: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ msg: "Invalid username or password." });

  const validPassword = await bcrypt.compare(
    req.body.password.trim(),
    user.password
  );
  if (!validPassword)
    return res.status(400).json({ msg: "Invalid username or password." });

  const token = user.generateAuthToken();
  res.json({ token: token });
});

router.post("/google", async (req, res) => {
  const { tokenId } = req.body;
  if (_.isEmpty(tokenId))
    return res.status(400).json({ err: "tokenId is required" });

  try {
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.OAUTH_ID,
    });
    // console.log("resppppppppppp", response.payload);
    const { email_verified, name, email } = response.payload;
    if (email_verified) {
      let user = await User.findOne({ email });
      if (user) {
        const token = user.generateAuthToken();
        res.json({ token: token });
      } else {
        const doc = await Common.find();
        if (
          _.isEmpty(doc) ||
          _.isEmpty(doc[0].user_role_map) ||
          _.isEmpty(doc[0].user_role_map["user"])
        )
          return res.status(400).json({ err: "The user role map not found," });
        const userMap = doc[0].user_role_map;
        const role = userMap["user"];
        const password = email + process.env.PASSWORD_GOOGLE_SIGN_IN;
        const user = new User({
          name,
          email,
          password,
          shop_id: null,
          user_type: "user",
          role,
          language: "en",
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        const token = user.generateAuthToken();
        return res.json({ token: token });
      }
    } else {
      return res.status(400).json({ err: "Login failed" });
    }
  } catch (error) {
    console.log("Server Error in google login", error);
    return res.status(500).json({ err: "Server Error in login.google" });
  }
});

router.post("/resetPassword", async (req, res) => {
  if (_.isEmpty(req.body.email))
    return res.status(400).json({ err: "email is required" });

  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ msg: "No account found with current id" });

  try {
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.PASSWORD_RESET_JWT_KEY,
      { expiresIn: 300 }
    );
    const htmlData = await ejs.renderFile(
      path.join(__dirname, "../templates/passwordResetEmail.ejs"),
      { url: process.env.PASSWORD_RESET_URL + "?token=" + token }
    );
    // console.log("here", htmlData);
    // return;
    const mailOptions = {
      from: `Q Sales <${process.env.NODEMAILER_EMAIL}>`,
      to: req.body.email,
      subject: "Reset Password",
      html: htmlData,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error while sending email", error);
        return res.status(500).json({ err: "Error while sending email[1]" });
      } else {
        return res.status(200).json({ msg: "Email sent", data: info.response });
      }
    });
  } catch (err) {
    console.log("Error while sending email", err);
    return res.status(500).json({ err: "Error while sending email[2]" });
  }
});

router.post("/confirmPassword", async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const { error } = validateConfirmPassword(req.body);
  if (error) return res.status(400).json({ err: error.details[0].message });

  try {
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_JWT_KEY);
    let user = decoded;
    user = await User.findById(user._id);
    if (!user) return res.status(404).json({ msg: "user not found" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // user = User(user);
    await user.save();
    return res.json({ msg: "success" });
  } catch (ex) {
    console.log("Invalid token", ex);
    return res.status(500).json({ msg: "Invalid or expired token" });
  }
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().trim().required(),
  });

  return schema.validate(user);
}

function validateConfirmPassword(user) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: passwordComplexity().required(),
    confirm_password: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("confirm password")
      .options({ messages: { "any.only": "{{#label}} does not match" } }),
  });

  return schema.validate(user);
}

module.exports = router;
