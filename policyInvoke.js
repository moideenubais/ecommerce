exports.invokePolices = () => {
  require("./policies/roleRoute").invokeRolesPolicies();
  require("./policies/role").invokeRolesPolicies();
  require("./policies/ad").invokeRolesPolicies();
  require("./policies/brand").invokeRolesPolicies();
  require("./policies/category").invokeRolesPolicies();
  require("./policies/flash").invokeRolesPolicies();
  require("./policies/notification").invokeRolesPolicies();
  require("./policies/order").invokeRolesPolicies();
  require("./policies/product").invokeRolesPolicies();
  require("./policies/report").invokeRolesPolicies();
  require("./policies/shop").invokeRolesPolicies();
  require("./policies/user").invokeRolesPolicies();
  require("./policies/subscriber").invokeRolesPolicies();
  require("./policies/color").invokeRolesPolicies();
  require("./policies/attribute").invokeRolesPolicies();
  require("./policies/review").invokeRolesPolicies();
};
