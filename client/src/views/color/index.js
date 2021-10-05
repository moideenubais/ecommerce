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

const ColorView = () => {
  const classes = useStyles();
  const [colors, setColors] = useState(null);
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
    getAllColors();
  };

  const handlePageChange = (event, newPage) => {
    let tempUrl = urlParams;
    tempUrl.limit = limit;
    tempUrl.page = newPage + 1;
    setUrlParams(tempUrl);
    getAllColors();
    setPage(newPage);
  };

  useEffect(() => {
    getAllColors();
  }, []);

  const getAllColors = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/color', { params: urlParams })
      .then(response => {
        const allColors = response.data.colors;
        if (!isEmpty(allColors)) {
          const totalRows = response.data.info.totalNumber;
          setTotalRows(totalRows);
          setColors(allColors);
        } else {
          setColors([]);
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
    getAllColors();
  };

  return (
    <Page className={classes.root} title="Colors">
      <Container maxWidth={false}>
        <Toolbar
        onSearchName={event => {
          handelSearch(event);
        }} />
        <Box mt={3}>
          {colors ? (
            <Results
              colors={colors}
              onDelete={getAllColors}
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

export default ColorView;
