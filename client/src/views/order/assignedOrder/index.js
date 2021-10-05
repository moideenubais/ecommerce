import React, { useState, useEffect } from 'react';
import { Box, Container, makeStyles, Snackbar, Slide } from '@material-ui/core';
import Page from 'src/components/Page';
import Results from './Results';
import Toolbar from './Toolbar';
// import data from './data';
import CONSTANTS from 'src/constants';
import axios from 'axios';
import { isEmpty } from 'lodash';
import MuiAlert from '@material-ui/lab/Alert';
// import Spinner from '../../components/Spinner';


const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const AssignedDeliveryView = () => {
  const classes = useStyles();
  // const [orders] = useState({});
  const [orders, setOrders] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [urlParams, setUrlParams] = useState({ limit: limit, page: 1 });
  const [totalRows, setTotalRows] = useState(undefined);
  // const [snackBarOpen, setSnackBarOpen] = useState(false);
  // const [featureUpdated, setfeatureUpdated] = useState(false);

  const handleLimitChange = event => {
    setLimit(event.target.value);
    let tempUrl = urlParams;
    tempUrl.page = page + 1;
    tempUrl.limit = event.target.value;
    setUrlParams(tempUrl);
    getAllOrders();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllOrders();
    setPage(newPage);
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/order/deliveryBoyAssignedOrders', { params: urlParams })
      .then(response => {
        const allOrders = response.data.orders;
        if (!isEmpty(allOrders)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          setOrders(allOrders);
        } else {
          setOrders([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  // const handleUpdateFeature = (order, index) => {
  //   console.log('in handle');
  //   let updateData = new FormData();
  //   updateData.append('featured', !order.featured);
  //   if(snackBarOpen)
  //     setSnackBarOpen(false);
  //   // let updateData = {featured:!order.featured}
  //   axios
  //     .put(CONSTANTS.BASE_URL + 'api/order/' + order._id, updateData)
  //     .then(response => {
  //       console.log('in handle res');

  //       order.featured = !order.featured;
  //       let newOrders = orders;
  //       newOrders[index] = order;
  //       setOrders(newOrders);
  //       setSnackBarOpen(true);
  //       setfeatureUpdated(true);
  //       // console.log("+++++++++++++++++++",response.data.orders);
  //       // const allOrders = response.data.orders;
  //       // if (!isEmpty(allOrders)) {
  //       //   const totalRows = response.data.info.totalNumber;
  //       //   setTotalRows(totalRows);
  //       //   // console.log("totol",totalRows)
  //       //   setOrders(allOrders);
  //       // } else {
  //       //   setOrders([]);
  //       // }
  //     })
  //     .catch(error => {
  //       setSnackBarOpen(true);
  //       setfeatureUpdated(false);
  //       console.log(error);
  //     });
  // };
  // const handleSnackBarClose = (event, reason) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }

  //   setSnackBarOpen(false);
  // };
  const handelSearch = event => {
    // console.log("in")
    let tempUrl = urlParams;
    tempUrl.search = event.target.value;
    setUrlParams(tempUrl);
    // urlParams.customerName = event.target.value;
    getAllOrders();
  };

  return (
    <Page className={classes.root} title="Orders">
      <Container maxWidth={false}>
        <Toolbar
        onSearchName={event => {
          handelSearch(event);
        }} />
        <Box mt={3}>
          {orders ? (
            <Results
              orders={orders}
              onUpdateDeliveryStatus={getAllOrders}
              onUpdatePaymentStatus = {getAllOrders}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}
              // onUpdateFeature={handleUpdateFeature}
              // onDelete={getAllOrders}
            />
          ) : null}
        </Box>
      </Container>
      {/* <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={handleSnackBarClose}
        // TransitionComponent={SlideTransition}
      >
        {featureUpdated ? (
          <Alert onClose={handleSnackBarClose} severity="success">
            Featured Updated Successfully
          </Alert>
        ) : (
          <Alert onClose={handleSnackBarClose} severity="error">
            Featured Updated Successfully
          </Alert>
        )}
      </Snackbar> */}
    </Page>
  );
};

export default AssignedDeliveryView;
