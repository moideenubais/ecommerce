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

const SubscriberView = () => {
  const classes = useStyles();
  // const [subscribers] = useState({});
  const [subscribers, setSubscribers] = useState(null);
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
    getAllSubscribers();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllSubscribers();
    setPage(newPage);
  };

  useEffect(() => {
    getAllSubscribers();
  }, []);

  const getAllSubscribers = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/subscriber', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.subscribers);
        const allSubscribers = response.data.subscribers;
        if (!isEmpty(allSubscribers)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setSubscribers(allSubscribers);
        } else {
          setSubscribers([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handelSearch = event => {
    // console.log("in")
    let tempUrl = urlParams;
    tempUrl.search = event.target.value;
    setUrlParams(tempUrl);
    // urlParams.customerName = event.target.value;
    getAllSubscribers();
  };

  return (
    <Page className={classes.root} title="Subscribers">
      <Container maxWidth={false}>
        <Toolbar
          onSearchName={event => {
            handelSearch(event);
          }}
        />
        <Box mt={3}>
          {subscribers ? (
            <Results
              subscribers={subscribers}
              onDelete={getAllSubscribers}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}

              // onDelete={getAllSubscribers}
            />
          ) : null}
        </Box>
      </Container>
    </Page>
  );
};

export default SubscriberView;
