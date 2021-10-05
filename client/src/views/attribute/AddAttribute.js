import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import axios from 'axios';
import Image from 'material-ui-image';
import { subscribeUser } from '../../subscription';
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

const AddAttribute = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [logoImageFile, setLogoImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [attributes, getAttributes] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  let logoImageRender = logoImageFile ? (
    <Image src={logoImageFile} aspectRatio={9 / 3} alt="uploaded logo image" />
  ) : null;

  const getLanguageLabel = key => {
    return languages.filter(language => language.key === key)[0].label;
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

  const page = (
    <Page className={classes.root} title="Register">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            language: 'en',
            resourceBundle: [{ languageCode: 'en', name: '' }],
            tab: 0,
            values: []
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
            
          })}
          onSubmit={values => {
            let data = {
              resourceBundle: values.resourceBundle
            };
            if (!isEmpty(values.values)) data.values = values.values;
            axios
              .post(CONSTANTS.BASE_URL + 'api/attribute', data)
              .then(response => {
                // console.log(response.data);
                const bill = response.data;
                subscribeUser({
                  body: 'new one from product',
                  title: 'Added Product'
                });
                // getBills(allBills);
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
                    title="Add Attribute"
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
                        return (
                          <>
                            <Tabs
                              value={values.tab}
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

                    <FieldArray name="values">
                      {fieldArrayProps => {
                        const { push, remove, form } = fieldArrayProps;
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
                                    margin="normal"
                                    name={`values[${index}].value`}
                                    onChange={handleChange}
                                    type="text"
                                    value={values.values[index].value}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>

                                {values.values.length > 1 && (
                                  <Grid item xs={1}>
                                    <Tooltip title="Remove Value">
                                      <IconButton
                                        color="error"
                                        aria-label="remove"
                                        variant="contained"
                                        className={classes.dangerButton}
                                        onClick={() => remove(index)}
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
                                    onClick={() => push({ value: '' })}
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
                        Add Attribute
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

export default AddAttribute;
