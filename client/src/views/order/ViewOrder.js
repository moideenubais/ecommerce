import React, { useEffect, useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, FieldArray } from 'formik';
import CONSTANTS from '../../constants';
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
import AuthContext from 'src/context/auth-context';
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

const EditOrder = props => {
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
  const { user } = useContext(AuthContext);

  const handleDeliveryBoyChange = (event, values) => {
    // console.log("here",event,"\n values",values);
    if (!values) return;
    let data = { delivery_boy_id: values._id };
    axios
      .put(CONSTANTS.BASE_URL + 'api/order/updateDeliveryBoy/' + id, data)
      .then(response => {
        setDelivery_boy_id(
          delivery_boys.find(deliveryBoy => deliveryBoy._id == values._id)
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handlePaymentStatusChange = event => {
    let data = { payment_status: event.target.value };
    axios
      .put(CONSTANTS.BASE_URL + 'api/order/updatePaymentStatus/' + id, data)
      .then(response => {
        setPaymentStatus(event.target.value);
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handleDeliveryStatusChange = event => {
    let data = { delivery_status: event.target.value };
    axios
      .put(CONSTANTS.BASE_URL + 'api/order/updateDeliveryStatus/' + id, data)
      .then(response => {
        setDeliveryStatus(event.target.value);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const paymentStatuses = [
    { key: 'unpaid', value: 'Unpaid' },
    // { key: 'failed', value: 'Failed' },
    // { key: 'expired', value: 'Expired' },
    { key: 'paid', value: 'Paid' }
  ];

  const deliveryStatuses = [
    { key: 'yet_to_dispatch', value: 'Yet to dispatch' },
    { key: 'dispatched', value: 'Dispatched' },
    { key: 'in_transit', value: 'In Transit' },
    { key: 'out_for_delivery', value: 'Out For Delivery' },
    { key: 'delivered', value: 'Delivered' }
  ];

  //   const [orders, getOrders] = useState([]);
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
    getDeliveryBoys();
    getSingleOrder();
    // getAllOrders();
    // getAllOrders();
  }, []);

  // useEffect(() => {
  //   getSingleOrder();
  // }, [delivery_boys]);
  useEffect(() => {
    if (!isEmpty(delivery_boys) && !isEmpty(orderData)) {
      setDelivery_boy_id(
        delivery_boys.find(
          deliveryBoy => deliveryBoy._id == orderData.delivery_boy_id
        )
      );
    }
  }, [delivery_boys, orderData]);

  const getSingleOrder = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/order/' + id)
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const orderData = response.data;
        setPaymentStatus(orderData.payment_status);
        setDeliveryStatus(orderData.delivery_status);
        // setDelivery_boy_id(orderData.delivery_boy_id);
        // setDelivery_boy_id(
        //   delivery_boys.find(
        //     deliveryBoy => deliveryBoy._id == orderData.delivery_boy_id
        //   )
        // );

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
        setLogoImage(CONSTANTS.BASE_URL + orderData.logo_url);
        // setIconImage(CONSTANTS.BASE_URL + orderData.icon_url);
        // setImage(CONSTANTS.BASE_URL+orderData.imageUrl);
        //   getBills(allBills);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getFormattedAddress = address => {
    return (
      <>
        {address.building_name ? <div>{address.building_name}</div> : null}
        {address.street ? <div>{address.street}</div> : null}
        {address.city ? <div>{address.city}</div> : null}
      </>
    );
  };

  const getDeliveryBoys = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/user', {
        params: { page: 1, limit: 10000, user_type: 'delivery_boy' }
      })
      .then(response => {
        // console.log('get resoposldsl', response.data);
        const deliveryBoys = response.data.users;
        // const html = orderData.description || '';
        // const contentBlock = htmlToDraft(html);
        // if (contentBlock) {
        //   const contentState = ContentState.createFromBlockArray(
        //     contentBlock.contentBlocks
        //   );
        //   let editorState = EditorState.createWithContent(contentState);
        //   getEditorState(editorState);
        // }
        if (!isEmpty(deliveryBoys)) setDelivery_boys(deliveryBoys);
        else setDelivery_boys([]);
        // setLogoImage(CONSTANTS.BASE_URL + orderData.logo_url);
        // setIconImage(CONSTANTS.BASE_URL + orderData.icon_url);
        // setImage(CONSTANTS.BASE_URL+orderData.imageUrl);
        //   getBills(allBills);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllOrders = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/order', {
        params: { limit: 1000, page: 1 }
      })
      .then(response => {
        //   console.log("service data",response.data);
        const allOrders = response.data.orders;
        getOrders(allOrders);
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

  let page =
    orderData && delivery_boys ? (
      <Page className={classes.root} title="Order Details">
        <Container maxWidth="lg">
          <Card>
            <CardHeader title="Order Details" />
            <Divider />
            <CardContent>
              {user.user_type !== 'seller' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4} lg={3}>
                    <Autocomplete
                      fullWidth
                      id="combo-box-demo"
                      options={delivery_boys}
                      getOptionLabel={option => option.name}
                      onChange={handleDeliveryBoyChange}
                      value={delivery_boy_id}
                      renderInput={params => (
                        <TextField
                          fullWidth
                          {...params}
                          label="Assign Delivery Boy"
                          variant="outlined"
                          // margin="normal"
                          name="delivery_boy_id"
                          type="text"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={3}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel id="payment_status_label">
                        Payment Status
                      </InputLabel>
                      <Select
                        fullWidth
                        // error={Boolean(touched.payment_status && errors.payment_status)}
                        // helperText={touched.payment_status && errors.payment_status}
                        margin="normal"
                        variant="outlined"
                        labelId="payment_status_label"
                        id="payment_status"
                        name="payment_status"
                        value={payment_status}
                        onChange={handlePaymentStatusChange}
                        label="Payment Status"
                      >
                        {paymentStatuses.map(status => {
                          return (
                            <MenuItem key={status.key} value={status.key}>
                              {status.value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4} lg={3}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel id="delivery_status_label">
                        Delivery Status
                      </InputLabel>
                      <Select
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        labelId="delivery_status_label"
                        id="delivery_status"
                        name="delivery_status"
                        value={delivery_status}
                        onChange={handleDeliveryStatusChange}
                        label="Delivery Status"
                      >
                        {deliveryStatuses.map(status => {
                          return (
                            <MenuItem key={status.key} value={status.key}>
                              {status.value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
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
                        <TableCell>
                          {product.quantity * product.productCost}
                        </TableCell>
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
                        {orderData.subTotal + orderData.shippingCost}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <IconButton
                  href={CONSTANTS.BASE_URL + 'api/order/getOrderPdf/' + id}
                >
                  <PrintIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Page>
    ) : null;
  return page;
};

export default EditOrder;
