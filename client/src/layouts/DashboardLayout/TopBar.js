import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
// import { io } from "socket.io-client";
import { socket } from 'src/services/socket';
import {
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  makeStyles,
  MenuItem,
  MenuList,
  ClickAwayListener,
  Grow,
  Paper,
  Popper
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import Logo from 'src/components/Logo';
import AuthContext from '../../context/auth-context';
import AlertDialog from '../../components/confirmModal/confirmModal';
import axios from 'axios';
import CONSTANTS from 'src/constants';
import { isEmpty } from 'lodash';

const useStyles = makeStyles(() => ({
  root: {},
  avatar: {
    width: 60,
    height: 60
  }
}));

const TopBar = ({ className, onMobileNavOpen, ...rest }) => {
  const classes = useStyles();
  // const socket = io(CONSTANTS.BASE_URL);
  // const [notifications] = useState([
  //   {title:"You have new orders"}
  // ]);
  const authCtx = useContext(AuthContext);
  const [confirmOpen, setconfirmOpen] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [notifications, setNotifications] = useState(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }
  const prevOpen = useRef(open);
  useEffect(() => {
    getNotifications();
    socket.on('new-notification', response => {
      console.log('New notification', response);
    });
    return () => {
      socket.off('new-notification', res => {});
    };
  }, []);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleLogout = () => {
    // localStorage.setItem('auth-token',"");
    // setUserLogin(false);
    authCtx.onLogout();
    navigate('/login', { replace: true });
    setconfirmOpen(false);
  };
  const handleLogoutConfirm = () => {
    setconfirmOpen(true);
  };

  const handleConfirmclose = () => {
    setconfirmOpen(false);
  };
  const getNotifications = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/notification', {
        params: { page: 1, limit: 10000 }
      })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.shops);
        const allNotifications = response.data.notifications;
        if (!isEmpty(allNotifications)) {
          setNotifications(allNotifications);
        } else {
          setNotifications([]);
        }
      })
      .catch(error => {
        setNotifications([])
        console.log(error);
      });
  };

  const getNotificationText = () => {
    if (notifications.length === 1) return `You have a new order`;
    return `You have ${notifications.length} new orders`;
  };

  const updateNotifications = () => {
    axios
      .put(CONSTANTS.BASE_URL + 'api/notification', { type: 'order' })
      .then(response => {
        setNotifications([]);
        navigate('/app/orders');
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    notifications && (
      <AppBar className={clsx(classes.root, className)} elevation={0} {...rest}>
        <Toolbar>
          <RouterLink to="/">
            <Logo />
          </RouterLink>
          <Box flexGrow={1} />
          {/* <Hidden mdDown> */}
          <IconButton
            color="inherit"
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <Badge
              badgeContent={notifications.length}
              color="secondary"
              // variant="dot"
            >
              <NotificationsIcon />
            </Badge>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom' ? 'center top' : 'center bottom'
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList
                        autoFocusItem={open}
                        id="menu-list-grow"
                        onKeyDown={handleListKeyDown}
                      >
                        {/* {notifications.map(notify => (
                        <MenuItem onClick={handleClose}>
                          {notify.title}
                        </MenuItem>
                      ))} */}
                        {isEmpty(notifications) ? (
                          <MenuItem onClick={handleClose}>
                            You have no notification
                          </MenuItem>
                        ) : (
                          <MenuItem
                            onClick={event => {
                              handleClose(event);
                              updateNotifications();
                            }}
                          >
                            {getNotificationText()}
                          </MenuItem>
                        )}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </IconButton>
          <IconButton color="inherit" onClick={handleLogoutConfirm}>
            <InputIcon />
          </IconButton>
          {/* <IconButton color="inherit">
            <InputIcon />
          </IconButton> */}
          {/* </Hidden> */}
          <Hidden lgUp>
            <IconButton color="inherit" onClick={onMobileNavOpen}>
              <MenuIcon />
            </IconButton>
          </Hidden>
        </Toolbar>
        <AlertDialog
          open={confirmOpen}
          handleClose={handleConfirmclose}
          handleConfirm={handleLogout}
          content="Are you sure"
          title="Logout"
          confirmDialog={true}
          cancelButtonAsOk="CANCEL"
        />
      </AppBar>
    )
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func
};

export default TopBar;
