import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import axios from 'axios';
import Image from 'material-ui-image';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import DateFnsUtils from '@date-io/date-fns';
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormHelperText,
  Link,
  TextField,
  Typography,
  // makeStyles,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Select,
  Grid,
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
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import { isEmpty, rest } from 'lodash';
import Spinner from '../../components/Spinner';
import TabPanel from 'src/components/TabPanel';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

function getStyles(name, nameArray, theme) {
  return {
    fontWeight:
      nameArray.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium
  };
}

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
  uploadBannerImage: {
    height: '100px',
    margin: '10px'
  }
}));

const AddAd = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  // const [bannerImageFile, setBannerImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [ads, getAds] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);
  const theme = useTheme();
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [products, setProducts] = useState(null);
  const [adImageFiles, setAdImageFiles] = useState(null);

  const getImages = images => {
    return images.map((image, index) => (
      <img
        className={classes.uploadBannerImage}
        src={image}
        key={index + image}
      />
    ));
  };

  const discountTypes = [
    {
      key: 'flat',
      name: 'Flat'
    },
    {
      key: 'percentage',
      name: 'Percentage'
    }
  ];

  const getProductData = (oldProductData, newValueArray) => {
    console.log('newValuesArray', newValueArray);
    // return;
    let updatedProductData = [];
    if (!isEmpty(oldProductData)) {
      newValueArray.forEach(value => {
        const currentProduct = products.find(product => product._id == value);
        let base_price = 0;
        for (let varient in currentProduct.prices) {
          if (varient.unit_price > base_price) base_price = varient.unit_price;
        }
        let dataExists = oldProductData.find(data => data.product_id == value);
        if (isEmpty(dataExists)) {
          updatedProductData.push({
            product_id: value,
            name: currentProduct.i18nResourceBundle.name,
            url: currentProduct.product_image_small_url,
            discount: 0,
            discount_type: 'flat',
            base_price: base_price
          });
        }
      });
    } else {
      newValueArray.forEach(value => {
        const currentProduct = products.find(product => product._id == value);
        let base_price = 0;
        for (let varient in currentProduct.prices) {
          if (varient.unit_price > base_price) base_price = varient.unit_price;
        }
        updatedProductData.push({
          product_id: value,
          name: currentProduct.i18nResourceBundle.name,
          url: currentProduct.product_image_small_url,
          discount: 0,
          discount_type: 'flat',
          base_price: base_price
        });
      });
    }
    return updatedProductData;
  };

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  let bannerImageRender = bannerImageFile ? (
    <Image
      src={bannerImageFile}
      aspectRatio={9 / 3}
      alt="uploaded banner image"
    />
  ) : null;

  let iconImageRender = iconImageFile ? (
    <Image src={iconImageFile} aspectRatio={9 / 3} alt="uploaded icon image" />
  ) : null;
  //   let menu = null;
  // let bannerImageRender = bannerImageFile ? (
  //   <Image src={bannerImageFile} aspectRatio={9 / 3} alt="upload Image" />
  // ) : null;

  useEffect(() => {
    // getAllAds();
    getAllProducts();
  }, []);

  const getLanguageLabel = key => {
    return languages.filter(language => language.key === key)[0].label;
  };

  const getAllAds = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/ad', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        // console.log("ad data",response.data.ads);
        const allAds = response.data.ads;
        getAds(allAds);
        // setLoading(false);
        //   menu = allAds.map((ad)=>{
        //       console.log("sdlksl",ad)
        //       return(<MenuItem value={ad._id}>{ad.name}</MenuItem>)
        //       });
      })
      .catch(error => {
        console.log(error);
        // setLoading(false)
      });
  };

  const getAllProducts = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/product', {
        params: { page: 1, limit: 10000 }
      })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.products);
        const allProducts = response.data.products;
        if (!isEmpty(allProducts)) {
          // const totalRows = response.data.info.totalNumber;
          // setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setProducts(allProducts);
        } else {
          setProducts([]);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

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
  const adTypes = [
    { key: 'top', name: 'Top' },
    { key: 'middle', name: 'Middle' },
    { key: 'removable_top', name: 'Top Removable' }
  ];

  const page = products && (
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
              ad_url: [],
              // icon_url: '',
              resourceBundle: [{ languageCode: 'en', name: '' }],
              name: '',
              ad_type: adTypes[0].key,
              discount_date_from: new Date(),
              discount_date_to: new Date(),
              products: [],
              productData: [],
              tab: 0
            }}
            validationSchema={Yup.object().shape({
              // parentId: Yup.string(),
              name: Yup.string(),
              ad_type: Yup.string().required('Ad Type required')
            })}
            onSubmit={values => {
              let data = new FormData();
              data.append('name', values.name);
              data.append('ad_type', values.ad_type);

              if (!isEmpty(values.ad_url))
                Array.from(values.ad_url).forEach(image_url => {
                  if (!isEmpty(image_url.name)) {
                    data.append('ad', image_url);
                  }
                });

              axios
                .post(CONSTANTS.BASE_URL + 'api/ad', data)
                .then(response => {
                  // console.log(response.data);
                  const bill = response.data;
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
                      title="Add Ad"
                    />
                    <Divider />
                    <CardContent>
                      <TextField
                        fullWidth
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                        label="Name"
                        margin="normal"
                        name="name"
                        onChange={handleChange}
                        type="text"
                        value={values.name}
                        variant="outlined"
                      />
                      <FormControl
                        fullWidth
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="category_id_label">Add Type</InputLabel>
                        <Select
                          fullWidth
                          error={Boolean(touched.ad_type && errors.ad_type)}
                          helperText={touched.ad_type && errors.ad_type}
                          margin="normal"
                          variant="outlined"
                          labelId="category_id_label"
                          id="ad_type"
                          name="ad_type"
                          value={values.ad_type}
                          onChange={handleChange}
                          label="Add Type"
                        >
                          {adTypes.map(adType => {
                            return (
                              <MenuItem key={adType.key} value={adType.key}>
                                {adType.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <Box mt={2}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="contained-button-file"
                          multiple
                          type="file"
                          name="ad_url"
                          onChange={event => {
                            if (event.target.files) {
                              let fileArray = Array.from(
                                event.target.files
                              ).map(file => URL.createObjectURL(file));
                              setAdImageFiles(fileArray);
                              formProps.setFieldValue(
                                'ad_url',
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
                            Upload Ad Images
                          </Button>
                        </label>
                      </Box>
                      {adImageFiles && <div> {getImages(adImageFiles)}</div>}
                    </CardContent>
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
                          Add Ad
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

export default AddAd;
