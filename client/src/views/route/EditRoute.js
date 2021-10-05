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

const EditRoute = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [routeData, setRouteData] = useState(null);
  // const [logoImageFile, setLogoImage] = useState(null);
  // const [iconImageFile, setIconImage] = useState(null);
  const [services, getServices] = useState([]);
  //   const [editorState, getEditorState] = useState(EditorState.createEmpty());
  const [routes, getRoutes] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);

  //   const [routes, getRoutes] = useState([]);
  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  useEffect(() => {
    getSingleRoute();
    // getAllRoutes();
    // getAllRoutes();
  }, []);

  const getSingleRoute = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/route/' + id)
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const routeData = response.data;
        // const html = routeData.description || '';
        // const contentBlock = htmlToDraft(html);
        // if (contentBlock) {
        //   const contentState = ContentState.createFromBlockArray(
        //     contentBlock.contentBlocks
        //   );
        //   let editorState = EditorState.createWithContent(contentState);
        //   getEditorState(editorState);
        // }
        setRouteData(routeData);
        // setLogoImage(CONSTANTS.BASE_URL + routeData.logo_url);
        // setIconImage(CONSTANTS.BASE_URL + routeData.icon_url);
        // setImage(CONSTANTS.BASE_URL+routeData.imageUrl);
        //   getBills(allBills);
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
        //   console.log("service data",response.data);
        const allRoutes = response.data.routes;
        getRoutes(allRoutes);
        //   menu = allServices.map((service)=>{
        //       console.log("sdlksl",service)
        //       return(<MenuItem value={service._id}>{service.name}</MenuItem>)
        //       });
      })
      .catch(error => {
        console.log(error);
      });
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }
  const handleModelOpen = () => {
    setTranslationModel(true);
  };

  const handleModelClose = () => {
    setTranslationModel(false);
  };

  //   const onEditorStateChange = editorState => {
  //     getEditorState(editorState);
  //   };

  const getLanguageLabel = key => {
    return languages.filter(language => language.key === key)[0].label;
  };

  // const [values,setValues] = useState({
  //   billId: '',
  //   customerName: '',
  //   mobile: '',
  //   details: ''
  // })

  let page = routeData ? (
    <Page className={classes.root} title="Route Update">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            route_name: routeData.route_name,
            paths: routeData.paths
          }}
          validationSchema={Yup.object().shape({
            route_name: Yup.string().required('Route name required'),
            paths: Yup.array()
              .of(Yup.string().required('Path required'))
              .required('Path required')
          })}
          onSubmit={values => {
            let data = {};
            data.route_name = values.route_name;
            data.paths = values.paths;
            axios
              .put(CONSTANTS.BASE_URL + 'api/route/' + routeData._id, data)
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
                    title="Update Route"
                  />
                  <Divider />
                  <CardContent>
                    <TextField
                      fullWidth
                      error={Boolean(touched.route_name && errors.route_name)}
                      helperText={touched.route_name && errors.route_name}
                      label="Rout Name"
                      margin="normal"
                      name="route_name"
                      onChange={handleChange}
                      type="text"
                      value={values.route_name}
                      variant="outlined"
                    />
                    <FieldArray name="paths">
                      {fieldArrayProps => {
                        const { push, remove, form } = fieldArrayProps;
                        const { values } = form;
                        const { paths } = values;
                        // console.log('vlaues', values, 'paths', paths);
                        // console.log('fieldArrayProps', fieldArrayProps)
                        // console.log('Form errors', form.errors)
                        return (
                          <Grid container item xs={12} spacing={2}>
                            {paths.map((content, index) => (
                              <Grid
                                container
                                item
                                xs={12}
                                spacing={2}
                                alignItems="center"
                                key={index}
                              >
                                <Grid item xs>
                                  <TextField
                                    fullWidth
                                    error={Boolean(
                                      touched[`paths[${index}]`] &&
                                        errors[`paths[${index}]`]
                                    )}
                                    helperText={
                                      touched[`paths[${index}]`] &&
                                      errors[`paths[${index}]`]
                                    }
                                    label="Content"
                                    margin="normal"
                                    name={`paths[${index}]`}
                                    onChange={handleChange}
                                    type="text"
                                    value={values.paths[index]}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>

                                {paths.length > 1 ? (
                                  <Grid item xs={1}>
                                    <Tooltip title="Remove Path">
                                      <IconButton
                                        color="error"
                                        aria-label="remove"
                                        variant="contained"
                                        className={classes.dangerButton}
                                        onClick={() => remove(index)}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                ) : (
                                  ''
                                )}
                              </Grid>
                            ))}
                            <Grid
                              container
                              item
                              xs={12}
                              spacing={2}
                              justify="flex-end"
                            >
                              <Grid item xs={1}>
                                <Tooltip title="Add Row">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => push('')}
                                  >
                                    ADD
                                  </Button>
                                </Tooltip>
                              </Grid>
                            </Grid>
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
                        Update Route
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

export default EditRoute;
