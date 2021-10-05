const _ = require("lodash");
const fs = require("fs");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const common = require("../common/common");
const { Common } = require("../models/common");
const { User } = require("../models/user");

let ITEMS_PER_PAGE = 15;
let DEFAULT_LANGUAGE = "en";

exports.getDocId = async (req, res, next) => {
  const commonDoc = await Common.find();
  if (_.isEmpty(commonDoc))
    return res.status(400).json({ err: "no document found in common db" });
  req.documentId = commonDoc[0]._id;
  next();
};

exports.listRoleRoutes = async (req, res) => {
  let query = {};
  if (!_.isEmpty(req.query.page)) {
    const page = +req.query.page || 1;
    if (!_.isEmpty(req.query.search)) {
      query["routes.route_name"] = { $regex: req.query.search, $options: "i" };
    }

    if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
    try {
      const routeCount = await Common.aggregate([
        { $match: query },
        {
          $project: {
            // item: 1,
            numberOfRoutes: {
              $cond: {
                if: { $isArray: "$routes" },
                then: { $size: "$routes" },
                else: "NA",
              },
            },
          },
        },
      ]);

      const allRoutes = await Common.find(query, {
        routes: { $slice: [(page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE] },
      });
      if (_.isEmpty(allRoutes) || _.isEmpty(allRoutes[0].routes))
        return res.json({ msg: "No routes found" });
      if (!_.isEmpty(req.query.search)) {
        allRoutes[0].routes = allRoutes[0].routes.filter((route) => {
          let regX = new RegExp(req.query.search, "i");
          return regX.test(route.route_name);
        });
      }
      return res.json({
        routes: allRoutes[0].routes,
        info: {
          totalNumber: routeCount[0].numberOfRoutes,
          hasNextPage: ITEMS_PER_PAGE * page < routeCount[0].numberOfRoutes,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(routeCount[0].numberOfRoutes / ITEMS_PER_PAGE),
        },
      });
    } catch (error) {
      console.log("Server Error in route.getRoutes", error);
      return res.status(500).send("Server Error in route.getRoutes");
    }
  }
  try {
    const allRoleRoutes = await Common.findOne(req.documentId);
    if (_.isEmpty(allRoleRoutes.routes))
      return res.json({ msg: "No routes found" });
    res.json({ routes: allRoleRoutes.routes });
  } catch (error) {
    console.log("Server Error in roleRoute.getRoleRoutes", error);
    return res.status(500).send("Server Error in roleRoute.getRoleRoutes");
  }
};

exports.getSingleRoleRoute = async (req, res) => {
  try {
    const roleRoute = await Common.find({
      _id: req.documentId,
      "routes._id": req.params.id,
    }).select("-__v");

    let currentRoleRoute = null;
    if (!_.isEmpty(roleRoute)) {
      if (!_.isEmpty(roleRoute[0].routes))
        currentRoleRoute = roleRoute[0].routes.find((roleRoute) =>
          roleRoute._id.equals(req.params.id)
        );
    }

    if (_.isEmpty(currentRoleRoute))
      return res
        .status(404)
        .json({ msg: "The roleRoute with the given ID was not found." });

    res.send(currentRoleRoute);
  } catch (err) {
    console.log("Server Error in roleRoute.getSingleRoleRoute", err);
    return res.status(400).send("Server Error in roleRoute.getSingleRoleRoute");
  }
};

exports.createRoleRoute = async (req, res) => {
  const { error } = validateRoleRouteCreate(req.body);
  //   console.log("body", req.body, "filses", req.files);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  let documentId = req.documentId;
  let roleRouteObject = req.body;

  try {
    const updated = await Common.findOneAndUpdate(
      { _id: documentId },
      { $push: { routes: roleRouteObject } },
      { new: true }
    );
    return res.json({ routes: updated.routes });
  } catch (err) {
    console.log("Server Error in roleRoute.postRoleRoute", err);
    return res.status(400).send("Server Error in roleRoute.postRoleRoute");
  }
};

exports.deleteRoleRoute = async (req, res) => {
  try {
    const roleRoute = await Common.find({
      _id: req.documentId,
    }).select("-__v");

    let currentRoleRoute = null;
    if (!_.isEmpty(roleRoute)) {
      if (!_.isEmpty(roleRoute[0].routes))
        currentRoleRoute = roleRoute[0].routes.find((roleRoute) =>
          roleRoute._id.equals(req.params.id)
        );
    }

    if (_.isEmpty(currentRoleRoute))
      return res
        .status(404)
        .json({ msg: "The roleRoute with the given ID was not found." });

    const roles = roleRoute[0].roles ? roleRoute[0].roles : [];
    //Checks if the roleRoute is present in any roles....
    if (!_.isEmpty(roles)) {
      try {
        await checkRoutePresentInRole(roles, currentRoleRoute);
      } catch (error) {
        return res.status(404).json({
          msg: error.err,
        });
      }
    }

    const updatedRoleRoute = await Common.updateMany(
      { _id: req.documentId },
      { $pull: { routes: { _id: req.params.id } } }
    );

    return res.send(currentRoleRoute);
  } catch (error) {
    console.log("Server Error in roleRoute.deleteRoleRoute", error);
    return res.status(400).json({
      err: "Server Error in roleRoute.deleteRoleRoute",
    });
  }
};

exports.updateRoleRoute = async (req, res) => {
  if (_.isEmpty(req.body)) {
    return res.json({ msg: "Empty body" });
  }

  const { error } = validateRoleRouteUpdate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const roleRoute = await Common.findOne(req.documentId).select("-__v");

    let currentRoleRoute = null;
    if (!_.isEmpty(roleRoute)) {
      if (!_.isEmpty(roleRoute.routes))
        currentRoleRoute = roleRoute.routes.find((roleRoute) =>
          roleRoute._id.equals(req.params.id)
        );
    }

    if (_.isEmpty(currentRoleRoute))
      return res
        .status(404)
        .json({ msg: "The roleRoute with the given ID was not found." });

    if (!_.isEmpty(req.body.route_name))
      currentRoleRoute.route_name = req.body.route_name;
    if (!_.isEmpty(req.body.paths)) {
      const pathsToDelete = _.difference(
        currentRoleRoute.paths,
        req.body.paths
      );
      if (!_.isEmpty(pathsToDelete)) {
        //check if the path is present in any role
        try {
          await checkPathPresent(pathsToDelete, roleRoute.roles);
          pathsToDelete.forEach((path) => {
            currentRoleRoute.paths.splice(
              currentRoleRoute.paths.indexOf(path),
              1
            );
          });
        } catch (error) {
          return res.status(404).json({
            msg: `Cannot update paths, path ${error.path} present in role ${error.role}`,
          });
        }
      }
      if (_.isEmpty(currentRoleRoute.paths)) currentRoleRoute.paths = [];
      req.body.paths.forEach((path) => {
        if (currentRoleRoute.paths.indexOf(path) === -1)
          currentRoleRoute.paths.push(path);
      });
    }

    await roleRoute.save();
    return res.send(currentRoleRoute);
  } catch (error) {
    console.log("Server Error in roleRoute.updateRoleRoute", error);
    return res.status(500).send("Server Error in roleRoute.updateRoleRoute");
  }
};

function validateRoleRouteCreate(roleRoute) {
  const schema = Joi.object({
    route_name: Joi.string().required(),
    paths: Joi.array().items(Joi.string().required()).required(),
  });

  return schema.validate(roleRoute);
}

function validateRoleRouteUpdate(roleRoute) {
  const schema = Joi.object({
    route_name: Joi.string(),
    paths: Joi.array().items(Joi.string().required()),
  });

  return schema.validate(roleRoute);
}

const checkPathPresent = (pathsToDelete, roles) => {
  return new Promise((resolve, reject) => {
    !_.isEmpty(roles) &&
      roles.forEach((role) => {
        !_.isEmpty(role.routes) &&
          role.routes.forEach((route) => {
            pathsToDelete.forEach((pathToDelete) => {
              if (route.paths.includes(pathToDelete)) {
                reject({ path: pathToDelete, role: role.role_name });
              }
            });
          });
      });
    resolve();
  });
};

const checkRoutePresentInRole = (roles, currentRoleRoute) => {
  return new Promise((resolve, reject) => {
    roles.forEach((role) => {
      if (
        role.routes.some((route) => {
          return route.route_id.equals(currentRoleRoute._id);
        })
      )
        reject({
          err: "can't delete, The roleRoute is present under the roles",
        });
    });
    resolve();
  });
};
