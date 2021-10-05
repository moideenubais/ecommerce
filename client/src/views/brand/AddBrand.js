import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import axios from 'axios';
import Image from 'material-ui-image';
import { subscribeUser } from '../../subscription';

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
  },
  uploadBigImage: {
    height: '100px',
    margin: '10px'
  }
}));

const AddBrand = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [logoImageFile, setLogoImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [brands, getBrands] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  let logoImageRender = logoImageFile ? (
    <Image src={logoImageFile} aspectRatio={9 / 3} alt="uploaded logo image" />
  ) : null;

  const getImages = images => {
    return images.map((image, index) => (
      <img className={classes.uploadBigImage} src={image} key={index + image} />
    ));
  };

  // let iconImageRender = (iconImageFile)?<Image
  //   src={iconImageFile}
  //   aspectRatio={9 / 3}
  //   alt="uploaded icon image"
  // /> : null;
  //   let menu = null;
  // let logoImageRender = logoImageFile ? (
  //   <Image src={logoImageFile} aspectRatio={9 / 3} alt="upload Image" />
  // ) : null;

  // useEffect( () => {
  //   getAllBrands();
  // },[]);

  const getLanguageLabel = key => {
    return languages.filter(language => language.key === key)[0].label;
  };

  // const getAllBrands = () => {
  //   axios.get(CONSTANTS.BASE_URL+'api/brand',{params:{limit:1000,page:1}})
  //   .then(response => {
  //     // console.log("brand data",response.data.brands);
  //     const allBrands = response.data.brands;
  //     getBrands(allBrands);
  //     // setLoading(false);
  //   //   menu = allBrands.map((brand)=>{
  //   //       console.log("sdlksl",brand)
  //   //       return(<MenuItem value={brand._id}>{brand.name}</MenuItem>)
  //   //       });
  //   })
  //   .catch(error => {
  //     console.log(error)
  //     // setLoading(false)
  //   })
  // }

  // const onEditorStateChange = editorState => {
  //   getEditorState(editorState);
  // };
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
    // <Page className={classes.root} title="Register">
    <div style={{ marginTop: '10px', overflow: 'auto' }}>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <Container maxWidth="md">
          <Formik
            initialValues={{
              language: 'en',
              // parentId:'',
              logo_url: '',
              // icon_url: '',
              resourceBundle: [{ languageCode: 'en', name: '' }],
              tab: 0
            }}
            validationSchema={Yup.object().shape({
              // parentId: Yup.string(),
              resourceBundle: Yup.array().of(
                Yup.object().shape({
                  name: Yup.string()
                    .max(255)
                    .required('Brand Name required'),
                  // brand_description: Yup.string(),
                  languageCode: Yup.string()
                    .max(255)
                    .required('Language required')
                })
              )
            })}
            onSubmit={values => {
              let data = new FormData();
              // data.append('resourceBundle', values.resourceBundle);
              values.resourceBundle.forEach((resource, index) => {
                data.append(
                  'resourceBundle[' + index + '][languageCode]',
                  resource.languageCode
                );
                data.append(
                  'resourceBundle[' + index + '][name]',
                  resource.name
                );
              });
              // if(!isEmpty(values.parentId))
              // data.append('parentId', values.parentId);
              // console.log(values);
              if (!isEmpty(values.logo_url.name)) {
                //   console.log("got in",values.image_url.name, isEmpty(values.image_url.name))
                data.append('logo', values.logo_url);
              }
              // if(!isEmpty(values.icon_url.name)){
              //   data.append('brand_icon', values.icon_url);
              // }
              // data.resourceBundle = values.resourceBundle;

              axios
                .post(CONSTANTS.BASE_URL + 'api/brand', data)
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
                      title="Add Brand"
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
                          // console.log(
                          //   "vlaues",
                          //   values,
                          //   "contents",
                          //   resourceBundle,
                          //   "touched",
                          //   touched,
                          //   "errror",
                          //   errors
                          // );
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
                                                errors.resourceBundle[index]
                                                  .name
                                            )
                                          : false
                                      }
                                      helperText={
                                        touched.resourceBundle &&
                                        errors.resourceBundle &&
                                        touched.resourceBundle[index] &&
                                        errors.resourceBundle[index]
                                          ? touched.resourceBundle[index]
                                              .name &&
                                            errors.resourceBundle[index].name
                                          : null
                                      }
                                      label="Brand Name"
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
                      {/* <FormControl
                                    fullWidth
                                      variant="outlined"
                                      className={classes.formControl}
                                    >
                                      <InputLabel id="demo-simple-select-outlined-label">
                                        Parent Brand
                                      </InputLabel>
                                      <Select
                                      fullWidth
                                        labelId="demo-simple-select-outlined-label"
                                        id="demo-simple-select-outlined"
                                        name="parentId"
                                        value={values.parentId}
                                        onChange={handleChange}
                                        label="Parent Brand"
                                      >
                                        <MenuItem value="">
                                          <em>None</em>
                                        </MenuItem>
                                        {brands.map((brand) => {
                                          return (
                                            <MenuItem
                                              key={brand._id}
                                              value={brand._id}
                                            >
                                              {brand.i18nResourceBundle.name}
                                            </MenuItem>
                                          );
                                        })}

                        
                                      </Select>
                                    </FormControl> */}
                      {/* <Button variant="contained" component="label">
                        Upload Logo Image &#40; 120x80 	&#41;
                        <input
                          type="file"
                          name="logo_url"
                          onChange={event => {
                            setLogoImage(URL.createObjectURL(event.target.files[0]))
                            formProps.setFieldValue(
                              'logo_url',
                              event.target.files[0]
                            );
                          }}
                          hidden
                        />
                      </Button>
                      <Box marginTop="10px" marginBottom="10px">
                      
                      {logoImageRender}
                      </Box> */}
                      <Box mt={2}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="logo_url"
                          type="file"
                          name="logo_url"
                          onChange={event => {
                            if (event.target.files) {
                              let fileArray = Array.from(
                                event.target.files
                              ).map(file => URL.createObjectURL(file));
                              setLogoImage(fileArray[0]);
                              formProps.setFieldValue(
                                'logo_url',
                                event.target.files[0]
                              );
                            }
                          }}
                        />
                        <label htmlFor="logo_url">
                          <Button
                            variant="contained"
                            color="primary"
                            component="span"
                          >
                            Upload Logo Image &#40; 120x80 &#41;
                          </Button>
                        </label>
                      </Box>
                      {logoImageFile && (
                        <div> {getImages([logoImageFile])}</div>
                      )}
                      {/* <Button variant="contained" component="label">
                        Upload Icon Image
                        <input
                          type="file"
                          name="icon_url"
                          onChange={event => {
                            setIconImage(URL.createObjectURL(event.target.files[0]))
                            formProps.setFieldValue(
                              'icon_url',
                              event.target.files[0]
                            );
                          }}
                          hidden
                        />
                      </Button>
                      <Box marginTop="10px" marginBottom="10px">
                      {iconImageRender}
                      </Box> */}
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
                          Add Brand
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </form>
              </React.Fragment>
            )}
          </Formik>
        </Container>
      </Box>
    </div>
  );
  return page;
};

export default AddBrand;
