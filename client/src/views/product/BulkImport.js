import React, { useEffect, useState } from 'react';
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
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Page from 'src/components/Page';
import { isEmpty, cloneDeep, rest } from 'lodash';
import Spinner from '../../components/Spinner';
import TabPanel from 'src/components/TabPanel';

import colors from './colors';
import attributes from './attributes';
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
    margin: theme.spacing(1),
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
  },
  topMargin: {
    marginTop: 2
  }
}));

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium
  };
}

const BulkImport = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [upload_file, setUpload_file] = useState(null);
  const [validationArray, setValidationArray] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = () => {
    if (!upload_file) return;
    setIsSubmitting(true);
    let data = new FormData();
    if (!isEmpty(upload_file.name)) {
      data.append('file', upload_file);
    }
    axios
      .post(CONSTANTS.BASE_URL + 'api/product/productBulkUpload', data)
      .then(response => {
        const validationArray = response.data;
        setValidationArray(validationArray);
        // getProducts(allProducts);
        setIsSubmitting(false);
      })
      .catch(error => {
        console.log(error);
        setIsSubmitting(false);
      });
  };

  const page = (
    <Page className={classes.root} title="Add Product">
      <Container maxWidth="lg">
        <Card>
          <CardHeader title="Product Bulk Upload" />
          <Divider />
          <CardContent>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="contained-button-file"
              // multiple
              type="file"
              name="upload_file"
              onChange={event => {
                if (event.target.files) {
                  let fileArray = Array.from(event.target.files).map(file =>
                    URL.createObjectURL(file)
                  );
                  // setBigImageFiles(fileArray[0]);
                  setUpload_file(event.target.files[0]);
                  setIsSubmitting(false);
                }
              }}
            />
            <label htmlFor="contained-button-file">
              <Button variant="contained" color="primary" component="span">
                Upload CSV File
              </Button>
            </label>
            {upload_file && (
              <Box ml={2} component="span">
                {upload_file.name}
              </Box>
            )}
            <Box mt={2}>
              <Button
                component="div"
                variant="contained"
                onClick={handleUpload}
                type="submit"
                disabled={isSubmitting}
              >
                Upload
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Card className={classes.topMargin}>
          <CardContent>
            {validationArray && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Row Id</TableCell>
                    <TableCell>Messages</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validationArray.map(validationRow => (
                    <TableRow>
                      <TableCell>{validationRow.recordId}</TableCell>
                      <TableCell>
                        {validationRow.messages.map(msg => (
                          <div>{msg}</div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {isEmpty(validationRow.messages) && (
                          <Chip
                            color="primary"
                            label={
                              validationRow.updated ? 'Updated' : 'Created'
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Container>
    </Page>
  );
  return page;
};

export default BulkImport;
