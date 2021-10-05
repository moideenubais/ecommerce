import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import { isEmpty, isUndefined, find } from 'lodash';

import { Delete } from '@material-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormHelperText,
  Link,
  TextField,
  Typography,
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Divider,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Tooltip,
  IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import Image from 'material-ui-image';
import axios from 'axios';
import TabPanel from 'src/components/TabPanel';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  imageStyle: {
    paddingLeft: '25px',
    width: '150px',
    height: '100px'
  },
  imageStyle: {
    paddingLeft: '25px',
    width: '150px',
    height: '100px'
  },
  buttonStyle: {
    // width:"150px",
    // height:"40px",
    marginRight: '10px',
    marginLeft: '10px'
  },
  richEditor: {
    border: '1px #d0c0c0 solid',
    margin: '10px 0px'
  }
}));

const UserRoleMapView = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [roleData, setRoleData] = useState({
    super_admin: '',
    org_admin: '',
    admin: '',
    seller: '',
    delivery_boy: '',
    user: ''
  });
  const [services, getServices] = useState([]);
  const [roles, setRoles] = useState(null);
  const [translationModel, setTranslationModel] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [shops, setShops] = useState(null);

  useEffect(() => {
    getUserRoleMap();
    getAllRoles();
  }, []);

  const getUserRoleMap = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/role/roleMap')
      .then(response => {
        const roleData = response.data.roleMap;
        if (!isEmpty(roleData._id)) delete roleData._id;
        setRoleData(prevData=>{ return {...prevData,...roleData}});
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllRoles = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/role', {
        params: { page: 1, limit: 10000 }
      })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.roles);
        const allRoles = response.data.roles;
        if (!isEmpty(allRoles)) {
          setRoles(allRoles);
        } else {
          setRoles([]);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const updateUserMap = (value, key) => {
      let allData = {...roleData,[key]:value};
      
      for(let data in allData){
          if(isEmpty(allData[data]))
          delete allData[data]
        }
    axios
      .put(CONSTANTS.BASE_URL + 'api/role/roleMap', allData)
      .then(response => {
        // console.log(response.data);
        const bill = response.data;
        // getBills(allBills);
        // navigate('/bills', { replace: true });
        // props.history.goBack();
        navigate(-1);
      })
      .catch(error => {
        console.log(error);
      });
  };

  let page =
    roleData && roles ? (
      <Page className={classes.root} title="Role Update">
        <Container maxWidth="md">
          <Card>
            <CardHeader
              // subheader="Update Bill"
              title="Role Map"
            />
            <Divider />
            <CardContent>
              {Object.keys(roleData).map(key => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  className={classes.formControl}
                >
                  <InputLabel id="shop_id_label">{key}</InputLabel>
                  <Select
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    labelId={key + 'key_label'}
                    id={key}
                    name={key}
                    value={roleData[key]}
                    onChange={event => {
                      updateUserMap(event.target.value, key);
                    }}
                    label={key}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {roles.map(role => {
                      return (
                        <MenuItem key={role._id} value={role._id}>
                          {role.role_name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              ))}
            </CardContent>
          </Card>
        </Container>
      </Page>
    ) : (
      <div>Check roles and userRoleMap in common db</div>
    );
  return page;
};

export default UserRoleMapView;
