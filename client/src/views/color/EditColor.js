import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import { isEmpty, isUndefined, find } from 'lodash';
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
  DialogTitle
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

const EditColor = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [colorData, setColorData] = useState(null);
  const [translationModel, setTranslationModel] = useState(false);

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  useEffect(() => {
    getSingleColor();
  }, []);

  const getSingleColor = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/color/' + id)
      .then(response => {
        const colorData = response.data;
        setColorData(colorData);
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

  const getLanguageLabel = key => {
    return languages.filter(language => language.key === key)[0].label;
  };

  let page = colorData ? (
    <Page className={classes.root} title="Color Update">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            language: 'en',
            resourceBundle: colorData.resourceBundle,
            value: colorData.value,
            tab: 0
          }}
          validationSchema={Yup.object().shape({
            // parentId: Yup.string(),
            resourceBundle: Yup.array().of(
              Yup.object().shape({
                name: Yup.string()
                  .max(255)
                  .required('Color Name required'),
                // color_description: Yup.string(),
                languageCode: Yup.string()
                  .max(255)
                  .required('Language required')
              })
            ),
            value: Yup.string()
              .max(100)
              .required('Value requied')
          })}
          onSubmit={values => {
            let data = {
              value: values.value
            };
            let resourceBundle = values.resourceBundle.map(res => {
              return { languageCode: res.languageCode, name: res.name };
            });
            data.resourceBundle = resourceBundle;
            axios
              .put(CONSTANTS.BASE_URL + 'api/color/' + colorData._id, data)
              .then(response => {
                const bill = response.data;

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
                    title="Update Color"
                  />
                  <Divider />
                  <CardContent>
                    <FieldArray name="resourceBundle">
                      {fieldArrayProps => {
                        const { push, remove, form } = fieldArrayProps;
                        const {
                          values,
                          touched,
                          errors,
                          handleChange,
                          setFieldValue
                        } = form;
                        const { resourceBundle } = values;
                        console.log(
                          'vlaues',
                          values,
                          'contents',
                          resourceBundle,
                          'touched',
                          touched,
                          'errror',
                          errors
                        );
                        return (
                          <>
                            <Tabs
                              value={values.tab}
                              // indicatorColor="primary"
                              // textColor="primary"
                              onChange={(event, newValue) => {
                                formProps.setFieldValue('tab', newValue);
                              }}
                              aria-label="simple tabs example"
                            >
                              {resourceBundle.map((resource, index) => {
                                return (
                                  <Tab
                                    label={getLanguageLabel(
                                      resource.languageCode
                                    )}
                                    {...a11yProps(index)}
                                  />
                                );
                              })}
                              <Button
                                style={{ marginLeft: 'auto' }}
                                color="primary"
                                onClick={handleModelOpen}
                              >
                                Add Translation
                              </Button>
                              <Dialog
                                open={translationModel}
                                onClose={handleModelClose}
                                aria-labelledby="form-dialog-title"
                              >
                                <DialogTitle id="form-dialog-title">
                                  Add Translation
                                </DialogTitle>
                                <DialogContent>
                                  <FormControl
                                    variant="outlined"
                                    className={classes.formControl}
                                  >
                                    <InputLabel id="demo-simple-select-outlined-label">
                                      Language
                                    </InputLabel>
                                    <Select
                                      labelId="demo-simple-select-outlined-label"
                                      id="demo-simple-select-outlined"
                                      name="language"
                                      value={values.language}
                                      onChange={handleChange}
                                      label="Language"
                                    >
                                      <MenuItem value="">
                                        <em>None</em>
                                      </MenuItem>
                                      {languages.map(language => {
                                        return (
                                          <MenuItem
                                            key={language.key}
                                            value={language.key}
                                          >
                                            {language.label}
                                          </MenuItem>
                                        );
                                      })}
                                    </Select>
                                  </FormControl>
                                </DialogContent>
                                <DialogActions>
                                  <Button
                                    onClick={handleModelClose}
                                    color="primary"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={event => {
                                      setFieldValue(
                                        'tab',
                                        resourceBundle.length
                                      );
                                      handleModelClose(event);
                                      push({
                                        name: '',
                                        // book_description: "",
                                        languageCode: values.language
                                      });
                                    }}
                                    color="primary"
                                  >
                                    Add
                                  </Button>
                                </DialogActions>
                              </Dialog>

                              {/* <Tab label="Disabled" />
        <Tab label="Active" /> */}
                            </Tabs>
                            {resourceBundle.map((resource, index) => {
                              return (
                                <TabPanel value={values.tab} index={index}>
                                  <TextField
                                    fullWidth
                                    error={
                                      touched.resourceBundle &&
                                      errors.resourceBundle &&
                                      touched.resourceBundle[index] &&
                                      errors.resourceBundle[index]
                                        ? Boolean(
                                            touched.resourceBundle[index]
                                              .name &&
                                              errors.resourceBundle[index].name
                                          )
                                        : false
                                    }
                                    helperText={
                                      touched.resourceBundle &&
                                      errors.resourceBundle &&
                                      touched.resourceBundle[index] &&
                                      errors.resourceBundle[index]
                                        ? touched.resourceBundle[index].name &&
                                          errors.resourceBundle[index].name
                                        : null
                                    }
                                    label="Color Name"
                                    margin="normal"
                                    name={`resourceBundle[${index}].name`}
                                    onChange={handleChange}
                                    type="text"
                                    value={values.resourceBundle[index].name}
                                    variant="outlined"
                                  />
                                </TabPanel>
                              );
                            })}
                          </>
                        );
                      }}
                    </FieldArray>
                    <TextField
                      fullWidth
                      error={Boolean(touched.value && errors.value)}
                      helperText={touched.value && errors.value}
                      label="Value"
                      margin="normal"
                      name="value"
                      onChange={handleChange}
                      type="value"
                      value={values.value}
                      variant="outlined"
                    />
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
                        Update Color
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

export default EditColor;
