import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import axios from 'axios';

import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormHelperText,
  Link,
  TextField,
  Typography,
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Select,
  IconButton,
  MenuItem,
  InputLabel,
  FormControl,
  Grid
} from '@material-ui/core';
import Page from 'src/components/Page';
import { isEmpty, rest } from 'lodash';

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
  buttonStyle: {
    // width: '100px',
    // height:"50px",
    marginRight: '10px',
    marginLeft: '10px'
  },
  richEditor: {
    border: '1px #d0c0c0 solid',
    margin: '10px 0px'
  }
}));

const AddRole = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [logoImageFile, setLogoImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [roles, getRoles] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [shops, setShops] = useState(null);

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

  useEffect(() => {
    getAllShops();
    getAllRoutes();
  }, []);

  const initRoutes = () => {
    return routes.map(route => {
      return {
        route_id: route._id,
        route_name: route.route_name,
        // checked: false,
        paths: route.paths,
        selectedPaths: []
      };
    });
  };

  const page = !isEmpty(routes) ? (
    shops && (
      <Page className={classes.root} title="Add Role">
        <Container maxWidth="md">
          <Formik
            initialValues={{
              role_name: '',
              shop_id: '',
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
                  data.routes[index]={};
                  data.routes[index].route_id = route.route_id;
                  data.routes[index].route_name = route.route_name;
                  data.routes[index].paths = route.selectedPaths;
                }
              });
              if(isEmpty(data.routes))
                return;

              axios
                .post(CONSTANTS.BASE_URL + 'api/role', data)
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
                      // subheader="Add Bill"
                      title="Add Role"
                    />
                    <Divider />
                    <CardContent>
                      <TextField
                        fullWidth
                        error={Boolean(touched.role_name && errors.role_name)}
                        helperText={touched.role_name && errors.role_name}
                        label="Role Name"
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
                      {/* <Box className={classes.imageStyle}>{logoImageRender}</Box> */}
                      <Box>
                        <Button
                          color="red"
                          variant="contained"
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
                          Add Role
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
    )
  ) : (
    <div>Please add the routes first</div>
  );
  return page;
};

export default AddRole;
