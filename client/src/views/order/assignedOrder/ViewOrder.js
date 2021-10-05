import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../../constants';
import { isEmpty, isUndefined, find } from 'lodash';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PrintIcon from '@material-ui/icons/Print';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormHelperText,
  Grid,
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
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  IconButton
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
  productImage: {
    // color: colors.red[500],
    width: '60px'
    // color: 'white'
  }
}));

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

const ViewAssignedOrder = props => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let [orderData, setOrderData] = useState(null);
  const [logoImageFile, setLogoImage] = useState(null);
  // const [iconImageFile, setIconImage] = useState(null);
  const [services, getServices] = useState([]);
  //   const [editorState, getEditorState] = useState(EditorState.createEmpty());
  const [orders, getOrders] = useState([]);
  const [translationModel, setTranslationModel] = useState(false);
  const [delivery_boy_id, setDelivery_boy_id] = useState(null);
  const [payment_status, setPaymentStatus] = useState(null);
  const [delivery_status, setDeliveryStatus] = useState(null);
  const [delivery_boys, setDelivery_boys] = useState(null);

  const languages = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'Arabic' }
  ];

  const paymentMethodMap = {
    cod: 'Cash on Delivery',
    card: 'Card'
  };
  let totalAmount = 0;
  const getTotalAmount = order => {
    let total_amount = 0;
    order.products.forEach(product => {
      total_amount += product.quantity * product.cost;
    });
    totalAmount = total_amount;
    return total_amount;
  };
  let shippingCost = 0;
  const getShippingCost = order => {
    let shipping_cost = 0;
    order.products.forEach(product => {
      if (product.product_id.shipping_config != 'free') {
        if (product.product_id.product_quantity_multiply) {
          if (product.product_id.shipping_cost)
            shipping_cost +=
              product.product_id.shipping_cost * product.quantity;
        } else {
          if (product.product_id.shipping_cost)
            shipping_cost += product.product_id.shipping_cost;
        }
      }
    });
    shippingCost = shipping_cost;
    return shipping_cost;
  };

  useEffect(() => {
    // getDeliveryBoys();
    // getAllOrders();
    // getAllOrders();
    getSingleOrder();
  }, []);

  const getSingleOrder = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/order/' + id)
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const orderData = response.data;

        // const html = orderData.description || '';
        // const contentBlock = htmlToDraft(html);
        // if (contentBlock) {
        //   const contentState = ContentState.createFromBlockArray(
        //     contentBlock.contentBlocks
        //   );
        //   let editorState = EditorState.createWithContent(contentState);
        //   getEditorState(editorState);
        // }
        setOrderData(orderData);
        // setLogoImage(CONSTANTS.BASE_URL + orderData.logo_url);
        // setIconImage(CONSTANTS.BASE_URL + orderData.icon_url);
        // setImage(CONSTANTS.BASE_URL+orderData.imageUrl);
        //   getBills(allBills);
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
  // const getOrderPdf = () => {
  //   axios
  //     .get(CONSTANTS.BASE_URL + 'api/order/getOrderPdf')
  //     .then(response => {
  //       // const allOrders = response.data.orders;
  //       // getOrders(allOrders);
  //       // //
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };
  const getFormattedAddress = address => {
    return (
      <>
        {address.building_name ? <div>{address.building_name}</div> : null}
        {address.street ? <div>{address.street}</div> : null}
        {address.city ? <div>{address.city}</div> : null}
      </>
    );
  };

  let page = orderData ? (
    <Page className={classes.root} title="Order Details">
      <Container maxWidth="lg">
        <Card>
          <CardHeader title="Order Details" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box mt={2}>
                  <b>{orderData.customer_name}</b>
                  <br />
                  <br />
                  {/* {orderData.shipping_address} */}
                  {getFormattedAddress(orderData.shipping_address)}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box mt={2}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ borderBottom: 'none' }}>
                          Order
                        </TableCell>
                        <TableCell style={{ borderBottom: 'none' }}>
                          {orderData.order_code}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderBottom: 'none' }}>
                          Order Status
                        </TableCell>
                        <TableCell style={{ borderBottom: 'none' }}>
                          {capitalize(orderData.order_status)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderBottom: 'none' }}>
                          Order Date
                        </TableCell>
                        <TableCell style={{ borderBottom: 'none' }}>
                          {orderData.createdAt}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderBottom: 'none' }}>
                          Total Amount
                        </TableCell>
                        <TableCell style={{ borderBottom: 'none' }}>
                          {/* {getTotalAmount(orderData)} */}
                          {orderData.subTotal + orderData.shippingCost}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderBottom: 'none' }}>
                          Payment Method
                        </TableCell>
                        <TableCell style={{ borderBottom: 'none' }}>
                          {orderData.payment_method
                            ? paymentMethodMap[orderData.payment_method]
                            : ''}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Photo</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderData.products.map((product, index) => (
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {product.product_id.product_image_small_url ? (
                          <img
                            className={classes.productImage}
                            src={
                              CONSTANTS.BASE_URL +
                              product.product_id.product_image_small_url
                            }
                            alt="product image"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      {/* <TableCell>{product.name}</TableCell> */}
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.productCost}</TableCell>
                      <TableCell>{product.quantity * product.productCost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box ml="auto">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell rowSpan={3} />
                    <TableCell rowSpan={3} />
                    <TableCell rowSpan={3} />
                    <TableCell rowSpan={3} />
                    <TableCell rowSpan={3} />
                    <TableCell rowSpan={3} />
                    <TableCell>Sub Total</TableCell>
                    <TableCell align="right">
                      {/* {getTotalAmount(orderData)} */}
                      {orderData.subTotal}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Shipping</TableCell>
                    <TableCell align="right">
                      {/* {getShippingCost(orderData)} */}
                      {orderData.shippingCost}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TOTAL</TableCell>
                    <TableCell align="right">
                      {/* {totalAmount + shippingCost} */}
                      {orderData.subTotal + orderData.shippingCost}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Page>
  ) : null;
  return page;
};

export default ViewAssignedOrder;
