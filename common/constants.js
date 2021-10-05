exports.userTypeMap = [
  { priority: 1, name: "super_admin" },
  { priority: 2, name: "org_admin" },
  { priority: 3, name: "admin" },
  { priority: 4, name: "seller" },
  { priority: 5, name: "delivery_boy" },
  { priority: 6, name: "user" },
];

exports.routes = [
  {
    route_name: "route",
    paths: [
      "getAllRoutes",
      "createRoute",
      "getSingleRoute",
      "updateRoute",
      "deleteRoute",
    ],
  },
  {
    route_name: "role",
    paths: [
      "getAllRoles",
      "createRole",
      "getAllRoleMaps",
      "updateRoleMap",
      "getSingleRole",
      "updateRole",
      "deleteRole",
    ],
  },
  {
    route_name: "ad",
    paths: ["getAllAds", "createAd", "getSingleAd", "updateAd", "deleteAd"],
  },
  {
    route_name: "brand",
    paths: [
      "getAllBrands",
      "createBrand",
      "getSingleBrand",
      "updateBrand",
      "deleteBrand",
    ],
  },
  {
    route_name: "category",
    paths: [
      "getAllCategories",
      "createCategory",
      "getSingleCategory",
      "updateCategory",
      "deleteCategory",
    ],
  },
  {
    route_name: "flash",
    paths: [
      "getAllFlashs",
      "createFlash",
      "getSingleFlash",
      "updateFlash",
      "deleteFlash",
    ],
  },
  {
    route_name: "notification",
    paths: [
      "getAllNotifications",
      "createNotification",
      "getSingleNotification",
      "updateNotification",
      "deleteNotification",
    ],
  },
  {
    route_name: "order",
    paths: [
      "getAllOrders",
      "getDeliveryBoyAssignedOrders",
      "getDeliveryBoyCompletedOrders",
      "createOrder",
      "getOrderPdf",
      "updateOrderStatus",
      "updatePaymentStatus",
      "updateDeliveryStatus",
      "updateDeliveryBoy",
      "cancelOrder",
      "getSingleOrder",
      "updateOrder",
      "deleteOrder",
    ],
  },
  {
    route_name: "product",
    paths: [
      "getAllProducts",
      "createProduct",
      "updateRating",
      "bulkUpload",
      "getSingleProduct",
      "updateProduct",
      "deleteProduct",
    ],
  },
  {
    route_name: "report",
    paths: [
      "getAllReports",
      "createReport",
      "getDeliveryBoyReport",
      "getGraphDataForCategory",
      "getGraphDataForBrand",
      "getSellerReport",
      "getSingleReport",
      "updateReport",
      "deleteReport",
    ],
  },
  {
    route_name: "shop",
    paths: [
      "getAllShops",
      "createShop",
      "getSingleShop",
      "updateShop",
      "deleteShop",
    ],
  },
  {
    route_name: "subscriber",
    paths: [
      "getAllSubscribers",
      "createSubscriber",
      "getSingleSubscriber",
      "updateSubscriber",
      "deleteSubscriber",
    ],
  },
  {
    route_name: "user",
    paths: [
      "getAllUsers",
      "createUser",
      "getSingleUser",
      "updateUser",
      "updateCart",
      "deleteUser",
    ],
  },
  {
    route_name: "color",
    paths: [
      "getAllColors",
      "createColor",
      "getSingleColor",
      "updateColor",
      "deleteColor",
    ],
  },
  {
    route_name: "attribute",
    paths: [
      "getAllAttributes",
      "createAttribute",
      "updateAttributeValue",
      "deleteAttributeValue",
      "getSingleAttribute",
      "updateAttribute",
      "deleteAttribute",
    ],
  },
  {
    route_name: "review",
    paths: [
      "getAllReviews",
      "createReview",
      "getSingleReview",
      "updateReview",
      "deleteReview",
    ],
  },
];
