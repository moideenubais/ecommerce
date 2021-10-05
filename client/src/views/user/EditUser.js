import React, { useEffect, useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
import { isEmpty, isUndefined, find } from 'lodash';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AuthContext from 'src/context/auth-context';
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
  Input,
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
  Radio,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Grid
} from '@material-ui/core';
import Page from 'src/components/Page';
import Image from 'material-ui-image';
import axios from 'axios';
import TabPanel from 'src/components/TabPanel';

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium
  };
}

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

const EditUser = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  let [userData, setUserData] = useState(null);
  const [logoImageFile, setLogoImage] = useState(null);
  // const [iconImageFile, setIconImage] = useState(null);
  const [services, getServices] = useState([]);
  //   const [editorState, getEditorState] = useState(EditorState.createEmpty());
  const [users, getUsers] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [shops, setShops] = useState(null);
  const [disabledSubmit, setDisabledSubmit] = useState(false);
  // const [roles, setRoles] = useState(null);
  const { user } = useContext(AuthContext);

  //   const [users, getUsers] = useState([]);

  const getImages = images => {
    return images.map((image, index) => (
      <img className={classes.uploadBigImage} src={image} key={index + image} />
    ));
  };
  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];
  const privileges = [
    { key: 'admin', label: 'Admin' },
    { key: 'manager', label: 'Manager' },
    { key: 'seller', label: 'Seller' },
    { key: 'delivery_boy', label: 'Delivery Boy' },
    { key: 'user', label: 'User' }
  ];

  useEffect(() => {
    getSingleUser();
    getAllShops();
    // getAllRoles();
    // getAllUsers();
    // getAllUsers();
  }, []);

  const getAllShops = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/shop', {
        params: { page: 1, limit: 10000 }
      })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.shops);
        const allShops = response.data.shops;
        if (!isEmpty(allShops)) {
          // const totalRows = response.data.info.totalNumber;
          // setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setShops(allShops);
        } else {
          setShops([]);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  // const getAllRoles = () => {
  //   axios
  //     .get(CONSTANTS.BASE_URL + 'api/role', {
  //       params: { page: 1, limit: 10000 }
  //     })
  //     .then(response => {
  //       // console.log("+++++++++++++++++++",response.data.roles);
  //       const allRoles = response.data.roles;
  //       if (!isEmpty(allRoles)) {
  //         setRoles(allRoles);
  //       } else {
  //         setRoles([]);
  //       }
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  const getSingleUser = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/user/' + id)
      .then(response => {
        console.log('get resoposldsl', response.data);
        const userData = response.data;
        // const html = userData.description || '';
        // const contentBlock = htmlToDraft(html);
        // if (contentBlock) {
        //   const contentState = ContentState.createFromBlockArray(
        //     contentBlock.contentBlocks
        //   );
        //   let editorState = EditorState.createWithContent(contentState);
        //   getEditorState(editorState);
        // }
        setUserData(userData);
        setProfileImageFile(CONSTANTS.BASE_URL + userData.image_url);
        // setIconImage(CONSTANTS.BASE_URL + userData.icon_url);
        // setImage(CONSTANTS.BASE_URL+userData.imageUrl);
        //   getBills(allBills);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // const getAllUsers = () => {
  //   axios.get(CONSTANTS.BASE_URL+'api/user',{params:{limit:1000,page:1}})
  //   .then(response => {
  //   //   console.log("service data",response.data);
  //     const allUsers = response.data.users;
  //     getUsers(allUsers);
  //   //   menu = allServices.map((service)=>{
  //   //       console.log("sdlksl",service)
  //   //       return(<MenuItem value={service._id}>{service.name}</MenuItem>)
  //   //       });
  //   })
  //   .catch(error => {
  //     console.log(error)
  //   })
  // }

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

  const isDeliveryBoy = privileges => {
    if (privileges.includes('delivery_boy')) return true;
    return false;
  };
  const isSeller = privileges => {
    if (privileges.includes('seller')) {
      if (isEmpty(shops)) setDisabledSubmit(true);
      return true;
    } else {
      setDisabledSubmit(false);
      return false;
    }
  };

  // const getRolesWithShopId = shopId => {
  //   // setRoles([]);
  //   axios
  //     .get(CONSTANTS.BASE_URL + 'api/role', {
  //       params: { page: 1, limit: 10000, shop_id: shopId }
  //     })
  //     .then(response => {
  //       // console.log("+++++++++++++++++++",response.data.roles);
  //       const allRoles = response.data.roles;
  //       if (!isEmpty(allRoles)) {
  //         setRoles(allRoles);
  //       } else {
  //         setRoles([]);
  //       }
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  // const [values,setValues] = useState({
  //   billId: '',
  //   customerName: '',
  //   mobile: '',
  //   details: ''
  // })

  let page =
    userData && shops ? (
      <Page className={classes.root} title="Update User">
        {/* <div style={{ marginTop: '10px', overflow: 'auto' }}>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      > */}
        <Container maxWidth="md">
          <Formik
            initialValues={{
              user_type: userData.user_type ? userData.user_type : 'user',
              language: userData.language,
              name: userData.name,
              email: userData.email,
              password: '',
              address: userData.address
                ? userData.address
                : { building_name: '', street: '', city: '' },
              confirm_password: '',
              // privileges: userData.privileges ? userData.privileges : [],
              // role: userData.role,
              salary: userData.salary ? userData.salary : 0,
              // shop_name: userData.shop_name?userData.shop_name:'',
              shop_id: userData.shop_id
                ? userData.shop_id
                : !isEmpty(shops)
                ? shops[0]._id
                : null
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name required'),
              email: Yup.string().required('Email required'),
              password: Yup.string().matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
              ),
              confirm_password: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Passwords must match'
              ),
              // role: Yup.string().required('Role is required'),
              user_type: Yup.string().required('Required'),
              shop_id: Yup.string().when('user_type', {
                is: val => val == 'seller',
                then: Yup.string().required(),
                otherwise: Yup.string()
              })
            })}
            onSubmit={values => {
              //   let data = {};
              let data = new FormData();
              data.append('user_type', values.user_type);
              data.append('language', values.language);
              data.append('name', values.name);
              data.append('email', values.email);
              if (!isEmpty(values.password))
                data.append('password', values.password);
              if (!isEmpty(values.confirm_password))
                data.append('confirm_password', values.confirm_password);

              // if (!isEmpty(values.privileges)) {
              //   values.privileges.forEach((privilege, index) => {
              //     data.append(`privileges[${index}]`, privilege);
              //   });
              // }
              if (!isEmpty(values.address)) {
                if (!isEmpty(values.address.building_name))
                  data.append(
                    'address[building_name]',
                    values.address.building_name
                  );
                if (!isEmpty(values.address.street))
                  data.append('address[street]', values.address.street);
                if (!isEmpty(values.address.city))
                  data.append('address[city]', values.address.city);
              }
              if (values.user_type == 'seller') {
                if (isEmpty(values.shop_id)) return; //do validation using yup

                data.append('shop_id', values.shop_id);
              }

              if (values.user_type == 'delivery_boy')
                if (!isEmpty(values.salary))
                  data.append('salary', values.salary);

              if (!isUndefined(values.image_url))
                data.append('image', values.image_url);
              // if (!isUndefined(values.icon_url))
              //   data.append("user_icon", values.icon_url);

              //   data.resourceBundle = values.resourceBundle;
              axios
                .put(CONSTANTS.BASE_URL + 'api/user/' + userData._id, data)
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
                      title="Update User"
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
                      <TextField
                        fullWidth
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                        label="Email"
                        margin="normal"
                        name="email"
                        onChange={handleChange}
                        type="email"
                        value={values.email}
                        variant="outlined"
                      />
                      <FormLabel>&nbsp;Address</FormLabel>
                      <Grid container spacing={3}>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            error={
                              touched.address &&
                              errors.address &&
                              Boolean(
                                touched.address.building_name &&
                                  errors.address.building_name
                              )
                            }
                            helperText={
                              touched.address &&
                              errors.address &&
                              touched.address.building_name &&
                              errors.address.building_name
                            }
                            label="Building Name"
                            multiline
                            margin="normal"
                            name={`address.building_name`}
                            onChange={handleChange}
                            type="text"
                            value={values.address.building_name}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            error={
                              touched.address &&
                              errors.address &&
                              Boolean(
                                touched.address.street && errors.address.street
                              )
                            }
                            helperText={
                              touched.address &&
                              errors.address &&
                              touched.address.street &&
                              errors.address.street
                            }
                            label="Street"
                            multiline
                            margin="normal"
                            name={`address.street`}
                            onChange={handleChange}
                            type="text"
                            value={values.address.street}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            error={
                              touched.address &&
                              errors.address &&
                              Boolean(
                                touched.address.city && errors.address.city
                              )
                            }
                            helperText={
                              touched.address &&
                              errors.address &&
                              touched.address.city &&
                              errors.address.city
                            }
                            label="City"
                            multiline
                            margin="normal"
                            name={`address.city`}
                            onChange={handleChange}
                            type="text"
                            value={values.address.city}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                        label="Password"
                        margin="normal"
                        name="password"
                        onChange={handleChange}
                        type="password"
                        value={values.password}
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        error={Boolean(
                          touched.confirm_password && errors.confirm_password
                        )}
                        helperText={
                          touched.confirm_password && errors.confirm_password
                        }
                        label="Confirm Password"
                        margin="normal"
                        name="confirm_password"
                        onChange={handleChange}
                        type="confirm_password"
                        value={values.confirm_password}
                        variant="outlined"
                      />
                      <FormControl
                        fullWidth
                        variant="outlined"
                        className={classes.formControl}
                        margin="normal"
                      >
                        <InputLabel id="language_label">Language</InputLabel>
                        <Select
                          fullWidth
                          error={Boolean(touched.language && errors.language)}
                          helperText={touched.language && errors.language}
                          margin="normal"
                          variant="outlined"
                          labelId="language_label"
                          id="language"
                          name="language"
                          value={values.language}
                          onChange={handleChange}
                          label="Language"
                        >
                          {/* <MenuItem value="">
                            <em>None</em>
                          </MenuItem> */}
                          {languages.map(language => {
                            return (
                              <MenuItem key={language.key} value={language.key}>
                                {language.label}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <FormControl component="fieldset">
                        <FormLabel>Update the user as</FormLabel>
                        <RadioGroup
                          row
                          aria-label="position"
                          name="user_type"
                          // defaultValue="top"
                          value={values.user_type}
                          onChange={event => {
                            formProps.setFieldValue(
                              'user_type',
                              event.target.value
                            );
                            if (event.target.value == 'seller') {
                              // getRolesWithShopId(values.shop_id);
                            }
                          }}
                        >
                          <FormControlLabel
                            value="user"
                            control={<Radio color="primary" />}
                            label="User"
                            // labelPlacement="top"
                          />
                          <FormControlLabel
                            value="seller"
                            control={<Radio color="primary" />}
                            label="Seller"
                            // labelPlacement="start"
                          />
                          <FormControlLabel
                            value="delivery_boy"
                            control={<Radio color="primary" />}
                            label="Delivery Boy"
                            // labelPlacement="bottom"
                          />
                          {(user.user_type == 'super_admin' ||
                            user.user_type == 'org_admin') && (
                            <FormControlLabel
                              value="admin"
                              control={<Radio color="primary" />}
                              label="Admin"
                              // labelPlacement="bottom"
                            />
                          )}
                          {user.user_type == 'super_admin' && (
                            <FormControlLabel
                              value="org_admin"
                              control={<Radio color="primary" />}
                              label="Org Admin"
                              // labelPlacement="bottom"
                            />
                          )}
                        </RadioGroup>
                      </FormControl>
                      {/* <FormControl fullWidth className={classes.formControl}>
                        <InputLabel id="demo-mutiple-name-label">
                          Privileges
                        </InputLabel>
                        <Select
                          labelId="demo-mutiple-name-label"
                          id="demo-mutiple-name"
                          multiple
                          value={values.privileges}
                          onChange={event => {
                            formProps.setFieldValue(
                              'privileges',
                              event.target.value
                            );
                          }}
                          input={<Input />}
                          MenuProps={MenuProps}
                        >
                          {privileges.map(privilege => (
                            <MenuItem
                              key={privilege.key}
                              value={privilege.key}
                              style={getStyles(
                                privilege.key,
                                values.privileges,
                                theme
                              )}
                            >
                              {privilege.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl> */}
                      {values.user_type == 'delivery_boy' && (
                        <TextField
                          fullWidth
                          error={Boolean(touched.salary && errors.salary)}
                          helperText={touched.salary && errors.salary}
                          label="Salary"
                          margin="normal"
                          name="salary"
                          onChange={handleChange}
                          type="number"
                          value={values.salary}
                          variant="outlined"
                        />
                      )}
                      {values.user_type == 'seller' && !isEmpty(shops) && (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          className={classes.formControl}
                        >
                          <InputLabel id="shop_id_label">Shop</InputLabel>
                          <Select
                            fullWidth
                            error={Boolean(touched.shop_id && errors.shop_id)}
                            helperText={touched.shop_id && errors.shop_id}
                            margin="normal"
                            variant="outlined"
                            labelId="shop_id_label"
                            id="shop_id"
                            name="shop_id"
                            value={values.shop_id}
                            onChange={event => {
                              formProps.setFieldValue(
                                'shop_id',
                                event.target.value
                              );
                              // getRolesWithShopId(event.target.value);
                            }}
                            label="Shop"
                          >
                            {/* <MenuItem value="">
                            <em>None</em>
                          </MenuItem> */}
                            {shops.map(shop => {
                              return (
                                <MenuItem key={shop._id} value={shop._id}>
                                  {shop.i18nResourceBundle.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      )}
                      {values.user_type == 'seller' && isEmpty(shops) && (
                        <Typography color="primary">
                          Please add the shop and then add the seller
                        </Typography>
                      )}
                      {/* {!isEmpty(roles) && (
                      <FormControl
                        fullWidth
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="role_label">Role</InputLabel>
                        <Select
                          fullWidth
                          error={Boolean(touched.role && errors.role)}
                          helperText={touched.role && errors.role}
                          margin="normal"
                          variant="outlined"
                          labelId="role_label"
                          id="role"
                          name="role"
                          value={values.role}
                          onChange={handleChange}
                          label="Role"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {roles.map(role => {
                            return (
                              <MenuItem key={role._id} value={role._id}>
                                {role.role_name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                    {isEmpty(roles) && (
                      <Typography color="primary">
                        Please add the role
                      </Typography>
                    )} */}

                      <Box mt={2}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="contained-button-file"
                          type="file"
                          name="image_url"
                          onChange={event => {
                            if (event.target.files) {
                              let fileArray = Array.from(
                                event.target.files
                              ).map(file => URL.createObjectURL(file));
                              setProfileImageFile(fileArray[0]);
                              formProps.setFieldValue(
                                'image_url',
                                event.target.files[0]
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
                            Update Profile Image
                          </Button>
                        </label>
                      </Box>
                      {profileImageFile && (
                        <div> {getImages([profileImageFile])}</div>
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
                          Update User
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </form>
              </React.Fragment>
            )}
          </Formik>
        </Container>
        {/* </Box>
    </div> */}
      </Page>
    ) : null;
  return page;
};

export default EditUser;
