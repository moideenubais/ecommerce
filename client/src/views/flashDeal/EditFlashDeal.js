import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { isEmpty, isUndefined, find } from 'lodash';
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
  TableRow,
  Grid
} from '@material-ui/core';
import Page from 'src/components/Page';
import Image from 'material-ui-image';
import axios from 'axios';
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
  uploadBannerImage: {
    height: '100px',
    margin: '10px'
  }
}));

const EditFlashDeal = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const [flashDealData, setFlashDealData] = useState([]);
  const theme = useTheme();
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [products, setProducts] = useState(null);

  //   const [editorState, getEditorState] = useState(EditorState.createEmpty());
  // const [flashDeals, getFlashDeals] = useState([])
  const [translationModel, setTranslationModel] = useState(false);

  //   const [flashDeals, getFlashDeals] = useState([]);
  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  const getImages = images => {
    return images.map((image, index) => (
      <img
        className={classes.uploadBannerImage}
        src={image}
        key={index + image}
      />
    ));
  };

  const colors = [
    { key: 'dark', name: 'Dark' },
    { key: 'white', name: 'White' }
  ];

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

  const getProductData = (oldProductData, newValueArray) => {
    console.log('newValuesArray', newValueArray);
    // return;
    let updatedProductData = [];
    if (!isEmpty(oldProductData)) {
      newValueArray.forEach(value => {
        const currentProduct = products.find(product => product._id == value);
        let base_price = 0;
        for (let varient of currentProduct.prices) {
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
        for (let varient of currentProduct.prices) {
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

  useEffect(() => {
    getSingleFlashDeal();
    getAllProducts();
    // getAllFlashDeals();
  }, []);

  const getSingleFlashDeal = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/flash/' + id)
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const flashDealData = response.data;
        // const html = flashDealData.description || '';
        // const contentBlock = htmlToDraft(html);
        // if (contentBlock) {
        //   const contentState = ContentState.createFromBlockArray(
        //     contentBlock.contentBlocks
        //   );
        //   let editorState = EditorState.createWithContent(contentState);
        //   getEditorState(editorState);
        // }
        setFlashDealData(flashDealData);
        setBannerImageFile(CONSTANTS.BASE_URL + flashDealData.banner_url);
        // setIconImage(CONSTANTS.BASE_URL + flashDealData.icon_url);
        // setImage(CONSTANTS.BASE_URL+flashDealData.imageUrl);
        //   getBills(allBills);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // const getAllFlashDeals = () => {
  //   axios
  //     .get(CONSTANTS.BASE_URL + 'api/flashDeal', {
  //       params: { limit: 1000, page: 1 }
  //     })
  //     .then(response => {
  //       //   console.log("service data",response.data);
  //       const allFlashDeals = response.data.flashDeals;
  //       getFlashDeals(allFlashDeals);
  //       //   menu = allServices.map((service)=>{
  //       //       console.log("sdlksl",service)
  //       //       return(<MenuItem value={service._id}>{service.name}</MenuItem>)
  //       //       });
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
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
  const getInitProducts = products => {
    if (!isEmpty(products)) return products.map(product => product.product_id);
    return [];
  };
  const getInitProductData = productsInFlash => {
    const finalArray = [];
    if (!isEmpty(productsInFlash)) {
      productsInFlash.forEach(flashProduct => {
        const currentProduct = products.find(
          product => product._id == flashProduct.product_id
        );
        let base_price = 0;
        if(!isEmpty(currentProduct)){
          for (let varient of currentProduct.prices) {
            if (varient.unit_price > base_price) base_price = varient.unit_price;
          }
          finalArray.push({
            product_id: flashProduct.product_id,
            name: currentProduct.i18nResourceBundle.name,
            url: currentProduct.product_image_small_url,
            discount: flashProduct.discount,
            discount_type: flashProduct.discount_type,
            base_price: flashProduct.base_price
          });

        }
      });
    }
    return finalArray;
  };

  let page =
    flashDealData && products ? (
      // <Page className={classes.root} title="FlashDeal Update">
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
                // banner_url: '',
                // icon_url: '',
                resourceBundle: flashDealData.resourceBundle,
                bg_color: flashDealData.bg_color,
                text_color: flashDealData.text_color,
                discount_date_from: flashDealData['duration'].from,
                discount_date_to: flashDealData['duration'].to,
                products: getInitProducts(flashDealData.products),
                productData: getInitProductData(flashDealData.products),
                tab: 0
              }}
              validationSchema={Yup.object().shape({
                // parentId: Yup.string(),
                bg_color: Yup.string().required('Background colour required'),
                resourceBundle: Yup.array().of(
                  Yup.object().shape({
                    name: Yup.string()
                      .max(255)
                      .required('FlashDeal Name required'),
                    // flashDeal_description: Yup.string(),
                    languageCode: Yup.string()
                      .max(255)
                      .required('Language required')
                  })
                )
              })}
              onSubmit={values => {
                //   let data = {};
                let data = new FormData();
                // if (!isEmpty(values.parentId))
                //   data.append('parentId', values.parentId);
                values.resourceBundle.forEach((resource, index) => {
                  // delete resource._id;
                  data.append(
                    'resourceBundle[' + index + '][languageCode]',
                    resource.languageCode
                  );
                  data.append(
                    'resourceBundle[' + index + '][name]',
                    resource.name
                  );
                  if (!isUndefined(resource._id))
                    data.append(
                      'resourceBundle[' + index + '][_id]',
                      resource._id
                    );
                });

                data.append('duration[from]', values.discount_date_from);
                data.append('duration[to]', values.discount_date_to);
                data.append('bg_color', values.bg_color);
                data.append('text_color', values.text_color);
                if (!isEmpty(values.productData)) {
                  values.productData.forEach((pro_data, index) => {
                    data.append(
                      `products[${index}][product_id]`,
                      pro_data.product_id
                    );
                    data.append(
                      `products[${index}][discount_type]`,
                      pro_data.discount_type
                    );
                    data.append(
                      `products[${index}][discount]`,
                      pro_data.discount
                    );
                  });
                }
                if (!isUndefined(values.banner_url))
                  data.append('banner', values.banner_url);
                // if (!isUndefined(values.icon_url))
                //   data.append('flashDeal_icon', values.icon_url);

                //   data.resourceBundle = values.resourceBundle;
                axios
                  .put(
                    CONSTANTS.BASE_URL + 'api/flash/' + flashDealData._id,
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
                        title="Update FlashDeal"
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
                                      label="Title"
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
                        error={Boolean(touched.bg_color && errors.bg_color)}
                        helperText={touched.bg_color && errors.bg_color}
                        label="Background Color(Hexa-code)"
                        margin="normal"
                        name="bg_color"
                        onChange={handleChange}
                        type="text"
                        value={values.bg_color}
                        variant="outlined"
                      />
                      <FormControl
                        fullWidth
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="category_id_label">
                          Text Color
                        </InputLabel>
                        <Select
                          fullWidth
                          error={Boolean(
                            touched.text_color && errors.text_color
                          )}
                          helperText={touched.text_color && errors.text_color}
                          margin="normal"
                          variant="outlined"
                          labelId="category_id_label"
                          id="text_color"
                          name="text_color"
                          value={values.text_color}
                          onChange={handleChange}
                          label="Text Color"
                        >
                          {/* <MenuItem value="">
                            <em>None</em>
                          </MenuItem> */}
                          {colors.map(color => {
                            return (
                              <MenuItem key={color.key} value={color.key}>
                                {color.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <Box my={2}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="banner_url"
                          type="file"
                          name="banner_url"
                          onChange={event => {
                            if (event.target.files) {
                              let fileArray = Array.from(
                                event.target.files
                              ).map(file => URL.createObjectURL(file));
                              setBannerImageFile(fileArray[0]);
                              formProps.setFieldValue(
                                'banner_url',
                                event.target.files[0]
                              );
                            }
                          }}
                        />
                        <label htmlFor="banner_url">
                          <Button
                            variant="contained"
                            color="primary"
                            component="span"
                          >
                            Upload Banner Image &#40; 1920x500 &#41;
                          </Button>
                        </label>
                      </Box>
                      {bannerImageFile && (
                        <div> {getImages([bannerImageFile])}</div>
                      )}

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DateTimePicker
                              label="Discount Start Date"
                              name="discount_date_from"
                              autoOk={true}
                              // disableToolbar
                              variant="inline"
                              inputVariant="outlined"
                              fullWidth
                              value={values.discount_date_from}
                              onChange={date => {
                                formProps.setFieldValue(
                                  'discount_date_from',
                                  date
                                );
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DateTimePicker
                              label="Discount Start Date"
                              // format="dd/MMM/yyyy"
                              name="discount_date_to"
                              autoOk={true}
                              // disableToolbar
                              variant="inline"
                              inputVariant="outlined"
                              fullWidth
                              value={values.discount_date_to}
                              onChange={date => {
                                formProps.setFieldValue(
                                  'discount_date_to',
                                  date
                                );
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>

                      <FormControl fullWidth className={classes.formControl}>
                        <InputLabel id="demo-mutiple-name-label">
                          Products
                        </InputLabel>
                        <Select
                          labelId="demo-mutiple-name-label"
                          id="demo-mutiple-name"
                          multiple
                          value={values.products}
                          onChange={event => {
                            formProps.setFieldValue(
                              'products',
                              event.target.value
                            );
                            let newProductData = getProductData(
                              values.product_data,
                              event.target.value
                            );
                            formProps.setFieldValue(
                              'productData',
                              newProductData
                            );
                          }}
                          input={<Input />}
                          MenuProps={MenuProps}
                        >
                          {products.map(product => (
                            <MenuItem
                              key={product._id}
                              value={product._id}
                              style={getStyles(
                                product._id,
                                values.products,
                                theme
                              )}
                            >
                              {product.i18nResourceBundle.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {!isEmpty(values.productData) ? (
                        <Table style={{ marginTop: '1rem' }}>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ textAlign: 'center' }}>
                                Product
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                Base Price
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                Discount
                              </TableCell>
                              <TableCell style={{ textAlign: 'center' }}>
                                Discount Type
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {values.productData.map((varient, index) => {
                              return (
                                <TableRow
                                  // hover
                                  key={index + varient.product_id}
                                >
                                  <TableCell style={{ textAlign: 'center' }}>
                                    <Grid container xs={12}>
                                      <Grid item xs={6}>
                                        <img
                                          style={{ width: '50px' }}
                                          src={CONSTANTS.BASE_URL + varient.url}
                                          alt="icon_url"
                                        />
                                      </Grid>
                                      <Grid item xs={6} alignItems="center">
                                        <span>{varient.name}</span>
                                      </Grid>
                                    </Grid>
                                  </TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>
                                    {varient.base_price}
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      error={
                                        touched.productData &&
                                        errors.productData &&
                                        touched.productData[index] &&
                                        errors.productData[index]
                                          ? Boolean(
                                              touched.productData[index]
                                                .discount &&
                                                errors.productData[index]
                                                  .discount
                                            )
                                          : false
                                      }
                                      helperText={
                                        touched.productData &&
                                        errors.productData &&
                                        touched.productData[index] &&
                                        errors.productData[index]
                                          ? touched.productData[index]
                                              .discount &&
                                            errors.productData[index].discount
                                          : null
                                      }
                                      // label="Varient Price"
                                      margin="normal"
                                      name={`productData[${index}].discount`}
                                      onChange={handleChange}
                                      type="number"
                                      value={values.productData[index].discount}
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormControl
                                      fullWidth
                                      variant="outlined"
                                      className={classes.formControl}
                                    >
                                      <Select
                                        fullWidth
                                        error={
                                          touched.productData &&
                                          errors.productData &&
                                          touched.productData[index] &&
                                          errors.productData[index]
                                            ? Boolean(
                                                touched.productData[index]
                                                  .discount_type &&
                                                  errors.productData[index]
                                                    .discount_type
                                              )
                                            : false
                                        }
                                        helperText={
                                          touched.productData &&
                                          errors.productData &&
                                          touched.productData[index] &&
                                          errors.productData[index]
                                            ? touched.productData[index]
                                                .discount_type &&
                                              errors.productData[index]
                                                .discount_type
                                            : null
                                        }
                                        // label="Varient Price"
                                        margin="normal"
                                        name={`productData[${index}].discount_type`}
                                        onChange={handleChange}
                                        type="number"
                                        value={
                                          values.productData[index]
                                            .discount_type
                                        }
                                        variant="outlined"
                                      >
                                        {discountTypes.map(discountType => {
                                          return (
                                            <MenuItem
                                              key={discountType.key}
                                              value={discountType.key}
                                            >
                                              {discountType.name}
                                            </MenuItem>
                                          );
                                        })}
                                      </Select>
                                    </FormControl>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : null}
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
                            Update FlashDeal
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
    ) : null;
  return page;
};

export default EditFlashDeal;
