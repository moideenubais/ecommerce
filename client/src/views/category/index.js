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

const CategoryView = () => {
  const classes = useStyles();
  // const [categories] = useState({});
  const [categories, setCategories] = useState(null);
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
    getAllCategories();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllCategories();
    setPage(newPage);
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/category', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.categories);
        const allCategories = response.data.categories;
        if (!isEmpty(allCategories)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setCategories(allCategories);
        } else {
          setCategories([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handleUpdateFeature = (category, index) => {
    console.log('in handle');
    let updateData = new FormData();
    updateData.append('featured', !category.featured);
    if(snackBarOpen)
      setSnackBarOpen(false);
    // let updateData = {featured:!category.featured}
    axios
      .put(CONSTANTS.BASE_URL + 'api/category/' + category._id, updateData)
      .then(response => {
        console.log('in handle res');

        category.featured = !category.featured;
        let newCategories = categories;
        newCategories[index] = category;
        setCategories(newCategories);
        setSnackBarOpen(true);
        setfeatureUpdated(true);
        // console.log("+++++++++++++++++++",response.data.categories);
        // const allCategories = response.data.categories;
        // if (!isEmpty(allCategories)) {
        //   const totalRows = response.data.info.totalNumber;
        //   setTotalRows(totalRows);
        //   // console.log("totol",totalRows)
        //   setCategories(allCategories);
        // } else {
        //   setCategories([]);
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
    getAllCategories();
  };

  return (
    <Page className={classes.root} title="Categories">
      <Container maxWidth={false}>
        <Toolbar
        onSearchName={event => {
          handelSearch(event);
        }} />
        <Box mt={3}>
          {categories ? (
            <Results
              categories={categories}
              onDelete={getAllCategories}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}
              onUpdateFeature={handleUpdateFeature}
              // onDelete={getAllCategories}
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

export default CategoryView;
