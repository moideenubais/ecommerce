import React, { useState, useContext } from 'react';
import clsx from 'clsx';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../../constants';
import { isEmpty, isUndefined, find } from 'lodash';
import Page from 'src/components/Page';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  makeStyles,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@material-ui/core';
import AuthContext from 'src/context/auth-context';

const states = [
  {
    value: 'alabama',
    label: 'Alabama'
  },
  {
    value: 'new-york',
    label: 'New York'
  },
  {
    value: 'san-francisco',
    label: 'San Francisco'
  }
];

const useStyles = makeStyles(() => ({
  root: {}
}));

const ProfileDetails = ({ className, user, ...rest }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const [values, setValues] = useState({
    firstName: 'Katarina',
    lastName: 'Smith',
    email: 'demo@devias.io',
    phone: '',
    state: 'Alabama',
    country: 'USA'
  });

  const handleChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };
  const isDeliveryBoy = privileges => {
    if (privileges.includes('delivery_boy')) return true;
    return false;
  };
  const isSeller = privileges => {
    if (privileges.includes('seller')) return true;
    return false;
  };

  let page = user ? (
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
            // language: user.language,
            name: user.name,
            email: user.email,
            password: '',
            confirm_password: '',
            privileges: user.privileges ? user.privileges : [],
            salary: user.salary ? user.salary : 0,
            shop_name: user.shop_name ? user.shop_name : ''
          }}
          validationSchema={Yup.object().shape({
            // parentId: Yup.string(),
            name: Yup.string().required('Name required'),
            email: Yup.string().required('Email required'),
            password: Yup.string().matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
              'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
            ),
            confirm_password: Yup.string().oneOf(
              [Yup.ref('password'), null],
              'Passwords must match'
            )
          })}
          onSubmit={values => {
            //   let data = {};
            let data = new FormData();
            data.append('language', values.language);
            data.append('name', values.name);
            data.append('email', values.email);
            if (!isEmpty(values.password))
              data.append('password', values.password);
            if (!isEmpty(values.confirm_password))
              data.append('confirm_password', values.confirm_password);

            // if(!isEmpty(values.privileges)){
            //   values.privileges.forEach((privilege, index)=>{

            //     data.append(`privileges[${index}]`, privilege);
            //   })
            // }
            if (isSeller(values.privileges))
              if (!isEmpty(values.shop_name))
                data.append('shop_name', values.shop_name);

            if (isDeliveryBoy(values.privileges))
              if (!isEmpty(values.salary)) data.append('salary', values.salary);

            if (!isUndefined(values.image_url))
              data.append('image', values.image_url);
            // if (!isUndefined(values.icon_url))
            //   data.append("user_icon", values.icon_url);

            //   data.resourceBundle = values.resourceBundle;
            axios
              .put(CONSTANTS.BASE_URL + 'api/user/' + user._id, data)
              .then(response => {
                if (!isEmpty(response.data.token))
                  authCtx.onTokenChange(response.data.token);
                // console.log(response.data);
                // const bill = response.data;
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
                    {/* <FormControl
                            fullWidth
                            variant="outlined"
                            className={classes.formControl}
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
                              
                              {languages.map(language => {
                                return (
                                  <MenuItem key={language.key} value={language.key}>
                                    {language.label}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl> */}
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
                    {isDeliveryBoy(values.privileges) && (
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
                        disabled="true"
                      />
                    )}
                    {isSeller(values.privileges) && (
                      <TextField
                        fullWidth
                        error={Boolean(touched.shop_name && errors.shop_name)}
                        helperText={touched.shop_name && errors.shop_name}
                        label="Shop Name"
                        margin="normal"
                        name="shop_name"
                        onChange={handleChange}
                        type="text"
                        value={values.shop_name}
                        variant="outlined"
                      />
                    )}

                    {/* <Box mt={2}>
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
                          {profileImageFile && <div> {getImages([profileImageFile])}</div>} */}
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
                      {/* <Button
                            color="red"
                            variant="contained"
                            // type="submit"
                            // className={classes.buttonStyle}
    
                            // disabled={isSubmitting}
                            onClick={()=>{navigate(-1)}}
                          >
                            Cancel
                          </Button> */}
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

ProfileDetails.propTypes = {
  className: PropTypes.string
};

export default ProfileDetails;
