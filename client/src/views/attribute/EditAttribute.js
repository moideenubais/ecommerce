import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import { isEmpty, isUndefined, find } from 'lodash';
import DeleteIcon from '@material-ui/icons/Delete';
import UpdateIcon from '@material-ui/icons/Update';
import EditIcon from '@material-ui/icons/Edit';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormHelperText,
  Link,
  TextField,
  Typography,
  IconButton,
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
  FormLabel,
  Grid,
  Tooltip
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

const EditAttribute = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [attributeData, setAttributeData] = useState(null);
  const [logoImageFile, setLogoImage] = useState(null);
  // const [iconImageFile, setIconImage] = useState(null);
  const [services, getServices] = useState([]);
  //   const [editorState, getEditorState] = useState(EditorState.createEmpty());
  const [attributes, getAttributes] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);

  //   const [attributes, getAttributes] = useState([]);
  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  useEffect(() => {
    getSingleAttribute();
    // getAllAttributes();
    // getAllAttributes();
  }, []);

  const getSingleAttribute = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/attribute/' + id)
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const attributeData = response.data;
        setAttributeData(attributeData);
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
  const updateValue = async value => {
    if (!isUndefined(value.edit)) delete value.edit;
    try {
      const userRole = await axios.put(
        CONSTANTS.BASE_URL + 'api/attribute/value/' + id,
        { value }
      );
      alert('updated');
    } catch (error) {
      console.log('Error while updating value of attribute', error);
    }
  };

  const deleteValue = async value => {
    if (!isUndefined(value.edit)) delete value.edit;
    try {
      const userRole = await axios.delete(
        CONSTANTS.BASE_URL + 'api/attribute/value/' + id,
        { data: { value } }
      );
      alert('deleted');
    } catch (error) {
      console.log('Error while deleting value of attribute', error);
    }
  };

  let page = attributeData ? (
    <Page className={classes.root} title="Attribute Update">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            language: 'en',
            resourceBundle: attributeData.resourceBundle,
            values: attributeData.values
              ? attributeData.values.map(value => {
                  return { ...value, edit: false };
                })
              : [],
            // values: [
            //   { _id: '123', value: 'kkk' },
            //   { value: 'dk' },
            //   { value: 'kkdfk' },
            //   { value: 'ffkkk' }
            // ],
            tab: 0
          }}
          validationSchema={Yup.object().shape({
            // parentId: Yup.string(),
            resourceBundle: Yup.array().of(
              Yup.object().shape({
                name: Yup.string()
                  .max(255)
                  .required('Attribute Name required'),
                // attribute_description: Yup.string(),
                languageCode: Yup.string()
                  .max(255)
                  .required('Language required')
              })
            ),
            values: Yup.string()
              .max(255)
              .required('values required')
          })}
          onSubmit={values => {
            let data = {};
            let resourceBundle = values.resourceBundle.map(res => {
              return { languageCode: res.languageCode, name: res.name };
            });
            const filteredValues = values.values.filter(singleValue => {
              return isUndefined(singleValue._id);
            });
            data.values = filteredValues.map(value => {
              if (!isUndefined(value.edit)) delete value.edit;
              return value;
            });
            data.resourceBundle = resourceBundle;
            axios
              .put(
                CONSTANTS.BASE_URL + 'api/attribute/' + attributeData._id,
                data
              )
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
                    title="Update Attribute"
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
                                    label="Attribute Name"
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
                    <FormLabel>Values</FormLabel>
                    <FieldArray name="values">
                      {fieldArrayProps => {
                        const { push, remove, form } = fieldArrayProps;
                        // const { values } = form;
                        // const { values } = values;
                        // console.log('vlaues', values, 'paths', paths);
                        // console.log('fieldArrayProps', fieldArrayProps)
                        // console.log('Form errors', form.errors)
                        return (
                          <Grid container item xs={12} spacing={2}>
                            {values.values.map((content, index) => (
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
                                    // error={Boolean(
                                    //   touched[`values[${index}]`] &&
                                    //     errors[`values[${index}]`]
                                    // )}
                                    // helperText={
                                    //   touched[`values[${index}]`] &&
                                    //   errors[`values[${index}]`]
                                    // }
                                    // label="Value"
                                    disabled={!values.values[index].edit}
                                    margin="normal"
                                    name={`values[${index}].value`}
                                    onChange={handleChange}
                                    type="text"
                                    value={values.values[index].value}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>

                                {values.values[index]._id &&
                                  values.values[index].edit && (
                                    <Grid item xs={1}>
                                      <Tooltip title="Update Value">
                                        <IconButton
                                          color="error"
                                          aria-label="update"
                                          variant="contained"
                                          className={classes.dangerButton}
                                          onClick={() => {
                                            updateValue(values.values[index]);
                                            formProps.setFieldValue(
                                              `values.${index}.edit`,
                                              false
                                            );
                                          }}
                                        >
                                          <UpdateIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Grid>
                                  )}
                                {values.values[index]._id &&
                                  !values.values[index].edit && (
                                    <Grid item xs={1}>
                                      <Tooltip title="Edit Value">
                                        <IconButton
                                          color="error"
                                          aria-label="edit"
                                          variant="contained"
                                          className={classes.dangerButton}
                                          onClick={() =>
                                            formProps.setFieldValue(
                                              `values.${index}.edit`,
                                              true
                                            )
                                          }
                                        >
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Grid>
                                  )}
                                {values.values.length > 1 && (
                                  <Grid item xs={1}>
                                    <Tooltip title="Remove Value">
                                      <IconButton
                                        color="error"
                                        aria-label="remove"
                                        variant="contained"
                                        className={classes.dangerButton}
                                        onClick={() => {
                                          deleteValue(values.values[index]);
                                          remove(index);
                                        }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                )}
                              </Grid>
                            ))}
                            <Grid
                              container
                              item
                              xs={12}
                              spacing={2}
                              direction="row-reverse"
                              justify="flex-end"
                            >
                              <Grid item>
                                <Tooltip title="Add Row">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() =>
                                      push({ value: '', edit: true })
                                    }
                                  >
                                    Add Value
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
                    {/* <Box className={classes.imageStyle}>
                        <Image
                          src={imageFile}
                          aspectRatio={9 / 3}
                          alt="upload Image"
                          name="imageSource"
                        />
                      </Box> */}
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
                        Update Attribute
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

export default EditAttribute;
