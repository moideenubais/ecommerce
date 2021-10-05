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
  },
  uploadBigImage: {
    height: '100px',
    margin: '10px'
  }
}));

const EditCategory = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [categoryData, setCategoryData] = useState(null);
  const [bannerImageFile, setBannerImage] = useState(null);
  const [iconImageFile, setIconImage] = useState(null);
  const [services, getServices] = useState([]);
  //   const [editorState, getEditorState] = useState(EditorState.createEmpty());
  const [categories, getCategories] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);

  //   const [categories, getCategories] = useState([]);
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
    getSingleCategory();
    getAllCategories();
    // getAllCategories();
  }, []);

  const getSingleCategory = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/category/' + id)
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const categoryData = response.data;
        // const html = categoryData.description || '';
        // const contentBlock = htmlToDraft(html);
        // if (contentBlock) {
        //   const contentState = ContentState.createFromBlockArray(
        //     contentBlock.contentBlocks
        //   );
        //   let editorState = EditorState.createWithContent(contentState);
        //   getEditorState(editorState);
        // }
        setCategoryData(categoryData);
        setBannerImage(CONSTANTS.BASE_URL + categoryData.banner_url);
        setIconImage(CONSTANTS.BASE_URL + categoryData.icon_url);
        // setImage(CONSTANTS.BASE_URL+categoryData.imageUrl);
        //   getBills(allBills);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllCategories = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/category', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        //   console.log("service data",response.data);
        const allCategories = response.data.categories;
        getCategories(allCategories);
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

  let page = categoryData ? (
    // <Page className={classes.root} title="Category Update">
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
              parentId: categoryData.parentId,
              resourceBundle: categoryData.resourceBundle,
              tab: 0
            }}
            validationSchema={Yup.object().shape({
              parentId: Yup.string(),
              resourceBundle: Yup.array().of(
                Yup.object().shape({
                  name: Yup.string()
                    .max(255)
                    .required('Category Name required'),
                  // category_description: Yup.string(),
                  languageCode: Yup.string()
                    .max(255)
                    .required('Language required')
                })
              )
            })}
            onSubmit={values => {
              //   let data = {};
              let data = new FormData();
              if (!isEmpty(values.parentId))
                data.append('parentId', values.parentId);
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
              if (!isUndefined(values.banner_url))
                data.append('category_banner', values.banner_url);
              if (!isUndefined(values.icon_url))
                data.append('category_icon', values.icon_url);

              //   data.resourceBundle = values.resourceBundle;
              axios
                .put(
                  CONSTANTS.BASE_URL + 'api/category/' + categoryData._id,
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
                      title="Update Category"
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
                                      label="Category Name"
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
                      <FormControl
                        fullWidth
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="demo-simple-select-outlined-label">
                          Parent Category
                        </InputLabel>
                        <Select
                          fullWidth
                          labelId="demo-simple-select-outlined-label"
                          id="demo-simple-select-outlined"
                          name="parentId"
                          value={values.parentId}
                          onChange={handleChange}
                          label="Parent Category"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {categories.map(category => {
                            return (
                              <MenuItem key={category._id} value={category._id}>
                                {category.i18nResourceBundle.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      {/* <Button variant="contained" component="label">
                        Change Banner Image
                        <input
                          type="file"
                          name="banner_url"
                          onChange={event => {
                            setBannerImage(
                              URL.createObjectURL(event.target.files[0])
                            );
                            formProps.setFieldValue(
                              'banner_url',
                              event.target.files[0]
                            );
                          }}
                          hidden
                        />
                      </Button>
                      <Box marginTop="10px" marginBottom="10px">
                        <Image
                          src={bannerImageFile}
                          aspectRatio={9 / 3}
                          alt="uploaded Banner Image"
                          name="imageSource"
                        />
                      </Box> */}
                      <Box mt={2}>
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
                              setBannerImage(fileArray[0]);
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
                            Change Banner Image
                          </Button>
                        </label>
                      </Box>
                      {bannerImageFile && (
                        <div> {getImages([bannerImageFile])}</div>
                      )}
                      {/* <Button variant="contained" component="label">
                        Change Icon Image
                        <input
                          type="file"
                          name="icon_url"
                          onChange={(event) => {
                            setIconImage(
                              URL.createObjectURL(event.target.files[0])
                            );
                            formProps.setFieldValue(
                              "icon_url",
                              event.target.files[0]
                            );
                          }}
                          hidden
                        />
                      </Button>
                      <Box marginTop="10px" marginBottom="10px">
                        <Image
                          src={iconImageFile}
                          aspectRatio={9 / 3}
                          alt="uploaded Icon Image"
                          name="imageSource"
                        />
                      </Box> */}
                      <Box mt={2}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="icon_url"
                          type="file"
                          name="icon_url"
                          onChange={event => {
                            if (event.target.files) {
                              let fileArray = Array.from(
                                event.target.files
                              ).map(file => URL.createObjectURL(file));
                              setIconImage(fileArray[0]);
                              formProps.setFieldValue(
                                'icon_url',
                                event.target.files[0]
                              );
                            }
                          }}
                        />
                        <label htmlFor="icon_url">
                          <Button
                            variant="contained"
                            color="primary"
                            component="span"
                          >
                            Change Icon Image
                          </Button>
                        </label>
                      </Box>
                      {iconImageFile && (
                        <div> {getImages([iconImageFile])}</div>
                      )}
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
                          Update Category
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

export default EditCategory;
