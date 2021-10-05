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
  DialogTitle,
  FormLabel,
  Grid
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
  },
  uploadBigImage: {
    height: '100px',
    margin: '10px'
  }
}));

const EditShop = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [shopData, setShopData] = useState(null);
  const [translationModel, setTranslationModel] = useState(false);
  const [bannerImageFiles, setBannerImageFiles] = useState(null);
  const [logoImageFile, setLogoImageFile] = useState(null);

  //   const [shops, getShops] = useState([]);
  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];
  const getImages = images => {
    return images.map((image, index) => (
      <img className={classes.uploadBigImage} src={image} key={index + image} />
    ));
  };

  useEffect(() => {
    getSingleShop();
    // getAllShops();
    // getAllShops();
  }, []);

  const getSingleShop = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/shop/' + id)
      .then(response => {
        const shopData = response.data;
        setShopData(shopData);
        if (!isEmpty(shopData.banner_urls))
          setBannerImageFiles(
            Array.from(shopData.banner_urls).map(
              image => CONSTANTS.BASE_URL + image
            )
          );
        if (shopData.logo_url)
          setLogoImageFile(CONSTANTS.BASE_URL + shopData.logo_url);
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
  const getRousourceBundleData = resourceBundle => {
    return resourceBundle.map(resource => {
      let address = resource.address;
      if (!address) {
        address = {
          building_name: '',
          street: '',
          city: ''
        };
      } else {
        if (!address.building_name) address.building_name = '';
        if (!address.street) address.street = '';
        if (!address.city) address.city = '';
      }
      return { ...resource, address };
    });
  };

  let page = shopData ? (
    <Page className={classes.root} title="Shop Update">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            language: 'en',
            // parentId:'',
            // banner_urls: shopData.banner_urls?shopData.banner_urls:[],
            // logo_url: '',
            mobile: shopData.mobile,
            commission_per_product: shopData.commission_per_product,
            // icon_url: '',
            resourceBundle: getRousourceBundleData(shopData.resourceBundle),
            tab: 0
          }}
          validationSchema={Yup.object().shape({
            mobile: Yup.string()
              .matches(
                /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
                'Mobile Number is not valid'
              )
              .required('Mobile Number required'),
            commission_per_product: Yup.number().required(
              'Commission per product required'
            ),
            resourceBundle: Yup.array().of(
              Yup.object().shape({
                name: Yup.string()
                  .max(255)
                  .required('Shop Name required'),
                // shop_description: Yup.string(),
                languageCode: Yup.string()
                  .max(255)
                  .required('Language required')
              })
            )
          })}
          onSubmit={values => {
            //   let data = {};
            let data = new FormData();
            // if(!isEmpty(values.parentId))
            // data.append('parentId', values.parentId);
            values.resourceBundle.forEach((resource, index) => {
              data.append(
                'resourceBundle[' + index + '][languageCode]',
                resource.languageCode
              );
              data.append('resourceBundle[' + index + '][name]', resource.name);
              if (!isEmpty(resource.address)) {
                if (!isEmpty(resource.address.building_name))
                  data.append(
                    'resourceBundle[' + index + '][address][building_name]',
                    resource.address.building_name
                  );
                if (!isEmpty(resource.address.street))
                  data.append(
                    'resourceBundle[' + index + '][address][street]',
                    resource.address.street
                  );
                if (!isEmpty(resource.address.city))
                  data.append(
                    'resourceBundle[' + index + '][address][city]',
                    resource.address.city
                  );
              }
              if (!isEmpty(resource.pickup_point))
                data.append(
                  'resourceBundle[' + index + '][pickup_point]',
                  resource.pickup_point
                );
            });
            data.append('mobile', values.mobile);
            data.append(
              'commission_per_product',
              values.commission_per_product
            );
            if (!isUndefined(values.banner_urls))
              Array.from(values.banner_urls).forEach(image_url => {
                if (!isUndefined(image_url)) {
                  data.append('banner', image_url);
                }
              });

            if (!isUndefined(values.logo_url)) {
              data.append('logo', values.logo_url);
            }

            // if (!isUndefined(values.logo_url))
            //   data.append("logo", values.logo_url);
            // if (!isUndefined(values.icon_url))
            //   data.append("shop_icon", values.icon_url);

            //   data.resourceBundle = values.resourceBundle;
            axios
              .put(CONSTANTS.BASE_URL + 'api/shop/' + shopData._id, data)
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
                    title="Update Shop"
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
                                        address: {
                                          building_name: '',
                                          street: '',
                                          city: ''
                                        },
                                        pickup_point: '',
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
                                    label="Shop Name"
                                    margin="normal"
                                    name={`resourceBundle[${index}].name`}
                                    onChange={handleChange}
                                    type="text"
                                    value={values.resourceBundle[index].name}
                                    variant="outlined"
                                  />
                                  <FormLabel>&nbsp;Address</FormLabel>
                                  <Grid container spacing={3}>
                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth
                                        error={
                                          touched.resourceBundle &&
                                          errors.resourceBundle &&
                                          touched.resourceBundle[index] &&
                                          errors.resourceBundle[index]
                                            ? Boolean(
                                                touched.resourceBundle[index]
                                                  .address.building_name &&
                                                  errors.resourceBundle[index]
                                                    .address.building_name
                                              )
                                            : false
                                        }
                                        helperText={
                                          touched.resourceBundle &&
                                          errors.resourceBundle &&
                                          touched.resourceBundle[index] &&
                                          errors.resourceBundle[index]
                                            ? touched.resourceBundle[index]
                                                .address.building_name &&
                                              errors.resourceBundle[index]
                                                .address.building_name
                                            : null
                                        }
                                        label="Building Name"
                                        multiline
                                        margin="normal"
                                        name={`resourceBundle[${index}].address.building_name`}
                                        onChange={handleChange}
                                        type="text"
                                        value={
                                          values.resourceBundle[index].address
                                            .building_name
                                        }
                                        variant="outlined"
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth
                                        error={
                                          touched.resourceBundle &&
                                          errors.resourceBundle &&
                                          touched.resourceBundle[index] &&
                                          errors.resourceBundle[index]
                                            ? Boolean(
                                                touched.resourceBundle[index]
                                                  .address.street &&
                                                  errors.resourceBundle[index]
                                                    .address.street
                                              )
                                            : false
                                        }
                                        helperText={
                                          touched.resourceBundle &&
                                          errors.resourceBundle &&
                                          touched.resourceBundle[index] &&
                                          errors.resourceBundle[index]
                                            ? touched.resourceBundle[index]
                                                .address.street &&
                                              errors.resourceBundle[index]
                                                .address.street
                                            : null
                                        }
                                        label="Street"
                                        multiline
                                        margin="normal"
                                        name={`resourceBundle[${index}].address.street`}
                                        onChange={handleChange}
                                        type="text"
                                        value={
                                          values.resourceBundle[index].address
                                            .street
                                        }
                                        variant="outlined"
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth
                                        error={
                                          touched.resourceBundle &&
                                          errors.resourceBundle &&
                                          touched.resourceBundle[index] &&
                                          errors.resourceBundle[index]
                                            ? Boolean(
                                                touched.resourceBundle[index]
                                                  .address.city &&
                                                  errors.resourceBundle[index]
                                                    .address.city
                                              )
                                            : false
                                        }
                                        helperText={
                                          touched.resourceBundle &&
                                          errors.resourceBundle &&
                                          touched.resourceBundle[index] &&
                                          errors.resourceBundle[index]
                                            ? touched.resourceBundle[index]
                                                .address.city &&
                                              errors.resourceBundle[index]
                                                .address.city
                                            : null
                                        }
                                        label="City"
                                        multiline
                                        margin="normal"
                                        name={`resourceBundle[${index}].address.city`}
                                        onChange={handleChange}
                                        type="text"
                                        value={
                                          values.resourceBundle[index].address
                                            .city
                                        }
                                        variant="outlined"
                                      />
                                    </Grid>
                                  </Grid>
                                  <TextField
                                    fullWidth
                                    error={
                                      touched.resourceBundle &&
                                      errors.resourceBundle &&
                                      touched.resourceBundle[index] &&
                                      errors.resourceBundle[index]
                                        ? Boolean(
                                            touched.resourceBundle[index]
                                              .pickup_point &&
                                              errors.resourceBundle[index]
                                                .pickup_point
                                          )
                                        : false
                                    }
                                    helperText={
                                      touched.resourceBundle &&
                                      errors.resourceBundle &&
                                      touched.resourceBundle[index] &&
                                      errors.resourceBundle[index]
                                        ? touched.resourceBundle[index]
                                            .pickup_point &&
                                          errors.resourceBundle[index]
                                            .pickup_point
                                        : null
                                    }
                                    label="Pickup Point"
                                    margin="normal"
                                    name={`resourceBundle[${index}].pickup_point`}
                                    onChange={handleChange}
                                    type="text"
                                    value={
                                      values.resourceBundle[index].pickup_point
                                    }
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
                      error={Boolean(touched.mobile && errors.mobile)}
                      helperText={touched.mobile && errors.mobile}
                      label="Mobile"
                      margin="normal"
                      name="mobile"
                      onChange={handleChange}
                      type="text"
                      value={values.mobile}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      error={Boolean(
                        touched.commission_per_product &&
                          errors.commission_per_product
                      )}
                      helperText={
                        touched.commission_per_product &&
                        errors.commission_per_product
                      }
                      label="Commission per product"
                      margin="normal"
                      name="commission_per_product(in percentage)"
                      onChange={handleChange}
                      type="number"
                      value={values.commission_per_product}
                      variant="outlined"
                    />
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="contained-button-file"
                      multiple
                      type="file"
                      name="banner_urls"
                      onChange={event => {
                        if (event.target.files) {
                          let fileArray = Array.from(
                            event.target.files
                          ).map(file => URL.createObjectURL(file));
                          setBannerImageFiles(fileArray);
                          formProps.setFieldValue(
                            'banner_urls',
                            event.target.files
                          );
                        }
                      }}
                    />
                    <label htmlFor="contained-button-file">
                      <Button
                        variant="contained"
                        color="primary"
                        component="span"
                      >
                        Update Banner Image
                      </Button>
                    </label>
                    {bannerImageFiles && (
                      <div> {getImages(bannerImageFiles)}</div>
                    )}

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
                            setLogoImageFile(fileArray[0]);
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
                          Update Logo Image
                        </Button>
                      </label>
                    </Box>
                    {logoImageFile && <div> {getImages([logoImageFile])}</div>}
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
                        Update Shop
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

export default EditShop;
