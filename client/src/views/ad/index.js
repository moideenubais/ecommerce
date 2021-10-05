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

const AdView = () => {
  const classes = useStyles();
  // const [ads] = useState({});
  const [ads, setAds] = useState(null);
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
    getAllAds();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllAds();
    setPage(newPage);
  };

  useEffect(() => {
    getAllAds();
  }, []);

  const getAllAds = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/ad', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.ads);
        const allAds = response.data.ads;
        if (!isEmpty(allAds)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setAds(allAds);
        } else {
          setAds([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handleUpdateFeature = (ad, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('featured', !ad.featured);
    if(snackBarOpen)
      setSnackBarOpen(false);
    // let updateData = {featured:!ad.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/ad/' + ad._id, updateData)
      .then(response => {
        // console.log('in handle res');

        ad.featured = !ad.featured;
        let newAds = ads;
        newAds[index] = ad;
        setAds(newAds);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        
      })
      .catch(error => {
        setSnackBarOpen(true);
        setfeatureUpdated(false);
        console.log(error);
      });
  };
  const handleUpdateStatus = (ad, index) => {
    // console.log('in handle');
    let updateData = new FormData();
    updateData.append('status', !ad.status);
    if(snackBarOpen)
      setSnackBarOpen(false);
    // let updateData = {featured:!ad.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/ad/' + ad._id, updateData)
      .then(response => {
        // console.log('in handle res');

        ad.status = !ad.status;
        let newAds = ads;
        newAds[index] = ad;
        setAds(newAds);
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
    getAllAds();
  };

  return (
    <Page className={classes.root} title="Ads">
      <Container maxWidth={false}>
        <Toolbar
        onSearchName={event => {
          handelSearch(event);
        }} />
        <Box mt={3}>
          {ads ? (
            <Results
              ads={ads}
              onDelete={getAllAds}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}
              onUpdateFeature={handleUpdateFeature}
              onUpdateStatus={handleUpdateStatus}
              
              // onDelete={getAllAds}
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

export default AdView;
