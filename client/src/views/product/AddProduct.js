import React, { useEffect, useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import axios from 'axios';
import Image from 'material-ui-image';
import Autocomplete from '@material-ui/lab/Autocomplete';
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
  Switch,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from '@material-ui/core';
import AuthContext from 'src/context/auth-context';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Page from 'src/components/Page';
import { isEmpty, cloneDeep, rest } from 'lodash';
import Spinner from '../../components/Spinner';
import TabPanel from 'src/components/TabPanel';

// import colors from './colors';
// import attributes from './attributes';
import countries from './country';

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

const isNumberEmpty = value => {
  return value == null || value === '' || value === undefined;
};

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
    height: '50px',
    marginRight: '10px',
    marginLeft: '10px'
  },
  richEditor: {
    border: '1px #d0c0c0 solid',
    margin: '10px 0px'
  },
  formControl: {
    // margin: theme.spacing(1),
    width: '100%'
  },
  wrapIcon: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  uploadBigImage: {
    height: '100px',
    margin: '10px'
  }
}));

function getStyles(name, personName, theme, cons) {
  console.log(`in ... color ${cons}`, name, '\ncolorArray', personName);
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium
  };
}

const AddProduct = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [bannerImageFile, setBannerImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [colors, setColors] = useState(null);
  const [attributes, setAttributes] = useState(null);
  const [categories, getCategories] = useState(null);
  const [brands, getBrands] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);
  const [bigImageFiles, setBigImageFiles] = useState(null);
  const [smallImageFile, setSmallImageFile] = useState(null);
  const [flashs, setFlashs] = useState(null);
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  const getImages = images => {
    return images.map((image, index) => (
      <img className={classes.uploadBigImage} src={image} key={index + image} />
    ));
  };

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
  useEffect(() => {
    // getAllProducts();
    getAllCategories();
    getAllColors();
    getAllAttributes();
    getAllBrands();
    getAllFlashs();
  }, []);

  const getLanguageLabel = key => {
    return languages.filter(language => language.key === key)[0].label;
  };

  const getAllColors = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/color', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allColors = response.data.colors;
        setColors(allColors);
      })
      .catch(error => {
        setColors([]);
        console.log(error);
      });
  };

  const getAllAttributes = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/attribute', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allAttributes = response.data.attributes;
        setAttributes(allAttributes);
      })
      .catch(error => {
        setAttributes([]);
        console.log(error);
      });
  };

  const getAllCategories = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/category', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allCategories = response.data.categories;
        getCategories(allCategories);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllBrands = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/brand', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allBrands = response.data.brands;
        getBrands(allBrands);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllFlashs = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/flash', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        const allFlashs = response.data.flashs;
        if (!isEmpty(allFlashs)) setFlashs(allFlashs);
        else setFlashs([]);
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

  const discountTypes = [
    { key: 'flat', name: 'Flat' },
    { key: 'percentage', name: 'Percentage' }
  ];
  let varientsArray = [];

  function product() {
    var args = Array.prototype.slice.call(arguments);
    return args.reduce(
      function tl(accumulator, value) {
        var tmp = [];
        accumulator.forEach(function(a0) {
          value.forEach(function(a1) {
            tmp.push(a0.concat(a1));
          });
        });
        return tmp;
      },
      [[]]
    );
  }

  const getColorLabels = colorsArray => {
    return colorsArray.map(singleColor => {
      let currentColor = colors.find(color => {
        return color._id == singleColor;
      });
      return currentColor.i18nResourceBundle.name;
    });
  };

  const getValueObjectLabels = valueObj => {
    return valueObj.map(obj => {
      const key = Object.keys(obj)[0]; //This is the id of the attribute
      const currentAttributeName = attributes.find(attr => attr._id === key)
        .i18nResourceBundle.name;
      return { [currentAttributeName]: obj[key] };
    });
  };

  const getAllVarients = (colors, valueObject) => {
    let attributes = cloneDeep(valueObject);
    let totalArray = [];
    if (!isEmpty(attributes)) {
      attributes = getValueObjectLabels(attributes);
      console.log('getValueObjectLabels', attributes);
    }
    if (!isEmpty(colors)) attributes.push({ Color: getColorLabels(colors) });
    let keys = attributes.map(attr => Object.keys(attr)[0]);
    console.log('keys', keys, attributes);
    attributes.forEach(attributeObject => {
      console.log('ob', attributeObject);
      let attributeArray = Object.keys(attributeObject).map(
        k => attributeObject[k]
      );
      console.log('attrubitearray', attributeArray[0]);
      if (!isEmpty(attributeArray[0])) {
        totalArray.push(attributeArray[0]);
      }
    });

    let varientArray = product(...totalArray);
    console.log('varient array', varientArray, totalArray);
    if (!isEmpty(totalArray)) {
      varientArray = varientArray.map(varient => {
        return varient.reduce((varientText, varientValue, index) => {
          return isEmpty(varientText)
            ? varientText + keys[index] + ':' + varientValue
            : varientText + '-' + keys[index] + ':' + varientValue;
        }, '');
      });
      varientsArray = varientArray;
      return varientArray;
    }
    return [];
  };

  const getUpdatedValueObject = (valueObject, index, attributeId, value) => {
    valueObject[index][attributeId] = value;
    return valueObject;
  };

  const getUpdatedColor = (colorArray, value) => {
    console.log('coming value', value);
    let finalArray = colorArray;
    value.forEach(singleValue => {
      if (colorArray.indexOf(singleValue) === -1) finalArray.push(singleValue);
    });
    return finalArray;
  };

  const getUpdatedValueObjectForAttribute = (
    valueObject,
    // attributes,
    newAttribute
  ) => {
    let finalValueObject = [];
    // let finalAttributArray = attributes;
    let finalAttributArray = newAttribute;
    console.log(
      'from getUpdatedValueObjectForAttribute',
      attributes,
      '\n new one',
      newAttribute
    );
    // newAttribute.forEach(singleValue => {
    //   if (attributes.indexOf(singleValue) === -1)
    //     finalAttributArray.push(singleValue);
    // });
    console.log('first lein', finalValueObject, finalAttributArray);
    finalAttributArray.forEach(attribute => {
      if (!isEmpty(valueObject)) {
        const existsInValueObject = valueObject.find(
          valueObj => Object.keys(valueObj)[0] === attribute
        );
        if (existsInValueObject) finalValueObject.push(existsInValueObject);
        else finalValueObject.push({ [attribute]: [] });
        // valueObject.forEach(valueObj => {
        //   if (Object.keys(valueObj)[0] == attribute) return;
        //   finalValueObject.push({ [attribute]: [] });
        // });
      } else {
        finalValueObject.push({ [attribute]: [] });
      }
    });
    console.log('finalvalueObject', finalValueObject);
    return finalValueObject;
  };

  const getAttributeName = attributeId => {
    return attributes.find(attribute => attribute._id == attributeId)
      .i18nResourceBundle.name;
  };
  const getUpdatedVarients = (varientsObject, varientArray) => {
    const finalArray = [];
    varientArray.forEach(singleVarient => {
      if (!isEmpty(varientsObject)) {
        const varientExist = varientsObject.find(
          varient => varient.varient_value === singleVarient
        );
        if (varientExist)
          finalArray.push({
            varient_value: varientExist.varient_value,
            quantity: varientExist.quantity,
            sku: varientExist.sku,
            unit_price: varientExist.unit_price
          });
        else
          finalArray.push({
            varient_value: singleVarient,
            quantity: 10,
            sku: '',
            unit_price: 0
          });
      } else {
        finalArray.push({
          varient_value: singleVarient,
          quantity: 10,
          sku: '',
          unit_price: 0
        });
      }
    });
    return finalArray;
  };

  const page = categories && flashs && colors && attributes && (
    <Page className={classes.root} title="Add Product">
      <Container maxWidth="lg">
        <Formik
          initialValues={{
            language: 'en',
            category_id: categories[0]['_id'],
            brand_id: '',
            unit: '',
            minimum_purchase_quantity: '',
            tags: '',
            colorArray: [],
            attributeArray: [],
            valueObject: [],
            unit_price: 0,
            quantity: 0,
            sku: '',
            hasDiscount: false,
            discount: '',
            discount_type: 'flat',
            discount_date_from: new Date(),
            discount_date_to: new Date(),
            varients: [],
            flat_rate: false,
            free_shipping: true,
            shipping_cost: 0,
            product_quantity_multiply: false,
            todays_deal: false,
            stock_visible: true,
            low_stock_warning: 1,
            cash_on_delivery: true,
            publish: false,
            featured: false,
            flash: { flash_id: '', discount_amount: '', discount_type: '' },
            // todays_deal: false,

            product_image_big_url: [],
            product_image_small_url: '',
            product_video_url: '',
            icon_url: '',
            resourceBundle: [
              {
                languageCode: 'en',
                name: '',
                description: '',
                modal_name: '',
                manufactured_by: '',
                manufacturing_country: ''
              }
            ],
            tab: 0
          }}
          validationSchema={Yup.object().shape({
            hasDiscount: Yup.boolean(),
            category_id: Yup.string().required('Category Required'),
            unit_price: Yup.number().required('Unit Price Required'),
            discount_date_from: Yup.date().when('hasDiscount', {
              is: true,
              then: Yup.date().min(
                new Date(),
                'Start date shoud be greater than now'
              )
            }),
            // quantity: Yup.number().required("Quantity Required"),
            resourceBundle: Yup.array().of(
              Yup.object().shape({
                name: Yup.string()
                  .max(255)
                  .required('Product Name required'),
                category_description: Yup.string()
                // languageCode: Yup.string()
                //   .max(255)
                //   .required("Language required"),
              })
            )
          })}
          onSubmit={values => {
            console.log('final values', values);
            let data = new FormData();
            values.resourceBundle.forEach((resource, index) => {
              data.append(
                'resourceBundle[' + index + '][languageCode]',
                resource.languageCode
              );
              data.append('resourceBundle[' + index + '][name]', resource.name);
              if (!isEmpty(resource.description))
                data.append(
                  'resourceBundle[' + index + '][description]',
                  resource.description
                );
              if (!isEmpty(resource.modal_name))
                data.append(
                  'resourceBundle[' + index + '][modal_name]',
                  resource.modal_name
                );
              if (!isEmpty(resource.manufactured_by))
                data.append(
                  'resourceBundle[' + index + '][manufactured_by]',
                  resource.manufactured_by
                );
              if (!isEmpty(resource.manufacturing_country))
                data.append(
                  'resourceBundle[' + index + '][manufacturing_country]',
                  resource.manufacturing_country
                );
            });

            if (!isEmpty(values.varients)) {
              values.varients.forEach((varient, index) => {
                data.append(
                  'prices[' + index + '][varient_value]',
                  varient.varient_value
                );
                let unit_price = varient.unit_price;
                if (isNumberEmpty(unit_price) || unit_price === 0)
                  unit_price = values.unit_price;
                data.append('prices[' + index + '][unit_price]', unit_price);
                data.append(
                  'prices[' + index + '][quantity]',
                  varient.quantity
                );
                if (!isEmpty(varient.sku))
                  data.append('prices[' + index + '][sku]', varient.sku);
                if (values.hasDiscount) {
                  if (!isEmpty(values.discount_type))
                    data.append(
                      'prices[' + index + '][discount_type]',
                      values.discount_type
                    );
                  if (!isNumberEmpty(values.discount) && values.discount !== 0)
                    data.append(
                      'prices[' + index + '][discount_amount]',
                      values.discount
                    );
                  data.append(
                    'prices[' + index + '][discount_range][from]',
                    values.discount_date_from
                  );
                  data.append(
                    'prices[' + index + '][discount_range][to]',
                    values.discount_date_to
                  );
                }
              });
            } else {
              data.append('prices[0][varient_value]', 'default');
              data.append('prices[0][unit_price]', values.unit_price);
              data.append('prices[0][quantity]', values.quantity);
              if (!isEmpty(values.sku))
                data.append('prices[0][sku]', values.sku);
              if (!isEmpty(values.discount_type))
                if (values.hasDiscount && values.discount) {
                  if (!isEmpty(values.discount_type))
                    data.append(
                      'prices[0][discount_type]',
                      values.discount_type
                    );
                  if (!isNumberEmpty(values.discount) && values.discount !== 0)
                    data.append('prices[0][discount_amount]', values.discount);
                  data.append(
                    'prices[0][discount_range][from]',
                    values.discount_date_from
                  );
                  data.append(
                    'prices[0][discount_range][to]',
                    values.discount_date_to
                  );
                }
            }

            data.append('category_id', values.category_id);
            if (!isEmpty(values.brand_id))
              data.append('brand_id', values.brand_id);
            if (
              !isNumberEmpty(values.minimum_purchase_quantity) &&
              values.minimum_purchase_quantity !== 0
            )
              data.append(
                'minimum_purchase_quantity',
                values.minimum_purchase_quantity
              );
            if (!isEmpty(values.tags)) data.append('tags', values.tags);
            if (!isEmpty(values.colorArray)) {
              Array.from(values.colorArray).forEach((color, index) => {
                data.append(`color_array[${index}]`, color);
              });
            }
            if (!isEmpty(values.attributeArray)) {
              Array.from(values.attributeArray).forEach((attr, index) => {
                data.append(`attribute_array[${index}]`, attr);
              });
            }
            //valueObject=[{size:["M","L"]},{size1:["M1","L1"]}]
            if (!isEmpty(values.valueObject)) {
              Array.from(values.valueObject).forEach((obj, indexObj) => {
                let key = Object.keys(obj)[0];
                Array.from(obj[key]).forEach((val, index) => {
                  data.append(
                    `attribute_value_object[${indexObj}][${key}][${index}]`,
                    val
                  );
                });
              });
            }
            // data.append('attribute_value_object', values.valueObject);
            if (values.free_shipping) data.append('shipping_config', 'free');
            if (values.flat_rate) data.append('shipping_config', 'flat_rate');
            data.append(
              'product_quantity_multiply',
              values.product_quantity_multiply
            );
            data.append('stock_visible', values.stock_visible);
            data.append('cash_on_delivery', values.cash_on_delivery);
            data.append('featured', values.featured);
            data.append('todays_deal', values.todays_deal);
            data.append('publish', values.publish);
            if (values.flat_rate)
              data.append('shipping_cost', values.shipping_cost);
            if (!isEmpty(values.low_stock_warning))
              data.append('low_stock_warning', values.low_stock_warning);
            if (!isEmpty(values.shipping_time))
              data.append('shipping_time', values.shipping_time);

            if (
              !isEmpty(values.flash.flash_id) &&
              !isNumberEmpty(values.flash.discount_amount) &&
              !isEmpty(values.flash.discount_type)
            ) {
              data.append('flash[flash_id]', values.flash.flash_id);
              data.append(
                'flash[discount_amount]',
                values.flash.discount_amount
              );
              data.append('flash[discount_type]', values.flash.discount_type);
            }

            if (!isEmpty(values.product_video_url))
              data.append('product_video_url', values.product_video_url);

            if (!isEmpty(values.product_image_big_url))
              Array.from(values.product_image_big_url).forEach(image_url => {
                if (!isEmpty(image_url.name)) {
                  data.append('product_image_big', image_url);
                }
              });

            if (!isEmpty(values.product_image_small_url.name)) {
              data.append(
                'product_image_small',
                values.product_image_small_url
              );
            }

            axios
              .post(CONSTANTS.BASE_URL + 'api/product', data)
              .then(response => {
                // console.log(response.data);
                const bill = response.data;
                // getBills(allBills);
                navigate('/app/products/all');
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
                <Grid container spacing={2}>
                  <Grid item container direction="column" xs={12} md={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Product Information" />
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
                                        formProps.setFieldValue(
                                          'tab',
                                          newValue
                                        );
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
                                            // className={classes.formControl}
                                            margin="normal"
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
                                    </Tabs>
                                    {resourceBundle.map((resource, index) => {
                                      return (
                                        <TabPanel
                                          value={values.tab}
                                          index={index}
                                        >
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? Boolean(
                                                    touched.resourceBundle[
                                                      index
                                                    ].name &&
                                                      errors.resourceBundle[
                                                        index
                                                      ].name
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
                                                  errors.resourceBundle[index]
                                                    .name
                                                : null
                                            }
                                            label="Product Name*"
                                            margin="normal"
                                            name={`resourceBundle[${index}].name`}
                                            onChange={handleChange}
                                            type="text"
                                            value={
                                              values.resourceBundle[index].name
                                            }
                                            variant="outlined"
                                          />
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? Boolean(
                                                    touched.resourceBundle[
                                                      index
                                                    ].modal_name &&
                                                      errors.resourceBundle[
                                                        index
                                                      ].modal_name
                                                  )
                                                : false
                                            }
                                            helperText={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? touched.resourceBundle[index]
                                                    .modal_name &&
                                                  errors.resourceBundle[index]
                                                    .modal_name
                                                : null
                                            }
                                            label="Modal Name"
                                            margin="normal"
                                            name={`resourceBundle[${index}].modal_name`}
                                            onChange={handleChange}
                                            type="text"
                                            value={
                                              values.resourceBundle[index]
                                                .modal_name
                                            }
                                            variant="outlined"
                                          />
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? Boolean(
                                                    touched.resourceBundle[
                                                      index
                                                    ].manufactured_by &&
                                                      errors.resourceBundle[
                                                        index
                                                      ].manufactured_by
                                                  )
                                                : false
                                            }
                                            helperText={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? touched.resourceBundle[index]
                                                    .manufactured_by &&
                                                  errors.resourceBundle[index]
                                                    .manufactured_by
                                                : null
                                            }
                                            label="Manufactured By"
                                            margin="normal"
                                            name={`resourceBundle[${index}].manufactured_by`}
                                            onChange={handleChange}
                                            type="text"
                                            value={
                                              values.resourceBundle[index]
                                                .manufactured_by
                                            }
                                            variant="outlined"
                                          />
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? Boolean(
                                                    touched.resourceBundle[
                                                      index
                                                    ].description &&
                                                      errors.resourceBundle[
                                                        index
                                                      ].description
                                                  )
                                                : false
                                            }
                                            helperText={
                                              touched.resourceBundle &&
                                              errors.resourceBundle &&
                                              touched.resourceBundle[index] &&
                                              errors.resourceBundle[index]
                                                ? touched.resourceBundle[index]
                                                    .description &&
                                                  errors.resourceBundle[index]
                                                    .description
                                                : null
                                            }
                                            label="Description"
                                            margin="normal"
                                            name={`resourceBundle[${index}].description`}
                                            onChange={handleChange}
                                            type="text"
                                            value={
                                              values.resourceBundle[index]
                                                .description
                                            }
                                            variant="outlined"
                                          />

                                          <Autocomplete
                                            id="combo-box-demo"
                                            options={countries}
                                            getOptionLabel={option =>
                                              option.label
                                            }
                                            renderInput={params => (
                                              <TextField
                                                {...params}
                                                label="Manufacturing Country"
                                                variant="outlined"
                                                error={
                                                  touched.resourceBundle &&
                                                  errors.resourceBundle &&
                                                  touched.resourceBundle[
                                                    index
                                                  ] &&
                                                  errors.resourceBundle[index]
                                                    ? Boolean(
                                                        touched.resourceBundle[
                                                          index
                                                        ]
                                                          .manufacturing_country &&
                                                          errors.resourceBundle[
                                                            index
                                                          ]
                                                            .manufacturing_country
                                                      )
                                                    : false
                                                }
                                                helperText={
                                                  touched.resourceBundle &&
                                                  errors.resourceBundle &&
                                                  touched.resourceBundle[
                                                    index
                                                  ] &&
                                                  errors.resourceBundle[index]
                                                    ? touched.resourceBundle[
                                                        index
                                                      ].manufacturing_country &&
                                                      errors.resourceBundle[
                                                        index
                                                      ].manufacturing_country
                                                    : null
                                                }
                                                margin="normal"
                                                name={`resourceBundle[${index}].manufacturing_country`}
                                                onChange={handleChange}
                                                type="text"
                                                value={
                                                  values.resourceBundle[index]
                                                    .manufacturing_country
                                                }
                                              />
                                            )}
                                          />
                                        </TabPanel>
                                      );
                                    })}
                                  </>
                                );
                              }}
                            </FieldArray>
                            <FormControl
                              fullWidth
                              variant="outlined"
                              // className={classes.formControl}
                              margin="normal"
                            >
                              <InputLabel id="category_id_label">
                                Category*
                              </InputLabel>
                              <Select
                                fullWidth
                                error={Boolean(
                                  touched.category_id && errors.category_id
                                )}
                                helperText={
                                  touched.category_id && errors.category_id
                                }
                                margin="normal"
                                variant="outlined"
                                labelId="category_id_label"
                                id="category_id"
                                name="category_id"
                                value={values.category_id}
                                onChange={handleChange}
                                label="Category"
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {categories.map(category => {
                                  return (
                                    <MenuItem
                                      key={category._id}
                                      value={category._id}
                                    >
                                      {category.i18nResourceBundle.name}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                            <FormControl
                              fullWidth
                              variant="outlined"
                              // className={classes.formControl}
                              margin="normal"
                            >
                              <InputLabel id="brand_id_label">Brand</InputLabel>
                              <Select
                                fullWidth
                                error={Boolean(
                                  touched.brand_id && errors.brand_id
                                )}
                                helperText={touched.brand_id && errors.brand_id}
                                margin="normal"
                                variant="outlined"
                                labelId="brand_id_label"
                                id="brand_id"
                                name="brand_id"
                                value={values.brand_id}
                                onChange={handleChange}
                                label="Brand"
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {brands.map(brand => {
                                  return (
                                    <MenuItem key={brand._id} value={brand._id}>
                                      {brand.i18nResourceBundle.name}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                            <TextField
                              fullWidth
                              error={Boolean(touched.unit && errors.unit)}
                              helperText={touched.unit && errors.unit}
                              label="Unit"
                              margin="normal"
                              name="unit"
                              onChange={handleChange}
                              type="text"
                              value={values.unit}
                              variant="outlined"
                            />
                            <TextField
                              fullWidth
                              error={Boolean(
                                touched.minimum_purchase_quantity &&
                                  errors.minimum_purchase_quantity
                              )}
                              helperText={
                                touched.minimum_purchase_quantity &&
                                errors.minimum_purchase_quantity
                              }
                              label="Minimum Purchase Quantity"
                              margin="normal"
                              name="minimum_purchase_quantity"
                              onChange={handleChange}
                              type="number"
                              value={values.minimum_purchase_quantity}
                              variant="outlined"
                            />
                            <TextField
                              fullWidth
                              error={Boolean(touched.tags && errors.tags)}
                              helperText={touched.tags && errors.tags}
                              label="Tags"
                              margin="normal"
                              name="tags"
                              onChange={handleChange}
                              type="text"
                              value={values.tags}
                              variant="outlined"
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Product Images" />
                          <Divider />
                          <CardContent>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="contained-button-file"
                              multiple
                              type="file"
                              name="product_image_big_url"
                              onChange={event => {
                                if (event.target.files) {
                                  let fileArray = Array.from(
                                    event.target.files
                                  ).map(file => URL.createObjectURL(file));
                                  setBigImageFiles(fileArray);
                                  formProps.setFieldValue(
                                    'product_image_big_url',
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
                                Upload Gallary Image &#40; 600x600 &#41;
                              </Button>
                            </label>
                            {bigImageFiles && (
                              <div> {getImages(bigImageFiles)}</div>
                            )}

                            <Box mt={2}>
                              <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="product_image_small_url"
                                type="file"
                                name="product_image_small_url"
                                onChange={event => {
                                  if (event.target.files) {
                                    let fileArray = Array.from(
                                      event.target.files
                                    ).map(file => URL.createObjectURL(file));
                                    setSmallImageFile(fileArray[0]);
                                    formProps.setFieldValue(
                                      'product_image_small_url',
                                      event.target.files[0]
                                    );
                                  }
                                }}
                              />
                              <label htmlFor="product_image_small_url">
                                <Button
                                  variant="contained"
                                  color="primary"
                                  component="span"
                                >
                                  Upload Thumbnail Image &#40; 300x300 &#41;
                                </Button>
                              </label>
                            </Box>
                            {smallImageFile && (
                              <div> {getImages([smallImageFile])}</div>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Product Video" />
                          <Divider />
                          <CardContent>
                            <TextField
                              fullWidth
                              error={Boolean(
                                touched.product_video_url &&
                                  errors.product_video_url
                              )}
                              helperText={
                                touched.product_video_url &&
                                errors.product_video_url
                              }
                              label="Video URL"
                              margin="normal"
                              name="product_video_url"
                              onChange={handleChange}
                              type="text"
                              value={values.product_video_url}
                              variant="outlined"
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Product Variations" />
                          <Divider />
                          <CardContent>
                            <FormControl
                              className={classes.formControl}
                              margin="normal"
                            >
                              <InputLabel id="demo-mutiple-name-label">
                                Color
                              </InputLabel>
                              <Select
                                labelId="demo-mutiple-name-label"
                                id="demo-mutiple-name"
                                multiple
                                value={values.colorArray}
                                onChange={event => {
                                  formProps.setFieldValue(
                                    'colorArray',
                                    event.target.value
                                  );
                                  let updatedColor =
                                    //  getUpdatedColor(
                                    // values.colorArray,
                                    event.target.value;
                                  // );
                                  let varients = getAllVarients(
                                    updatedColor,
                                    values.valueObject
                                  );
                                  // console.log(
                                  //   'in color',
                                  //   varients,
                                  //   updatedColor,
                                  //   values.valueObject
                                  // );
                                  let updatedVarients = getUpdatedVarients(
                                    values.varients,
                                    varients
                                  );
                                  formProps.setFieldValue(
                                    'varients',
                                    updatedVarients
                                    // varients.map(varient => {
                                    //   return {
                                    //     varient_value: varient,
                                    //     quantity: 10,
                                    //     sku: '',
                                    //     unit_price: 0
                                    //   };
                                    // })
                                  );
                                }}
                                input={<Input />}
                                MenuProps={MenuProps}
                              >
                                {colors.map(color => (
                                  <MenuItem
                                    key={color._id}
                                    value={color._id}
                                    style={getStyles(
                                      color._id,
                                      values.colorArray,
                                      theme,
                                      'in color'
                                    )}
                                  >
                                    {color.i18nResourceBundle.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl
                              className={classes.formControl}
                              margin="normal"
                            >
                              <InputLabel id="demo-mutiple-name-label">
                                Attribute
                              </InputLabel>
                              <Select
                                labelId="demo-mutiple-name-label"
                                id="demo-mutiple-name"
                                multiple
                                value={values.attributeArray}
                                onChange={event => {
                                  formProps.setFieldValue(
                                    'attributeArray',
                                    event.target.value
                                  );
                                  let updatedValueObject = getUpdatedValueObjectForAttribute(
                                    values.valueObject,
                                    // values.attributeArray,
                                    event.target.value
                                  );
                                  formProps.setFieldValue(
                                    'valueObject',
                                    updatedValueObject
                                  );
                                  let varients = getAllVarients(
                                    values.colorArray,
                                    updatedValueObject
                                  );
                                  let updatedVarients = getUpdatedVarients(
                                    values.varients,
                                    varients
                                  );
                                  formProps.setFieldValue(
                                    'varients',
                                    updatedVarients
                                    // getAllVarients(
                                    //   values.colorArray,
                                    //   updatedValueObject
                                    // ).map(varient => {
                                    //   return {
                                    //     varient_value: varient,
                                    //     quantity: 10,
                                    //     sku: '',
                                    //     unit_price: 0
                                    //   };
                                    // })
                                  );
                                  console.log(
                                    'sdjvlsdjlksjdflksdlkslk',
                                    updatedValueObject
                                  );
                                }}
                                input={<Input />}
                                MenuProps={MenuProps}
                              >
                                {attributes.map(attribute => (
                                  <MenuItem
                                    key={attribute._id}
                                    value={attribute._id}
                                    style={getStyles(
                                      attribute._id,
                                      values.attributeArray,
                                      theme,
                                      'in attribute'
                                    )}
                                  >
                                    {attribute.i18nResourceBundle.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            {!isEmpty(values.valueObject)
                              ? values.valueObject.map((attribute, index) => {
                                  const attributeId = Object.keys(attribute)[0];
                                  const attributeName = getAttributeName(
                                    attributeId
                                  );
                                  let currentAttributeObject = attributes.find(
                                    attr => attr._id == attributeId
                                  );
                                  return (
                                    <FormControl
                                      key={
                                        index +
                                        values.valueObject[index][attributeId]
                                      }
                                      className={classes.formControl}
                                      margin="normal"
                                    >
                                      <InputLabel id="demo-mutiple-name-label">
                                        {attributeName}
                                      </InputLabel>
                                      <Select
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        multiple
                                        value={
                                          values.valueObject[index][attributeId]
                                        }
                                        onChange={event => {
                                          formProps.setFieldValue(
                                            `valueObject[${index}].${attributeId}`,
                                            event.target.value
                                          );
                                          let updatedValueObject = getUpdatedValueObject(
                                            values.valueObject,
                                            index,
                                            attributeId,
                                            event.target.value
                                          );
                                          let varients = getAllVarients(
                                            values.colorArray,
                                            updatedValueObject
                                          );
                                          // console.log(
                                          //   'in attr',
                                          //   varients,
                                          //   updatedValueObject,
                                          //   values.colorArray
                                          // );
                                          let updatedVarients = getUpdatedVarients(
                                            values.varients,
                                            varients
                                          );
                                          formProps.setFieldValue(
                                            'varients',
                                            updatedVarients
                                            // varients.map(varient => {
                                            //   return {
                                            //     varient_value: varient,
                                            //     quantity: 10,
                                            //     sku: '',
                                            //     unit_price: 0
                                            //   };
                                            // })
                                          );
                                        }}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                      >
                                        {currentAttributeObject.values.map(
                                          (name, indexValue) => (
                                            <MenuItem
                                              key={name + indexValue}
                                              value={name}
                                              style={getStyles(
                                                name,
                                                values.valueObject[index][
                                                  attributeId
                                                ],
                                                theme,
                                                'per attribute'
                                              )}
                                            >
                                              {name}
                                            </MenuItem>
                                          )
                                        )}
                                      </Select>
                                    </FormControl>
                                  );
                                })
                              : null}
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Product price + stock" />
                          <Divider />
                          <CardContent>
                            <TextField
                              fullWidth
                              error={Boolean(
                                touched.unit_price && errors.unit_price
                              )}
                              helperText={
                                touched.unit_price && errors.unit_price
                              }
                              label="Unit Price*"
                              margin="normal"
                              name="unit_price"
                              onChange={handleChange}
                              type="number"
                              value={values.unit_price}
                              variant="outlined"
                            />
                            {isEmpty(values.varients) ? (
                              <>
                                <TextField
                                  fullWidth
                                  error={Boolean(
                                    touched.quantity && errors.quantity
                                  )}
                                  helperText={
                                    touched.quantity && errors.quantity
                                  }
                                  label="Quantity"
                                  margin="normal"
                                  name="quantity"
                                  onChange={handleChange}
                                  type="number"
                                  value={values.quantity}
                                  variant="outlined"
                                />
                                <TextField
                                  fullWidth
                                  error={Boolean(touched.sku && errors.sku)}
                                  helperText={touched.sku && errors.sku}
                                  label="SKU"
                                  margin="normal"
                                  name="sku"
                                  onChange={handleChange}
                                  type="text"
                                  value={values.sku}
                                  variant="outlined"
                                />
                              </>
                            ) : null}

                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Add Discount</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.hasDiscount}
                                  onChange={event => {
                                    formProps.setFieldValue(
                                      'hasDiscount',
                                      event.target.checked
                                    );
                                  }}
                                  name="checkedDiscount"
                                />
                              </Grid>
                            </Grid>

                            {values.hasDiscount ? (
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    error={Boolean(
                                      touched.discount && errors.discount
                                    )}
                                    helperText={
                                      touched.discount && errors.discount
                                    }
                                    label="Discount"
                                    margin="normal"
                                    name="discount"
                                    onChange={handleChange}
                                    type="number"
                                    value={values.discount}
                                    variant="outlined"
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <FormControl
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    // className={classes.formControl}
                                  >
                                    <InputLabel id="discount_type_label">
                                      Discount Type
                                    </InputLabel>
                                    <Select
                                      fullWidth
                                      error={Boolean(
                                        touched.discount_type &&
                                          errors.discount_type
                                      )}
                                      helperText={
                                        touched.discount_type &&
                                        errors.discount_type
                                      }
                                      margin="normal"
                                      variant="outlined"
                                      labelId="discount_type_label"
                                      id="discount_type"
                                      name="discount_type"
                                      value={values.discount_type}
                                      onChange={handleChange}
                                      label="Discount Type"
                                    >
                                      <MenuItem value="">
                                        <em>None</em>
                                      </MenuItem>
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
                                </Grid>
                                <Grid item xs={6}>
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <DateTimePicker
                                      label="Discount Start Date"
                                      name="discount_date_from"
                                      autoOk={true}
                                      disableToolbar
                                      error={Boolean(
                                        touched.discount_date_from &&
                                          errors.discount_date_from
                                      )}
                                      helperText={
                                        touched.discount_date_from &&
                                        errors.discount_date_from
                                      }
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
                                      label="Discount End Date"
                                      error={Boolean(
                                        touched.discount_date_to &&
                                          errors.discount_date_to
                                      )}
                                      helperText={
                                        touched.discount_date_to &&
                                        errors.discount_date_to
                                      }
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
                            ) : null}
                            {!isEmpty(values.varients) && (
                              <Table style={{ marginTop: '1rem' }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{ textAlign: 'center' }}>
                                      Varient
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                      Varient Price
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                      SKU
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                      Quantity
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {values.varients.map((varient, index) => {
                                    return (
                                      <TableRow
                                        hover
                                        key={index + varient.varient_value}
                                      >
                                        <TableCell
                                          style={{ textAlign: 'center' }}
                                        >
                                          {varient.varient_value}
                                        </TableCell>
                                        <TableCell>
                                          {console.log(
                                            'error',
                                            touched,
                                            errors
                                          )}
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.varients &&
                                              errors.varients &&
                                              touched.varients[index] &&
                                              errors.varients[index]
                                                ? Boolean(
                                                    touched.varients[index]
                                                      .unit_price &&
                                                      errors.varients[index]
                                                        .unit_price
                                                  )
                                                : false
                                            }
                                            helperText={
                                              touched.varients &&
                                              errors.varients &&
                                              touched.varients[index] &&
                                              errors.varients[index]
                                                ? touched.varients[index]
                                                    .unit_price &&
                                                  errors.varients[index]
                                                    .unit_price
                                                : null
                                            }
                                            // label="Varient Price"
                                            margin="normal"
                                            name={`varients[${index}].unit_price`}
                                            onChange={handleChange}
                                            type="number"
                                            value={
                                              values.varients[index].unit_price
                                            }
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.varients &&
                                              errors.varients &&
                                              touched.varients[index] &&
                                              errors.varients[index]
                                                ? Boolean(
                                                    touched.varients[index]
                                                      .sku &&
                                                      errors.varients[index].sku
                                                  )
                                                : false
                                            }
                                            helperText={
                                              touched.varients &&
                                              errors.varients &&
                                              touched.varients[index] &&
                                              errors.varients[index]
                                                ? touched.varients[index].sku &&
                                                  errors.varients[index].sku
                                                : null
                                            }
                                            // label="SKU"
                                            margin="normal"
                                            name={`varients[${index}].sku`}
                                            onChange={handleChange}
                                            type="text"
                                            value={values.varients[index].sku}
                                            variant="outlined"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <TextField
                                            fullWidth
                                            error={
                                              touched.varients &&
                                              errors.varients &&
                                              touched.varients[index] &&
                                              errors.varients[index]
                                                ? Boolean(
                                                    touched.varients[index]
                                                      .quantity &&
                                                      errors.varients[index]
                                                        .quantity
                                                  )
                                                : false
                                            }
                                            helperText={
                                              touched.varients &&
                                              errors.varients &&
                                              touched.varients[index] &&
                                              errors.varients[index]
                                                ? touched.varients[index]
                                                    .quantity &&
                                                  errors.varients[index]
                                                    .quantity
                                                : null
                                            }
                                            // label="Quantity"
                                            margin="normal"
                                            name={`varients[${index}].quantity`}
                                            onChange={handleChange}
                                            type="number"
                                            value={
                                              values.varients[index].quantity
                                            }
                                            variant="outlined"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    container
                    direction="column"
                    // spacing={2}
                    xs={12}
                    md={4}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Shipping Configuration " />
                          <Divider />
                          <CardContent>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Free Shipping</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.free_shipping}
                                  onChange={event => {
                                    console.log(
                                      'event',
                                      event,
                                      values.free_shipping
                                    );
                                    formProps.setFieldValue(
                                      'free_shipping',
                                      event.target.checked
                                    );
                                    formProps.setFieldValue(
                                      'flat_rate',
                                      !event.target.checked
                                    );
                                    if (event.target.checked) {
                                      formProps.setFieldValue(
                                        'product_quantity_multiply',
                                        false
                                      );
                                    }
                                  }}
                                  name="checkedFreeShipping"
                                />
                              </Grid>
                            </Grid>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Flat Rate</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.flat_rate}
                                  onChange={event => {
                                    formProps.setFieldValue(
                                      'flat_rate',
                                      event.target.checked
                                    );
                                    // if (event.target.checked) {
                                    formProps.setFieldValue(
                                      'free_shipping',
                                      !event.target.checked
                                    );
                                    // }
                                  }}
                                  name="checkedFlatRate"
                                />
                              </Grid>
                            </Grid>

                            {values.flat_rate ? (
                              <Grid container justifyContent="space-between">
                                <Grid item xs={6} className={classes.wrapIcon}>
                                  <Typography>Shipping Cost</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    error={Boolean(
                                      touched.shipping_cost &&
                                        errors.shipping_cost
                                    )}
                                    helperText={
                                      touched.shipping_cost &&
                                      errors.shipping_cost
                                    }
                                    // label="Unit"
                                    margin="normal"
                                    name="shipping_cost"
                                    onChange={handleChange}
                                    type="number"
                                    value={values.shipping_cost}
                                    variant="outlined"
                                  />
                                </Grid>
                              </Grid>
                            ) : null}
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>
                                  Is Product Quantity Mulitiply
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.product_quantity_multiply}
                                  onChange={event => {
                                    if (values.flat_rate)
                                      formProps.setFieldValue(
                                        'product_quantity_multiply',
                                        event.target.checked
                                      );
                                  }}
                                  name="checkedProductQuantityMultiply"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Low Stock Quantity Warning " />
                          <Divider />
                          <CardContent>
                            <TextField
                              fullWidth
                              error={Boolean(
                                touched.low_stock_warning &&
                                  errors.low_stock_warning
                              )}
                              helperText={
                                touched.low_stock_warning &&
                                errors.low_stock_warning
                              }
                              label="Quantity"
                              margin="normal"
                              name="low_stock_warning"
                              onChange={handleChange}
                              type="number"
                              value={values.low_stock_warning}
                              variant="outlined"
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title=" Stock Visibility State" />
                          <Divider />
                          <CardContent>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Show Stock Quantity</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.stock_visible}
                                  onChange={event => {
                                    formProps.setFieldValue(
                                      'stock_visible',
                                      event.target.checked
                                    );
                                  }}
                                  name="checkedStockVisibilityState"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Cash on Delivery" />
                          <Divider />
                          <CardContent>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Status</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.cash_on_delivery}
                                  onChange={event => {
                                    formProps.setFieldValue(
                                      'cash_on_delivery',
                                      event.target.checked
                                    );
                                  }}
                                  name="checkedCashOnDelivery"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Featured" />
                          <Divider />
                          <CardContent>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Status</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.featured}
                                  onChange={event => {
                                    formProps.setFieldValue(
                                      'featured',
                                      event.target.checked
                                    );
                                  }}
                                  name="checkedFeatured"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Todays Deal" />
                          <Divider />
                          <CardContent>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={6}>
                                <Typography>Status</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Switch
                                  checked={values.todays_deal}
                                  onChange={event => {
                                    formProps.setFieldValue(
                                      'todays_deal',
                                      event.target.checked
                                    );
                                  }}
                                  name="checkedTodaysDeal"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Flash Deal" />
                          <Divider />
                          <CardContent>
                            <FormControl
                              variant="outlined"
                              className={classes.formControl}
                              margin="normal"
                            >
                              <InputLabel id="demo-simple-select-outlined-label">
                                Choose Flash Title
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                name="flash[flash_id]"
                                value={values.flash.flash_id}
                                onChange={handleChange}
                                label="Choose Flash Title"
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {flashs.map(flash => {
                                  return (
                                    <MenuItem key={flash._id} value={flash._id}>
                                      {flash.i18nResourceBundle.name}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                            <TextField
                              fullWidth
                              // error={Boolean(
                              //   touched.flash_discount && errors.flash_discount
                              // )}
                              // helperText={
                              //   touched.flash_discount && errors.flash_discount
                              // }
                              label="Discount"
                              margin="normal"
                              name="flash[discount_amount]"
                              onChange={handleChange}
                              type="number"
                              value={values.flash.discount_amount}
                              variant="outlined"
                            />
                            <FormControl
                              variant="outlined"
                              className={classes.formControl}
                              margin="normal"
                            >
                              <InputLabel id="demo-simple-select-outlined-label">
                                Choose Discount Type
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                name="flash[discount_type]"
                                value={values.flash.discount_type}
                                onChange={handleChange}
                                label="Choose Discount Type"
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
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
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card>
                          <CardHeader title="Estimate Shipping Time" />
                          <Divider />
                          <CardContent>
                            <TextField
                              fullWidth
                              error={Boolean(
                                touched.shipping_time && errors.shipping_time
                              )}
                              helperText={
                                touched.shipping_time && errors.shipping_time
                              }
                              label="Shipping Days"
                              margin="normal"
                              name="shipping_time"
                              onChange={handleChange}
                              type="number"
                              value={values.shipping_time}
                              variant="outlined"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Box
                  my={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  py={2}
                >
                  <Box>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        formProps.setFieldValue('publish', false);
                      }}
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {user.user_type === 'seller'
                        ? 'Save'
                        : 'Save and unpublish'}
                    </Button>
                    {user.user_type !== 'seller' && (
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        className={classes.buttonStyle}
                        onClick={() => {
                          formProps.setFieldValue('publish', true);
                        }}
                        disabled={isSubmitting}
                      >
                        Save and Publish
                      </Button>
                    )}
                  </Box>
                </Box>
              </form>
            </React.Fragment>
          )}
        </Formik>
      </Container>
    </Page>
  );
  return page;
};

export default AddProduct;
