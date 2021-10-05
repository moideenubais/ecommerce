const _ = require("lodash");
const bcrypt = require("bcrypt");

const { User } = require("../models/user");
const mongoose = require("mongoose");
const { Common } = require("../models/common");

createSuperAdmin = async () => {
  const userExist = await User.findOne({ email: "superadmin@gmail.com" });

  if (userExist) {
    console.log("user exists with email id");
    return;
  }

  const rootRole = await Common.findOne({ "roles.role_name": "Super Admin" });
  if (!rootRole) {
    console.log("No role with name Super Admin found");
    return;
  }

  const user = new User({
    name: "super admin",
    email: "superadmin@gmail.com",
    password: "Superadmin@1",
    role: rootRole.roles.find((role) => role.role_name == "Super Admin")._id,
    user_type: "super_admin",
    language: "en",
    shop_id:null
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    await user.save();
  } catch (err) {
    console.log("Server Error in user.postUser", err);
  }
};

mongoose
  .connect("mongodb://localhost:27017/qsales", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(async () => {
    console.log("Connected to the database!");
    await createSuperAdmin();
    mongoose.disconnect();
    console.log("Disconnected from the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
