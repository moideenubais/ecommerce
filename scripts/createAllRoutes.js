const _ = require("lodash");

const mongoose = require("mongoose");
const { Common } = require("../models/common");
const { routes: routeArray } = require("../common/constants");

createAllRoutes = async () => {
  const commonDataExists = await Common.find();

  if (_.isEmpty(commonDataExists[0])) {
    console.log("No data in common db");
    return;
  }

  const documentId = commonDataExists[0]._id;

  // const doc = await Common.findOne(documentId);

  try {
    const updatedRoute = await Common.findOneAndUpdate(
      { _id: documentId },
      { routes: routeArray },
      { new: true }
    );
  } catch (err) {
    console.log("Server Error in roleRoute.postRoleRoute", err);
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
    await createAllRoutes();
    mongoose.disconnect();
    console.log("Disconnected from the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
