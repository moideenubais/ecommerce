import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { GoogleLogin } from 'react-google-login';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
  makeStyles
} from '@material-ui/core';
import FacebookIcon from 'src/icons/Facebook';
import GoogleIcon from 'src/icons/Google';
import Page from 'src/components/Page';
import Alert from '@material-ui/lab/Alert';
import CONSTANTS from '../../constants';

import AuthContext from '../../context/auth-context';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const LoginView = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);
  const authCtx = useContext(AuthContext);

  const responseSuccessGoogle = async responseGoogle => {
    setGoogleAuth(true);
    // console.log('resposnds', response);
    try {
      const response = await authCtx.onLogin('google', responseGoogle.tokenId);
      // console.log("res",response)
      if (response.user.user_type == 'delivery_boy')
        navigate('/app/dashboard/deliveryBoy', { replace: true });
      else if (response.user.user_type == 'seller')
        navigate('/app/dashboard/seller', { replace: true });
      else navigate('/app/dashboard', { replace: true });
    } catch (error) {
      console.log('error ', error);
      setError(true);
    }
  };
  const responseErrorGoogle = response => {
    console.log('error ', response);
    setError(true);
    setGoogleAuth(true);
  };

  return (
    <Page className={classes.root} title="Login">
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
      >
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              email: 'demo@devias.io',
              password: 'Password123'
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string()
                .email('Must be a valid email')
                .max(255)
                .required('Email is required'),
              password: Yup.string()
                .max(255)
                .required('Password is required')
            })}
            onSubmit={async values => {
              setGoogleAuth(false);
              try {
                const response = await authCtx.onLogin(
                  'default',
                  values.email,
                  values.password
                );
                // console.log("res",response)
                if (response.user.user_type == 'delivery_boy')
                  navigate('/app/dashboard/deliveryBoy', { replace: true });
                else if (response.user.user_type == 'seller')
                  navigate('/app/dashboard/seller', { replace: true });
                else navigate('/app/dashboard', { replace: true });
              } catch (error) {
                setError(true);
              }
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <Typography color="textPrimary" variant="h2">
                    Sign in
                  </Typography>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Sign in on the internal platform
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {/* <Grid item xs={12} md={6}>
                    <Button
                      color="primary"
                      fullWidth
                      startIcon={<FacebookIcon />}
                      onClick={handleSubmit}
                      size="large"
                      variant="contained"
                    >
                      Login with Facebook
                    </Button>
                  </Grid> */}
                  <Grid item xs={12} md={12}>
                    <GoogleLogin
                      clientId={CONSTANTS.GOOGLE_CLIENT_ID}
                      buttonText="Login with Google"
                      render={renderProps => (
                        <Button
                          onClick={renderProps.onClick}
                          disabled={renderProps.disabled}
                          fullWidth
                          startIcon={<GoogleIcon />}
                          size="large"
                          variant="contained"
                        >
                          Login with Google
                        </Button>
                      )}
                      onSuccess={responseSuccessGoogle}
                      onFailure={responseErrorGoogle}
                      cookiePolicy={'single_host_origin'}
                    />
                    {/* <Button
                      fullWidth
                      startIcon={<GoogleIcon />}
                      onClick={handleSubmit}
                      size="large"
                      variant="contained"
                    >
                      Login with Google
                    </Button> */}
                  </Grid>
                </Grid>
                <Box mt={3} mb={1}>
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="body1"
                  >
                    or login with email address
                  </Typography>
                </Box>
                {error ? (
                  googleAuth ? (
                    <Alert severity="error">Google Login Failed</Alert>
                  ) : (
                    <Alert severity="error">Invalid Username or Password</Alert>
                  )
                ) : null}
                <TextField
                  error={Boolean(touched.email && errors.email)}
                  fullWidth
                  helperText={touched.email && errors.email}
                  label="Email Address"
                  margin="normal"
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="email"
                  value={values.email}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  label="Password"
                  margin="normal"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  variant="outlined"
                />
                <Box my={2}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Sign in now
                  </Button>
                </Box>
                <Typography color="textSecondary" variant="body1">
                  Don&apos;t have an account?{' '}
                  <Link component={RouterLink} to="/register" variant="h6">
                    Sign up
                  </Link>
                </Typography>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

export default LoginView;
