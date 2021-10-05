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

const EditRole = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [roleData, setRoleData] = useState(null);
  const [services, getServices] = useState([]);
  const [roles, getRoles] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [shops, setShops] = useState(null);

  useEffect(() => {
    getSingleRole();
    getAllShops();
    getAllRoutes();
  }, []);

  const getSingleRole = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/role/' + id)
      .then(response => {
        const roleData = response.data;
        setRoleData(roleData);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllRoutes = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/route', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allRoutes = response.data.routes;
        setRoutes(allRoutes);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllShops = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/shop', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allShops = response.data.shops;
        setShops(allShops);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const initRoutes = () => {
    return routes.map(route => {
      let selectedPathsObject = roleData.routes.find(
        roleRoute =>
        {
        return roleRoute.route_id == route._id;
        }
      );
      let selectedPaths = [];
      if (!isEmpty(selectedPathsObject))
        selectedPaths = selectedPathsObject.paths;
      return {
        route_id: route._id,
        route_name: route.route_name,
        // checked: false,
        paths: route.paths,
        selectedPaths: selectedPaths
      };
    });
  };

  let page =
    roleData && shops && !isEmpty(routes) ? (
      <Page className={classes.root} title="Role Update">
        <Container maxWidth="md">
          <Formik
            initialValues={{
              role_name: roleData.role_name,
              shop_id: !isEmpty(roleData.shop_id) ? roleData.shop_id : '',
              routes: initRoutes()
            }}
            validationSchema={Yup.object().shape({
              role_name: Yup.string().required('Role name required')
              // paths: Yup.array()
              //   .of()
              //   .required('Path required')
            })}
            onSubmit={values => {
              let data = {};
              data.role_name = values.role_name;
              if (!isEmpty(values.shop_id)) data.shop_id = values.shop_id;
              data.routes = [];
              const routes = [];
              for(let index=0; index< values.routes.length;index++){
                let route = values.routes[index];
                if (!isEmpty(route.selectedPaths))
                  routes.push(values.routes[index])
              }
              routes.forEach((route, index) => {
                if (!isEmpty(route.selectedPaths)) {
                  data.routes[index] = {};
                  data.routes[index].route_id = route.route_id;
                  data.routes[index].route_name = route.route_name;
                  data.routes[index].paths = route.selectedPaths;
                }
              });
              if (isEmpty(data.routes)) return;
              axios
                .put(CONSTANTS.BASE_URL + 'api/role/' + roleData._id, data)
                .then(response => {
                  navigate(-1);
                })
                .catch(error => {
                  console.log(error);
                });
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              ...formProps
            }) => (
              <React.Fragment>
                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader
                      // subheader="Update Bill"
                      title="Update Role"
                    />
                    <Divider />
                    <CardContent>
                      <TextField
                        fullWidth
                        error={Boolean(touched.role_name && errors.role_name)}
                        helperText={touched.role_name && errors.role_name}
                        label="Rout Name"
                        margin="normal"
                        name="role_name"
                        onChange={handleChange}
                        type="text"
                        value={values.role_name}
                        variant="outlined"
                      />
                      <FormControl
                        fullWidth
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="shop_id_label">Select Shop</InputLabel>
                        <Select
                          fullWidth
                          error={Boolean(touched.shop_id && errors.shop_id)}
                          helperText={touched.shop_id && errors.shop_id}
                          margin="normal"
                          variant="outlined"
                          labelId="shop_id_label"
                          id="shop_id"
                          name="shop_id"
                          value={values.shop_id}
                          onChange={handleChange}
                          label="Select Shop"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {shops.map(shop => {
                            return (
                              <MenuItem key={shop._id} value={shop._id}>
                                {shop.i18nResourceBundle.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <FieldArray name="routes">
                        {fieldArrayProps => {
                          const { push, remove, form } = fieldArrayProps;
                          const { values } = form;
                          const { routes } = values;
                          // console.log('routes', routes);
                          // console.log('fieldArrayProps', fieldArrayProps)
                          // console.log('Form errors', form.errors)
                          return (
                            <Grid container item xs={12} spacing={2}>
                              {routes.map((route, index) => (
                                <Grid
                                  container
                                  item
                                  xs={12}
                                  spacing={2}
                                  alignItems="center"
                                  key={index}
                                >
                                  <Grid item xs={6}>
                                    <div>{values.routes[index].route_name}</div>
                                  </Grid>
                                  <Grid item xs={6}>
                                    {route.paths.map((path, indexPath) => (
                                      <Grid xs={12}>
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={routes[
                                                index
                                              ].selectedPaths.includes(path)}
                                              onChange={event => {
                                                if (event.target.checked)
                                                  form.setFieldValue(
                                                    `routes[${index}].selectedPaths`,
                                                    [
                                                      ...routes[index]
                                                        .selectedPaths,
                                                      path
                                                    ]
                                                  );
                                                else {
                                                  routes[
                                                    index
                                                  ].selectedPaths.splice(
                                                    routes[
                                                      index
                                                    ].selectedPaths.indexOf(
                                                      path
                                                    ),
                                                    1
                                                  );
                                                  form.setFieldValue(
                                                    `routes[${index}].selectedPaths`,
                                                    routes[index].selectedPaths
                                                  );
                                                }
                                              }}
                                              name={`routes[${index}].paths[${indexPath}]`}
                                              color="primary"
                                            />
                                          }
                                          label={path}
                                        />
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Grid>
                              ))}
                            </Grid>
                          );
                        }}
                      </FieldArray>
                    </CardContent>
                    {/* <Divider /> */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      padding="10px"
                    >
                      <Box>
                        <Button
                          color="red"
                          variant="contained"
                          // type="submit"
                          // className={classes.buttonStyle}

                          // disabled={isSubmitting}
                          onClick={() => {
                            navigate(-1);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          variant="contained"
                          type="submit"
                          className={classes.buttonStyle}

                          disabled={isSubmitting}
                        >
                          Update Role
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </form>
              </React.Fragment>
            )}
          </Formik>
        </Container>
      </Page>
    ) : null;
  return page;
};

export default EditRole;
