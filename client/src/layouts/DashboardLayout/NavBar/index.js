import React, { useEffect, useContext, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Hidden,
  List,
  Typography,
  makeStyles
} from '@material-ui/core';
import AuthContext from 'src/context/auth-context';
import {
  AlertCircle as AlertCircleIcon,
  BarChart as BarChartIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
  User as UserIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon
} from 'react-feather';
import NavItem from './NavItem';
import CONSTANTS from 'src/constants';
import { isEmpty } from 'lodash';
import { useHasAuth } from 'src/hooks/use-Auth';

// const user = {
//   avatar: '/static/images/avatars/avatar_6.png',
//   jobTitle: 'Senior Developer',
//   name: 'Katarina Smith'
// };

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 256
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: 'calc(100% - 64px)'
  },
  avatar: {
    cursor: 'pointer',
    width: 64,
    height: 64
  }
}));

const NavBar = ({ onMobileClose, openMobile }) => {
  const classes = useStyles();
  const location = useLocation();
  const { user, userRole } = useContext(AuthContext);

  const itemsInitial = [
    useHasAuth('report', 'getAllReports') && {
      href: '/app/dashboard',
      icon: BarChartIcon,
      title: 'Dashboard'
    },
    useHasAuth('report', 'getDeliveryBoyReport') && {
      href: '/app/dashboard/deliveryBoy',
      icon: BarChartIcon,
      title: 'Dashboard (Delivery Boy)'
    },
    useHasAuth('report', 'getSellerReport') && {
      href: '/app/dashboard/seller',
      icon: BarChartIcon,
      title: 'Dashboard (Seller)'
    },
    useHasAuth('order', 'getDeliveryBoyAssignedOrders') && {
      href: '/app/orders/assignedDelivery',
      icon: BarChartIcon,
      title: 'Assinged Delivery'
    },
    useHasAuth('order', 'getDeliveryBoyCompletedOrders') && {
      href: '/app/orders/completedDelivery',
      icon: BarChartIcon,
      title: 'Completed Delivery'
    },
    useHasAuth('shop', 'getAllShops') && {
      href: '/app/shops',
      icon: UserIcon,
      title: 'Shops'
    },
    {
      href: '/app/users',
      icon: UsersIcon,
      title: 'Users',
      childItems: [
        useHasAuth('user', 'getAllUsers') && {
          href: '/app/users/all',
          // icon: BarChartIcon,
          title: 'All Users'
        }
      ]
    },
    // useHasAuth('route','getAllRoutes') &&
    {
      href: '/app/roles',
      icon: ShoppingBagIcon,
      title: 'Roles & Routes',
      childItems: [
        useHasAuth('route', 'getAllRoutes') && {
          href: '/app/roles/routes',
          // icon: BarChartIcon,
          title: 'Routes'
        },
        useHasAuth('role', 'getAllRoles') && {
          href: '/app/roles/all',
          // icon: BarChartIcon,
          title: 'Roles'
        },
        useHasAuth('role', 'getAllRoleMaps') && {
          href: '/app/roles/userRoleMap',
          // icon: BarChartIcon,
          title: 'Roles Map'
        }
      ]
    },
    {
      href: '/app/products',
      icon: ShoppingBagIcon,
      title: 'Products',
      childItems: [
        useHasAuth('product', 'getAllProducts') && {
          href: '/app/products/all',
          // icon: BarChartIcon,
          title: 'All Products'
        },
        useHasAuth('product','createProduct') && 
        {
          href: '/app/products/addProduct',
          // icon: BarChartIcon,
          title: 'Add Product'
        },
        useHasAuth('category','getAllCategories') &&
        {
          href: '/app/products/categories',
          // icon: BarChartIcon,
          title: 'Category'
        },
        useHasAuth('product','bulkUpload') &&
        {
          href: '/app/products/bulkImport',
          // icon: BarChartIcon,
          title: 'Bulk Import'
        },
        useHasAuth('brand','getAllBrands') &&
        {
          href: '/app/products/brands',
          // icon: BarChartIcon,
          title: 'Brands'
        },
        useHasAuth('color','getAllColors') &&
        {
          href: '/app/products/colors',
          // icon: BarChartIcon,
          title: 'Colors'
        },
        useHasAuth('attribute','getAllAttributes') &&
        {
          href: '/app/products/attributes',
          // icon: BarChartIcon,
          title: 'Attributes'
        },
        useHasAuth('review','getAllReviews') &&
        {
          href: '/app/products/reviews',
          // icon: BarChartIcon,
          title: 'Reviews'
        }
      ]
    },
    {
      href: '/app/marketing',
      icon: ShoppingBagIcon,
      title: 'Marketing',
      childItems: [
        useHasAuth('flash','getAllFlashs') &&
        {
          href: '/app/marketing/flashDeals',
          // icon: BarChartIcon,
          title: 'Flash Deals'
        },
        useHasAuth('subscriber','getAllSubscribers') &&
        {
          href: '/app/marketing/subscribers',
          // icon: BarChartIcon,
          title: 'Subscribers'
        },
        useHasAuth('ad','getAllAds') &&
        {
          href: '/app/marketing/ads',
          // icon: BarChartIcon,
          title: 'Adds'
        }
      ]
    },
    {
      href: '/app/account',
      icon: UserIcon,
      title: 'Account'
    },
    useHasAuth('order','getAllOrders') &&
    {
      href: '/app/orders',
      icon: UserIcon,
      title: 'Orders'
    },
    // {
    //   href: '/app/settings',
    //   icon: SettingsIcon,
    //   title: 'Settings'
    // },
    // {
    //   href: '/login',
    //   icon: LockIcon,
    //   title: 'Login'
    // },
    // {
    //   href: '/register',
    //   icon: UserPlusIcon,
    //   title: 'Register'
    // },
    // {
    //   href: '/404',
    //   icon: AlertCircleIcon,
    //   title: 'Error'
    // }
  ];

  user.role = user.user_type;

  let items = itemsInitial.map(item => {
    if (!isEmpty(item.childItems)) {
      let childArray = [];
      item.childItems.map(child => {
        if (!isEmpty(child)) childArray.push(child);
      });
      if (!isEmpty(childArray)) {
        item.childItems = childArray;
        return item;
      }
    } else {
      if (item != false) return item;
    }
  });
  items = items.filter(item => !isEmpty(item));

  // console.log("itesm++++++++++++++",items, "role",user.role)

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const content = (
    <Box height="100%" display="flex" flexDirection="column">
      <Box alignItems="center" display="flex" flexDirection="column" p={2}>
        {user.image_url && (
          <Avatar
            className={classes.avatar}
            component={RouterLink}
            src={CONSTANTS.BASE_URL + user.image_url}
            to="/app/account"
          />
        )}
        <Typography className={classes.name} color="textPrimary" variant="h5">
          {user.name}
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {user.role}
        </Typography>
      </Box>
      <Divider />
      <Box p={2}>
        <List>
          {items.map(item => (
            <NavItem
              href={item.href}
              key={item.title}
              title={item.title}
              icon={item.icon}
              // open = {open}
              childItems={item.childItems}
              // handleCollapse = {handleCollapseOpen}
            />
          ))}
        </List>
      </Box>
      <Box flexGrow={1} />
      {/* <Box p={2} m={2} bgcolor="background.dark">
        <Typography align="center" gutterBottom variant="h4">
          Need more?
        </Typography>
        <Typography align="center" variant="body2">
          Upgrade to PRO version and access 20 more screens
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            color="primary"
            component="a"
            href="https://react-material-kit.devias.io"
            variant="contained"
          >
            See PRO version
          </Button>
        </Box>
      </Box> */}
    </Box>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool
};

NavBar.defaultProps = {
  onMobileClose: () => {},
  openMobile: false
};

export default NavBar;
