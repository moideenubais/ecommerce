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

const ReviewView = () => {
  const classes = useStyles();
  // const [reviews] = useState({});
  const [reviews, setReviews] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [urlParams, setUrlParams] = useState({ limit: limit, page: 1 });
  const [totalRows, setTotalRows] = useState(undefined);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [publishUpdated, setpublishUpdated] = useState(false);
  const [ratingSort, setRatingSort] = useState('');

  const handleLimitChange = event => {
    setLimit(event.target.value);
    let tempUrl = urlParams;
    tempUrl.page = page + 1;
    tempUrl.limit = event.target.value;
    setUrlParams(tempUrl);
    getAllReviews();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllReviews();
    setPage(newPage);
  };

  useEffect(() => {
    getAllReviews();
  }, []);

  const getAllReviews = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/review', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.reviews);
        const allReviews = response.data.reviews;
        if (!isEmpty(allReviews)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setReviews(allReviews);
        } else {
          setReviews([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handleUpdatePublish = (review, index) => {
    let updateData = {};
    updateData.publish = !review.publish;
    if(snackBarOpen)
      setSnackBarOpen(false);
    axios
      .put(CONSTANTS.BASE_URL + 'api/review/' + review._id, updateData)
      .then(response => {
        review.publish = !review.publish;
        let newReviews = reviews;
        newReviews[index] = review;
        setReviews(newReviews);
        setSnackBarOpen(true);
        setpublishUpdated(true);
      })
      .catch(error => {
        setSnackBarOpen(true);
        setpublishUpdated(false);
        console.log(error);
      });
  };
  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpen(false);
  };
  const handleFilter = event => {
    // console.log("in")
    let tempUrl = urlParams;
    tempUrl.ratings = event.target.value;
    setUrlParams(tempUrl);
    // urlParams.customerName = event.target.value;
    getAllReviews();
    setRatingSort(event.target.value)
  };

  return (
    <Page className={classes.root} title="Reviews">
      <Container maxWidth={false}>
        <Toolbar
        filter={ratingSort}
        onFilterChange={event => {
          handleFilter(event);
        }} />
        <Box mt={3}>
          {reviews ? (
            <Results
              reviews={reviews}
              onDelete={getAllReviews}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}
              onUpdatePublish={handleUpdatePublish}
              // onDelete={getAllReviews}
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
        {publishUpdated ? (
          <Alert onClose={handleSnackBarClose} severity="success">
            Published Updated Successfully
          </Alert>
        ) : (
          <Alert onClose={handleSnackBarClose} severity="error">
            Published Not Updated
          </Alert>
        )}
      </Snackbar>
    </Page>
  );
};

export default ReviewView;
