import React, {useContext} from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import MainLayout from 'src/layouts/MainLayout';
import AccountView from 'src/views/account/AccountView';
import CustomerListView from 'src/views/customer/CustomerListView';
import CategoryListView from 'src/views/category';
import BrandView from './views/brand';
import ColorView from './views/color';
import ReviewView from './views/review';
import AttributeView from './views/attribute';
import ProductView from './views/product';
import FlashDealView from './views/flashDeal';
import SubscriberView from './views/subscriber';
import AdView from './views/ad';
import RouteView from './views/route';
import RoleView from './views/role';
import ShopView from './views/shop';
import UserView from './views/user';
import OrderView from './views/order';
import DashboardView from 'src/views/reports/DashboardView';
import DeliveryBoyDashboardView from 'src/views/reports/DeliveryBoyDashboardView';
import SellerDashboardView from 'src/views/reports/SellerDashboardView';
import LoginView from 'src/views/auth/LoginView';
import NotFoundView from 'src/views/errors/NotFoundView';
import ProductListView from 'src/views/productOld/ProductListView';
import RegisterView from 'src/views/auth/RegisterView';
import SettingsView from 'src/views/settings/SettingsView';

import AssignedDeliveryView from './views/order/assignedOrder';
import CompletedDeliveryView from './views/order/completedOrder';

import AddCategory from 'src/views/category/AddCategory';
import AddBrand from './views/brand/AddBrand';
import AddProduct from './views/product/AddProduct';
import AddFlashDeal from './views/flashDeal/AddFlashDeal'
import AddUser from './views/user/AddUser';
import AddAd from './views/ad/AddAd';
import AddShop from './views/shop/AddShop';
import AddRoute from './views/route/AddRoute';
import AddRole from './views/role/AddRole';
import AddColor from './views/color/AddColor';
import AddAttribute from './views/attribute/AddAttribute';

import EditCategory from './views/category/EditCategory';
import EditBrand from './views/brand/EditBrand';
import EditProduct from './views/product/EditProduct';
import EditFlashDeal from './views/flashDeal/EditFlashDeal';
import EditUser from './views/user/EditUser';
import EditAd from './views/ad/EditAd';
import EditShop from './views/shop/EditShop';
import EditRoute from './views/route/EditRoute';
import EditRole from './views/role/EditRole';
import EditColor from './views/color/EditColor';
import EditAttribute from './views/attribute/EditAttribute';

import ViewOrder from './views/order/ViewOrder';
import ViewAssignedOrder from './views/order/assignedOrder/ViewOrder';
import ViewCompletedOrder from './views/order/completedOrder/ViewOrder';

import UserRoleMapView from './views/role/UserRoleMap';

import BulkImport from './views/product/BulkImport';

const routes = (autenticated)=> {

  return autenticated?[
    {
      path: 'app',
      element: <DashboardLayout />,
      children: [
        { path: 'account', element: <AccountView /> },
        { path: 'customers', element: <CustomerListView /> },

        { path: 'products/categories', element: <CategoryListView /> },
        { path: 'products/categories/addCategory', element: <AddCategory /> },
        { path: 'products/categories/editCategory/:id', element: <EditCategory /> },

        { path: 'products/brands', element: <BrandView /> },
        { path: 'products/brands/addBrand', element: <AddBrand /> },
        { path: 'products/brands/editBrand/:id', element: <EditBrand /> },

        { path: 'products/colors', element: <ColorView /> },
        { path: 'products/colors/addColor', element: <AddColor /> },
        { path: 'products/colors/editColor/:id', element: <EditColor /> },

        { path: 'products/attributes', element: <AttributeView /> },
        { path: 'products/attributes/addAttribute', element: <AddAttribute /> },
        { path: 'products/attributes/editAttribute/:id', element: <EditAttribute /> },

        { path: 'products/reviews', element: <ReviewView /> },


        { path: 'marketing/flashDeals', element: <FlashDealView /> },
        { path: 'marketing/flashDeals/addFlashDeal', element: <AddFlashDeal /> },
        { path: 'marketing/flashDeals/editFlashDeal/:id', element: <EditFlashDeal /> },

        { path: 'marketing/ads', element: <AdView /> },
        { path: 'marketing/ads/addAd', element: <AddAd /> },
        { path: 'marketing/ads/editAd/:id', element: <EditAd /> },

        { path: 'marketing/subscribers', element: <SubscriberView /> },

        { path: 'products/all', element: <ProductView /> },
        { path: 'products/addProduct', element: <AddProduct /> },
        { path: 'products/bulkImport', element: <BulkImport /> },
        { path: 'products/editProduct/:id', element: <EditProduct /> },

        { path: 'users/all', element: <UserView /> },
        { path: 'users/addUser', element: <AddUser /> },
        { path: 'users/editUser/:id', element: <EditUser /> },

        { path: 'orders', element: <OrderView /> },
        // { path: 'orders', element: <AddUser /> },
        { path: 'orders/:id', element: <ViewOrder /> },

        { path: 'shops', element: <ShopView /> },
        { path: 'shops/addShop', element: <AddShop /> },
        { path: 'shops/editShop/:id', element: <EditShop /> },

        { path: 'roles/routes', element: <RouteView /> },
        { path: 'roles/routes/addRoute', element: <AddRoute /> },
        { path: 'roles/routes/editRoute/:id', element: <EditRoute /> },

        { path: 'roles/all', element: <RoleView /> },
        { path: 'roles/addRole', element: <AddRole /> },
        { path: 'roles/editRole/:id', element: <EditRole /> },
        { path: 'roles/userRoleMap', element: <UserRoleMapView /> },

        { path: 'dashboard', element: <DashboardView /> },
        { path: 'dashboard/deliveryBoy', element: <DeliveryBoyDashboardView /> },
        { path: 'dashboard/seller', element: <SellerDashboardView /> },

        { path: 'orders/assignedDelivery', element: <AssignedDeliveryView /> },
        { path: 'orders/assignedDelivery/:id', element: <ViewAssignedOrder /> },

        { path: 'orders/completedDelivery', element: <CompletedDeliveryView /> },
        { path: 'orders/completedDelivery/:id', element: <ViewCompletedOrder /> },

        { path: 'products', element: <ProductListView /> },
        { path: 'settings', element: <SettingsView /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { path: 'login', element: <Navigate to="/app/dashboard" />},
        { path: 'register', element: <Navigate to="/app/dashboard" /> },
        { path: '404', element: <NotFoundView /> },
        { path: '/', element: <Navigate to="/app/dashboard" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    }
  ]:
  [
    {
      path: 'app',
      element: <DashboardLayout />,
      children: [
        { path: '*', element: <Navigate to="/login" /> }
      ]
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { path: 'login', element: <LoginView /> },
        // { path: 'register', element: <RegisterView /> },
        { path: '404', element: <NotFoundView /> },
        { path: '/', element: <Navigate to="/login" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    }
  ];
}


export default routes;
