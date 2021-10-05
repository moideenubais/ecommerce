const _ = require("lodash");

const mongoose = require("mongoose");
const { Common } = require("../models/common");

createCommonDB = async () => {
  const commonDataExists = await Common.find();

  if (!_.isEmpty(commonDataExists)) {
    console.log("Data exists in common db");
    return;
  }

  const commonData = new Common({
    subscribers: [],
    ads: [],
  });

  try {
    await commonData.save();
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
    await createCommonDB();
    mongoose.disconnect();
    console.log("Disconnected from the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
