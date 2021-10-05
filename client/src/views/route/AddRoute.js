import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import axios from 'axios';
import Image from 'material-ui-image';
import { subscribeUser } from '../../subscription';

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
  IconButton,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Tooltip,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import Page from 'src/components/Page';
import { isEmpty, rest } from 'lodash';
import Spinner from '../../components/Spinner';
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

const AddRoute = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [logoImageFile, setLogoImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [routes, getRoutes] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);

  const page = (
    <Page className={classes.root} title="Register">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            route_name: '',
            paths: ['']
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
              .post(CONSTANTS.BASE_URL + 'api/route', data)
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
                    title="Add Route"
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
                        Add Route
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
  );
  return page;
};

export default AddRoute;
