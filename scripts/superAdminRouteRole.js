const _ = require("lodash");

const mongoose = require("mongoose");
const { Common } = require("../models/common");

createSuperRouteAndRole = async () => {
  const commonDataExists = await Common.find();

  if (_.isEmpty(commonDataExists[0])) {
    console.log("No data in common db");
    return;
  }

  const documentId = commonDataExists[0]._id;

  try {
    const routes = commonDataExists[0].routes.map((route) => {
      return {
        route_id: route._id,
        route_name: route.route_name,
        paths: route.paths,
      };
    });

    const role_name = "Super Admin";

    await Common.findOneAndUpdate(
      { _id: documentId },
      { $push: { roles: { role_name, routes } } },
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
    await createSuperRouteAndRole();
    mongoose.disconnect();
    console.log("Disconnected from the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
