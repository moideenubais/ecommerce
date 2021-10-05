import React, { useState, useEffect } from 'react';
import { Box, Container, makeStyles, Snackbar, Slide } from '@material-ui/core';
import Page from 'src/components/Page';
import Results from './Results';
import Toolbar from './Toolbar';
import CONSTANTS from 'src/constants';
import axios from 'axios';
import { isEmpty } from 'lodash';
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const AttributeView = () => {
  const classes = useStyles();
  const [attributes, setAttributes] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [urlParams, setUrlParams] = useState({ limit: limit, page: 1 });
  const [totalRows, setTotalRows] = useState(undefined);

  const handleLimitChange = event => {
    setLimit(event.target.value);
    let tempUrl = urlParams;
    tempUrl.page = page + 1;
    tempUrl.limit = event.target.value;
    setUrlParams(tempUrl);
    getAllAttributes();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllAttributes();
    setPage(newPage);
  };

  useEffect(() => {
    getAllAttributes();
  }, []);

  const getAllAttributes = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/attribute', { params: urlParams })
      .then(response => {
        const allAttributes = response.data.attributes;
        if (!isEmpty(allAttributes)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          setAttributes(allAttributes);
        } else {
          setAttributes([]);
          setTotalRows(0);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handelSearch = event => {
    let tempUrl = urlParams;
    tempUrl.search = event.target.value;
    setUrlParams(tempUrl);
    getAllAttributes();
  };

  return (
    <Page className={classes.root} title="Attributes">
      <Container maxWidth={false}>
        <Toolbar
          onSearchName={event => {
            handelSearch(event);
          }}
        />
        <Box mt={3}>
          {attributes ? (
            <Results
              attributes={attributes}
              onDelete={getAllAttributes}
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

export default AttributeView;
