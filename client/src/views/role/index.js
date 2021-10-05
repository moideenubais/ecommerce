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

const RoleView = () => {
  const classes = useStyles();
  // const [roles] = useState({});
  const [roles, setRoles] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [urlParams, setUrlParams] = useState({ limit: limit, page: 1, all:1 });
  const [totalRows, setTotalRows] = useState(undefined);
  // const [snackBarOpen, setSnackBarOpen] = useState(false);
  // const [featureUpdated, setfeatureUpdated] = useState(false);

  const handleLimitChange = event => {
    setLimit(event.target.value);
    let tempUrl = urlParams;
    tempUrl.page = page + 1;
    tempUrl.limit = event.target.value;
    setUrlParams(tempUrl);
    getAllRoles();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllRoles();
    setPage(newPage);
  };

  useEffect(() => {
    getAllRoles();
  }, []);

  const getAllRoles = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/role', { params: urlParams })
      .then(response => {
        // console.log("+++++++++++++++++++",response.data.roles);
        const allRoles = response.data.roles;
        if (!isEmpty(allRoles)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          // console.log("totol",totalRows)
          setRoles(allRoles);
        } else {
          setRoles([]);
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
    getAllRoles();
  };

  return (
    <Page className={classes.root} title="Roles">
      <Container maxWidth={false}>
        <Toolbar
        onSearchName={event => {
          handelSearch(event);
        }} />
        <Box mt={3}>
          {roles ? (
            <Results
              roles={roles}
              onDelete={getAllRoles}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={page}
              limit={limit}
              total={totalRows}
            />
          ) : null}
        </Box>
      </Container>
    </Page>
  );
};

export default RoleView;
