const _ = require("lodash");
const fs = require("fs");
const mongoose = require("mongoose");
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

exports.listRoles = async (req, res) => {
  let query = {};
  if (!_.isEmpty(req.query.page)) {
    const page = +req.query.page || 1;
    if (!_.isEmpty(req.query.search)) {
      query["roles.role_name"] = { $regex: req.query.search, $options: "i" };
    }
    //get only for main shop
    query["roles.shop_id"] = null;
    //by default, if the user is not from the main shop, then provide roles to the shop id of the user
    if (req.user.shop_id != null) query["roles.shop_id"] = req.user.shop_id;

    //shop_id is required if the main admin wants to create user for the other shops
    if (!_.isEmpty(req.query.shop_id)) {
      query["roles.shop_id"] = mongoose.Types.ObjectId(req.query.shop_id);
    }
    if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
    try {
      const roleCount = await Common.aggregate([
        { $match: query },
        {
          $project: {
            // item: 1,
            numberOfRoles: {
              $cond: {
                if: { $isArray: "$roles" },
                then: { $size: "$roles" },
                else: "NA",
              },
            },
          },
        },
      ]);

      const allRoles = await Common.find(query, {
        roles: { $slice: [(page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE] },
      }).lean();

      if (_.isEmpty(allRoles) || _.isEmpty(allRoles[0].roles))
        return res.json({ msg: "No roles found" });
      if (!_.isEmpty(req.query.search)) {
        allRoles[0].roles = allRoles[0].roles.filter((role) => {
          let regX = new RegExp(req.query.search, "i");
          return regX.test(role.role_name);
        });
      }
      //make the shop_id query work
      if (!_.isEmpty(req.query.shop_id)) {
        allRoles[0].roles = allRoles[0].roles.filter((role) =>
          role.shop_id.equals(req.query.shop_id)
        );
      }
      //check what are all the roles the user can access and give to other while creating user
      const finalRoleArray = [];
      let roles = allRoles[0].roles;
      const userRoleObj = await Common.findOne({ "roles._id": req.user.role });
      const userRole = userRoleObj.roles.find((role) =>
        role._id.equals(req.user.role)
      );
      // console.log("userRole",userRole)
      for (let i = 0; i < roles.length; i++) {
        let restart = false;
        // console.log("in loop 1",roles[i].role_name);
        let routes = roles[i].routes;
        for (let j = 0; j < routes.length; j++) {
          // console.log("in loop 2",j,routes[j]);
          let route = routes[j];
          let userRoute = userRole.routes.find((routeItem) =>
            routeItem.route_id.equals(route.route_id)
          );
          if (_.isEmpty(userRoute)) {
            // console.log("not route found");
            restart = true;
            break; //break
          }
          //paths the user has no access to
          const noAccessPath = _.difference(route.paths, userRoute.paths);
          // console.log("no Access",noAccessPath);
          if (!_.isEmpty(noAccessPath)) {
            // console.log("noAceessPath found");
            restart = true;
            break; //break
          }
          // console.log("end of loop")
        }
        if (restart) continue;
        // console.log("befor push",roles)
        finalRoleArray.push(roles[i]);
      }
      // console.log("final array before",finalRoleArray);
      //remove the user's role, since an admin cannot give admin role to another
      if (!_.isEmpty(finalRoleArray) && req.user.user_type != "super_admin") {
        userRoleIndex = finalRoleArray.findIndex((role) =>
          role._id.equals(req.user.role)
        );
        // console.log("userRoleindex",userRoleIndex);

        if (userRoleIndex != -1) finalRoleArray.splice(userRoleIndex, 1);

        // console.log("final array after",finalRoleArray);
      }

      return res.json({
        roles: finalRoleArray,
        info: {
          totalNumber: roleCount[0].numberOfRoles,
          hasNextPage: ITEMS_PER_PAGE * page < roleCount[0].numberOfRoles,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(roleCount[0].numberOfRoles / ITEMS_PER_PAGE),
        },
      });
    } catch (error) {
      console.log("Server Error in role.getRoles", error);
      return res.status(500).send("Server Error in role.getRoles");
    }
  }
  return res.json({ msg: "provide page and limit" });
  // try {
  //   const allRoles = await Common.findOne(req.documentId);
  //   if (_.isEmpty(allRoles.roles)) return res.json({ msg: "No roles found" });
  //   res.json({ roles: allRoles.roles });
  // } catch (error) {
  //   console.log("Server Error in role.getRoles", error);
  //   return res.status(500).send("Server Error in role.getRoles");
  // }
};

exports.getSingleRole = async (req, res) => {
  try {
    const role = await Common.find({
      _id: req.documentId,
      "roles._id": req.params.id,
    })
      .select("-__v")
      .populate("roles.shop_id");
    let currentRole = null;
    if (!_.isEmpty(role)) {
      if (!_.isEmpty(role[0].roles))
        currentRole = role[0].roles.find((role) =>
          role._id.equals(req.params.id)
        );
    }

    if (_.isEmpty(currentRole))
      return res
        .status(404)
        .json({ msg: "The role with the given ID was not found." });

    res.send(currentRole);
  } catch (err) {
    console.log("Server Error in role.getSingleRole", err);
    return res.status(400).send("Server Error in role.getSingleRole");
  }
};

exports.createRole = async (req, res) => {
  const { error } = validateRoleCreate(req.body);
  //   console.log("body", req.body, "filses", req.files);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  if (!_.isEmpty(req.body.shop_id)) {
    const shop = await common.shopCheck(req.body.shop_id);
    if (shop.error) {
      return res.status(shop.statusCode || 400).json({
        err: shop.msg || "Error in shop check",
      });
    }
  }

  let documentId = req.documentId;
  let roleObject = req.body;

  try {
    const updated = await Common.findOneAndUpdate(
      { _id: documentId },
      { $push: { roles: roleObject } },
      { new: true }
    );
    return res.json({ roles: updated.roles });
  } catch (err) {
    console.log("Server Error in role.postRole", err);
    return res.status(400).send("Server Error in role.postRole");
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Common.find({
      _id: req.documentId,
    }).select("-__v");

    let currentRole = null;
    if (!_.isEmpty(role)) {
      if (!_.isEmpty(role[0].roles))
        currentRole = role[0].roles.find((role) =>
          role._id.equals(req.params.id)
        );
    }

    if (_.isEmpty(currentRole))
      return res
        .status(404)
        .json({ msg: "The role with the given ID was not found." });

    const usersExistsUnder = await User.find({ role: currentRole._id });
    if (!_.isEmpty(usersExistsUnder))
      return res
        .status(400)
        .json({ err: "Can't delete, Users exists under this role" });

    const updatedRole = await Common.updateMany(
      { _id: req.documentId },
      { $pull: { roles: { _id: req.params.id } } }
    );

    return res.send(currentRole);
  } catch (error) {
    console.log("Server Error in role.deleteRole", error);
    return res.status(400).json({
      err: "Server Error in role.deleteRole",
    });
  }
};

exports.updateRole = async (req, res) => {
  if (_.isEmpty(req.body)) {
    return res.json({ msg: "Empty body" });
  }

  const { error } = validateRoleUpdate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const role = await Common.findOne(req.documentId).select("-__v");

    let currentRole = null;
    if (!_.isEmpty(role)) {
      if (!_.isEmpty(role.roles))
        currentRole = role.roles.find((role) => role._id.equals(req.params.id));
    }

    if (_.isEmpty(currentRole))
      return res
        .status(404)
        .json({ msg: "The role with the given ID was not found." });

    if (!_.isEmpty(req.body.role_name))
      currentRole.role_name = req.body.role_name;
    if (!_.isEmpty(req.body.routes)) currentRole.routes = req.body.routes;
    if (!_.isEmpty(req.body.shop_id)) {
      const shop = await common.shopCheck(req.body.shop_id);
      if (shop.error) {
        return res.status(shop.statusCode || 400).json({
          err: shop.msg || "Error in shop check",
        });
      }
      currentRole.shop_id = req.body.shop_id;
    }

    await role.save();
    return res.send(currentRole);
  } catch (error) {
    console.log("Server Error in role.updateRole", error);
    return res.status(500).send("Server Error in role.updateRole");
  }
};

exports.getRoleMap = async (req, res) => {
  try {
    const doc = await Common.findOne({ _id: req.documentId });
    if (_.isEmpty(doc) || _.isEmpty(doc.user_role_map))
      return res.status(400).json({ err: "couldn't find the doc" });
    return res.status(200).json({ roleMap: doc.user_role_map });
  } catch (error) {
    console.log("Server Error in role.getRoleMap", error);
    return res.status(500).send("Server Error in role.getRoleMap");
  }
};

exports.updateRoleMap = async (req, res) => {
  const { error } = validateRoleMap(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }
  const { super_admin, admin, org_admin, seller, delivery_boy, user } =
    req.body;
  const updateContent = {};
  if (!_.isEmpty(super_admin)) updateContent.super_admin = super_admin;
  if (!_.isEmpty(admin)) updateContent.admin = admin;
  if (!_.isEmpty(org_admin)) updateContent.org_admin = org_admin;
  if (!_.isEmpty(seller)) updateContent.seller = seller;
  if (!_.isEmpty(delivery_boy)) updateContent.delivery_boy = delivery_boy;
  if (!_.isEmpty(user)) updateContent.user = user;
  try {
    const updated = await Common.findByIdAndUpdate(
      req.documentId,
      { user_role_map: updateContent },
      {
        new: true,
      }
    );
    return res.status(200).send(updated);
  } catch (error) {
    console.log("Server Error in role.updateRoleMap", error);
    return res.status(500).send("Server Error in role.updateRoleMap");
  }
};

function validateRoleMap(roleMap) {
  const schema = Joi.object({
    super_admin: Joi.objectId(),
    admin: Joi.objectId(),
    org_admin: Joi.objectId(),
    seller: Joi.objectId(),
    delivery_boy: Joi.objectId(),
    user: Joi.objectId(),
  });
  return schema.validate(roleMap);
}

function validateRoleCreate(role) {
  const schema = Joi.object({
    shop_id: Joi.objectId(),
    role_name: Joi.string().required(),
    routes: Joi.array()
      .items({
        route_id: Joi.objectId().required(),
        route_name: Joi.string().required(),
        paths: Joi.array().items(Joi.string().required()).required(),
      })
      .required(),
  });

  return schema.validate(role);
}

function validateRoleUpdate(role) {
  const schema = Joi.object({
    shop_id: Joi.objectId(),
    role_name: Joi.string(),
    routes: Joi.array().items({
      route_id: Joi.objectId().required(),
      route_name: Joi.string().required(),
      paths: Joi.array().items(Joi.string().required()).required(),
    }),
  });

  return schema.validate(role);
}
