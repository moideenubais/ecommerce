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

const EditAd = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const [adData, setAdData] = useState(null);
  const theme = useTheme();
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

  const adTypes = [
    { key: 'top', name: 'Top' },
    { key: 'middle', name: 'Middle' },
    { key: 'removable_top', name: 'Top Removable' }
  ];

  useEffect(() => {
    getSingleAd();
  }, []);

  const getSingleAd = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/ad/' + id)
      .then(response => {
        const adData = response.data;
        setAdData(adData);
        if (!isEmpty(adData.ad_url))
          setAdImageFiles(
            Array.from(adData.ad_url).map(image => CONSTANTS.BASE_URL + image)
          );
      })
      .catch(error => {
        console.log(error);
      });
  };

  let page = adData ? (
    <Page className={classes.root} title="Ad Update">
      <Container maxWidth="md">
        <Formik
          initialValues={{
            name: !isEmpty(adData.name) ? adData.name : '',
            ad_type: adData.ad_type
          }}
          validationSchema={Yup.object().shape({
            // parentId: Yup.string(),
            name: Yup.string(),
            ad_type: Yup.string().required('Ad Type required')
          })}
          onSubmit={values => {
            let data = new FormData();
            if (!isEmpty(values.name)) data.append('name', values.name);
            data.append('ad_type', values.ad_type);

            if (!isUndefined(values.ad_url))
              Array.from(values.ad_url).forEach(image_url => {
                if (!isUndefined(image_url)) {
                  data.append('ad', image_url);
                }
              });
            axios
              .put(CONSTANTS.BASE_URL + 'api/ad/' + adData._id, data)
              .then(response => {
                const bill = response.data;
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
                    title="Update Ad"
                  />
                  <Divider />
                  <CardContent>
                    {console.log('val', values)}
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
                      <InputLabel id="category_id_label">Ad Type</InputLabel>
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
                        label="Ad Type"
                      >
                        {/* <MenuItem value="">
                            <em>None</em>
                          </MenuItem> */}
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
                          Update Ad Images
                        </Button>
                      </label>
                    </Box>
                    {adImageFiles && <div> {getImages(adImageFiles)}</div>}
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
                        Update Ad
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

export default EditAd;
