import React, { useState } from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Button,
  ListItem,
  makeStyles,
  ListItemText,
  ListItemIcon,
  Collapse,
  List
} from '@material-ui/core';
import StarBorder from '@material-ui/icons/StarBorder';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  item: {
    display: 'flex',
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    justifyContent: 'flex-start',
    letterSpacing: 0,
    padding: '10px 8px',
    textTransform: 'none',
    width: '100%'
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  title: {
    marginRight: 'auto'
  },
  active: {
    color: theme.palette.primary.main,
    '& $title': {
      fontWeight: theme.typography.fontWeightMedium
    },
    '& $icon': {
      color: theme.palette.primary.main
    }
  },
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));

const NavItem = ({
  className,
  href,
  icon: Icon,
  title,
  // open,
  childItems,
  // handleCollapse,
  ...rest
}) => {
  const classes = useStyles();
  const hasChildItems = childItems
    ? childItems.length > 0
      ? true
      : false
    : false;


  const handleCollapseOpen = () => {
    setOpen(previousValue => !previousValue);
  };
  const hasChildrenAndIsActive =
  hasChildItems &&
  childItems.filter(item =>{
    // console.log("in",item.href,window.location.pathname);
  return `${item.href}` == window.location.pathname;
}).length > 0
const isOpen = hasChildrenAndIsActive || false;

const [open, setOpen] = useState(isOpen);


  // console.log('kjdls',hasChildrenAndIsActive,window.location)


  return (
    <>
      <ListItem
        className={clsx(classes.item, className)}
        disableGutters
        {...rest}
      >
        <Button
          activeClassName={classes.active}
          className={clsx(classes.button, hasChildrenAndIsActive && classes.active)}
          component={hasChildItems?"button": RouterLink}
          to={href}
          onClick={handleCollapseOpen}
        >
          {Icon && <Icon className={classes.icon} size="20" />}
          <span className={classes.title}>{title}</span>
          {hasChildItems ? open ? <ExpandLess /> : <ExpandMore /> : null}
        </Button>
      </ListItem>
      {hasChildItems ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List>
            {childItems.map(item => (
              <NavItem
                className={classes.nested}
                href={item.href}
                key={item.title}
                title={item.title}
                icon={item.icon}
                // open={open}
                // childItems={item.childItems}
              />
            ))}
          </List>
          {/* <List component="div" disablePadding>
      <ListItem button className={classes.nested}>
        <ListItemIcon>
          <StarBorder />
        </ListItemIcon>
        <ListItemText primary="Starred" />
      </ListItem>
    </List> */}
        </Collapse>
      ) : null}
    </>
  );
};

NavItem.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
  icon: PropTypes.elementType,
  title: PropTypes.string
};

export default NavItem;
