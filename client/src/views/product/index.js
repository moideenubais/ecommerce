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

const ProductView = () => {
  const classes = useStyles();
  // const [products] = useState({});
  const [products, setProducts] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [urlParams, setUrlParams] = useState({ limit: limit, page: 1 });
  const [totalRows, setTotalRows] = useState(undefined);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [featureUpdated, setfeatureUpdated] = useState(false);
  const [shops, setShops] = useState(null);

  const handleLimitChange = event => {
    setLimit(event.target.value);
    let tempUrl = urlParams;
    tempUrl.page = page + 1;
    tempUrl.limit = event.target.value;
    setUrlParams(tempUrl);
    getAllProducts();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllProducts();
    setPage(newPage);
  };

  const handleCreatedBySearch = createdBy => {
    let tempUrl = urlParams;
    if (createdBy === 'all') {
      if (tempUrl.hasOwnProperty('created_by')) delete tempUrl.created_by;
    } else {
      tempUrl.created_by = createdBy;
    }
    setUrlParams(tempUrl);
    getAllProducts();
  };

  useEffect(() => {
    getAllProducts();
    getAllShops();
  }, []);

  const getAllProducts = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/product', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.products);
        const allProducts = response.data.products;
        if (!isEmpty(allProducts)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setProducts(allProducts);
        } else {
          setProducts([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getAllShops = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/shop', {
        params: { page: 1, limit: 1000 }
      })
      .then(response => {
        const allShops = response.data.shops;
        allShops.unshift({
          _id: null,
          i18nResourceBundle: { name: 'In House Product' }
        });

        if (!isEmpty(allShops)) {
          setShops(allShops);
        } else {
          setShops([
            {
              _id: null,
              i18nResourceBundle: { name: 'In House Product' }
            }
          ]);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleUpdateFeature = (product, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('featured', !product.featured);
    if (snackBarOpen) setSnackBarOpen(false);
    // let updateData = {featured:!product.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/product/' + product._id, updateData)
      .then(response => {
        // console.log('in handle res');

        product.featured = !product.featured;
        let newProducts = products;
        newProducts[index] = product;
        setProducts(newProducts);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        // console.log("+++++++++++++++++++",response.data.products);
        // const allProducts = response.data.products;
        // if (!isEmpty(allProducts)) {
        //   const totalRows = response.data.info.totalNumber;
        //   setTotalRows(totalRows);
        //   // console.log("totol",totalRows)
        //   setProducts(allProducts);
        // } else {
        //   setProducts([]);
        // }
      })
      .catch(error => {
        setSnackBarOpen(true);
        setfeatureUpdated(false);
        console.log(error);
      });
  };
  const handleUpdateTodaysDeal = (product, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('todays_deal', !product.todays_deal);
    if (snackBarOpen) setSnackBarOpen(false);
    // let updateData = {featured:!product.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/product/' + product._id, updateData)
      .then(response => {
        // console.log('in handle res');

        product.todays_deal = !product.todays_deal;
        let newProducts = products;
        newProducts[index] = product;
        setProducts(newProducts);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        // console.log("+++++++++++++++++++",response.data.products);
        // const allProducts = response.data.products;
        // if (!isEmpty(allProducts)) {
        //   const totalRows = response.data.info.totalNumber;
        //   setTotalRows(totalRows);
        //   // console.log("totol",totalRows)
        //   setProducts(allProducts);
        // } else {
        //   setProducts([]);
        // }
      })
      .catch(error => {
        setSnackBarOpen(true);
        setfeatureUpdated(false);
        console.log(error);
      });
  };
  const handleUpdatePublish = (product, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('publish', !product.publish);
    if (snackBarOpen) setSnackBarOpen(false);
    // let updateData = {publish:!product.publish}
    axios
      .put(CONSTANTS.BASE_URL + 'api/product/' + product._id, updateData)
      .then(response => {
        // console.log('in handle res');

        product.publish = !product.publish;
        let newProducts = products;
        newProducts[index] = product;
        setProducts(newProducts);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        // console.log("+++++++++++++++++++",response.data.products);
        // const allProducts = response.data.products;
        // if (!isEmpty(allProducts)) {
        //   const totalRows = response.data.info.totalNumber;
        //   setTotalRows(totalRows);
        //   // console.log("totol",totalRows)
        //   setProducts(allProducts);
        // } else {
        //   setProducts([]);
        // }
      })
      .catch(error => {
        setSnackBarOpen(true);
        setfeatureUpdated(false);
        console.log(error);
      });
  };
  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpen(false);
  };
  const handelSearch = event => {
    // console.log("in")
    let tempUrl = urlParams;
    tempUrl.search = event.target.value;
    setUrlParams(tempUrl);
    // urlParams.customerName = event.target.value;
    getAllProducts();
  };

  const handleSellerSearch = shopId => {
    // console.log("in")
    let tempUrl = urlParams;
    tempUrl.shop_id = shopId;
    setUrlParams(tempUrl);
    // urlParams.customerName = event.target.value;
    getAllProducts();
  };

  return (
    shops && (
      <Page className={classes.root} title="Products">
        <Container maxWidth={false}>
          <Toolbar
            onSearchName={event => {
              handelSearch(event);
            }}
            shops={shops}
            onCreatedByChange={handleCreatedBySearch}
            onSellerChange={handleSellerSearch}
          />
          <Box mt={3}>
            {products ? (
              <Results
                products={products}
                onDelete={getAllProducts}
                handlePageChange={handlePageChange}
                handleLimitChange={handleLimitChange}
                page={page}
                limit={limit}
                total={totalRows}
                onUpdateFeature={handleUpdateFeature}
                onUpdateTodaysDeal={handleUpdateTodaysDeal}
                onUpdatePublish={handleUpdatePublish}
                // onDelete={getAllProducts}
              />
            ) : null}
          </Box>
        </Container>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={snackBarOpen}
          autoHideDuration={3000}
          onClose={handleSnackBarClose}
          // TransitionComponent={SlideTransition}
        >
          {/* <SlideTransition > */}
          {featureUpdated ? (
            <Alert onClose={handleSnackBarClose} severity="success">
              Featured Updated Successfully
            </Alert>
          ) : (
            <Alert onClose={handleSnackBarClose} severity="error">
              Featured Updated Successfully
            </Alert>
          )}
          {/* </SlideTransition> */}
        </Snackbar>
      </Page>
    )
  );
};

export default ProductView;
