import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  makeStyles,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';
import { NavLink as RouterLink } from 'react-router-dom';
import { useHasAuth } from 'src/hooks/use-Auth';
import AuthContext from 'src/context/auth-context';

const useStyles = makeStyles(theme => ({
  root: {},
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  }
}));

const Toolbar = ({ className, onSearchName, onUserTypeChange, ...rest }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [userType, setUserType] = useState('all');

  const userTypesArray = [
    { key: 'all', value: 'All' , priority:7},
    { key: 'super_admin', value: 'Super Admin' , priority:1},
    { key: 'org_admin', value: 'Org Admin' , priority:2},
    { key: 'admin', value: 'Admin' , priority:3},
    { key: 'seller', value: 'Seller' , priority:4},
    { key: 'delivery_boy', value: 'Delivery Boy' , priority:5},
    { key: 'user', value: 'User', priority:6 }
  ];

  const userPrioriy = userTypesArray.find(userType=>userType.key === user.user_type).priority;
  
  const userTypes = userTypesArray.filter(userType=>userType.priority > userPrioriy);


  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <Box display="flex" justifyContent="flex-end">
        {/* <Button className={classes.importButton}>
          Import
        </Button>
        <Button className={classes.exportButton}>
          Export
        </Button> */}
        {useHasAuth('user', 'createUser') && (
          <Button
            color="primary"
            variant="contained"
            component={RouterLink}
            to="/app/users/addUser"
          >
            Add User
          </Button>
        )}
      </Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon fontSize="small" color="action">
                            <SearchIcon />
                          </SvgIcon>
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search user"
                    variant="outlined"
                    onChange={onSearchName}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <InputLabel id="demo-simple-select-outlined-label">
                      User Type
                    </InputLabel>
                    <Select
                      // fullWidth
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      name="user_type"
                      value={userType}
                      onChange={event => {
                        setUserType(event.target.value);
                        onUserTypeChange(event.target.value);
                      }}
                      label="User Type"
                    >
                      {/* <MenuItem value="">
                        <em>None</em>
                      </MenuItem> */}
                      {userTypes.map(userType => {
                        return (
                          <MenuItem key={userType.key} value={userType.key}>
                            {userType.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

Toolbar.propTypes = {
  className: PropTypes.string
};

export default Toolbar;
