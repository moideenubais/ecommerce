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

const FlashDealView = () => {
  const classes = useStyles();
  // const [flashDeals] = useState({});
  const [flashDeals, setFlashDeals] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [urlParams, setUrlParams] = useState({ limit: limit, page: 1 });
  const [totalRows, setTotalRows] = useState(undefined);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [featureUpdated, setfeatureUpdated] = useState(false);

  const handleLimitChange = event => {
    setLimit(event.target.value);
    let tempUrl = urlParams;
    tempUrl.page = page + 1;
    tempUrl.limit = event.target.value;
    setUrlParams(tempUrl);
    getAllFlashDeals();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllFlashDeals();
    setPage(newPage);
  };

  useEffect(() => {
    getAllFlashDeals();
  }, []);

  const getAllFlashDeals = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/flash', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.flashDeals);
        const allFlashDeals = response.data.flashs;
        if (!isEmpty(allFlashDeals)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setFlashDeals(allFlashDeals);
        } else {
          setFlashDeals([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handleUpdateFeature = (flashDeal, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('featured', !flashDeal.featured);
    if(snackBarOpen)
      setSnackBarOpen(false);
    // let updateData = {featured:!flashDeal.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/flash/' + flashDeal._id, updateData)
      .then(response => {
        // console.log('in handle res');

        flashDeal.featured = !flashDeal.featured;
        let newFlashDeals = flashDeals;
        newFlashDeals[index] = flashDeal;
        setFlashDeals(newFlashDeals);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        
      })
      .catch(error => {
        setSnackBarOpen(true);
        setfeatureUpdated(false);
        console.log(error);
      });
  };
  const handleUpdateStatus = (flashDeal, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('status', !flashDeal.status);
    if(snackBarOpen)
      setSnackBarOpen(false);
    // let updateData = {featured:!flashDeal.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/flash/' + flashDeal._id, updateData)
      .then(response => {
        // console.log('in handle res');

        flashDeal.status = !flashDeal.status;
        let newFlashDeals = flashDeals;
        newFlashDeals[index] = flashDeal;
        setFlashDeals(newFlashDeals);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        
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
    getAllFlashDeals();
  };

  return (
    <Page className={classes.root} title="FlashDeals">
      <Container maxWidth={false}>
        <Toolbar
        onSearchName={event => {
          handelSearch(event);
        }} />
        <Box mt={3}>
          {flashDeals ? (
            <Results
              flashDeals={flashDeals}
              onDelete={getAllFlashDeals}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}
              onUpdateFeature={handleUpdateFeature}
              onUpdateStatus={handleUpdateStatus}
              
              // onDelete={getAllFlashDeals}
            />
          ) : null}
        </Box>
      </Container>
      <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
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
  );
};

export default FlashDealView;
