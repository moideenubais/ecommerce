/**
 * Module dependencies.
 */
let acl = require("acl");
const _ = require("lodash");
const { Common } = require("../models/common");

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke khub Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ["getAllNotifications"],
      allows: [
        {
          resources: ["/api/notification/"],
          permissions: ["get"],
        },
      ],
    },
    {
      roles: ["createNotification"],
      allows: [
        {
          resources: ["/api/notification/"],
          permissions: ["post"],
        },
      ],
    },
    {
      roles: ["getSingleNotification"],
      allows: [
        {
          resources: ["/api/notification/:id"],
          permissions: ["get"],
        },
      ],
    },
    {
      roles: ["updateNotification"],
      allows: [
        {
          resources: ["/api/notification/"],
          permissions: ["put"],
        },
      ],
    },
    {
      roles: ["deleteNotification"],
      allows: [
        {
          resources: ["/api/notification/:id"],
          permissions: ["delete"],
        },
      ],
    },
  ]);
};

/**
 * Check If Route Policy Allows
 */
exports.isAllowed = async function (req, res, next) {
  const userRole = req.user ? req.user.role : null;
  const path = req.baseUrl + req.route.path;
  if (_.isEmpty(userRole))
    return res.status(400).json({ err: "No role is present for the user" });
  let accessiblePaths = [];
  try {
    const role = await Common.find();

    let currentRole = null;
    if (!_.isEmpty(role)) {
      if (!_.isEmpty(role[0].roles))
        currentRole = role[0].roles.find((role) => role._id.equals(userRole));
    }

    if (_.isEmpty(currentRole))
      return res
        .status(404)
        .json({ msg: "The role with the given ID was not found." });

    let currentRoute = null;
    if (!_.isEmpty(role)) {
      if (!_.isEmpty(role[0].routes))
        currentRoute = role[0].routes.find(
          (route) => route.route_name == "notification"
        );
    }

    if (_.isEmpty(currentRoute))
      return res
        .status(404)
        .json({ msg: "The route with the name notification not found." });

    const currentRouteInRole = currentRole.routes.find((route) =>
      route.route_id.equals(currentRoute._id)
    );
    if (_.isEmpty(currentRouteInRole) || _.isEmpty(currentRouteInRole.paths))
      return res.status(403).json({
        //this means user is present, but he does not have authorization
        msg: "User is not authorized",
      });

    accessiblePaths = currentRouteInRole.paths;
    // console.log("access",accessiblePaths,"\nPath",path,"\nmehtod",req.method,accessiblePaths.includes('updateNotification'))
  } catch (err) {
    console.log("Server Error in policy.gettingRole", err);
    return res.status(400).send("Server Error in policy.gettingRole");
  }

  // Check for user roles
  acl.areAnyRolesAllowed(
    accessiblePaths,
    path,
    req.method.toLowerCase(),
    function (err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).send("Unexpected authorization error");
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          if (!req.user) {
            //If user is not present
            return res.status(401).json({
              message: "You need to signin to continue",
            });
          } else {
            return res.status(403).json({
              //this means user is present, but he does not have authorization
              msg: "User is not authorized",
            });
          }
        }
      }
    }
  );
};
