import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import CardLabelNumber from './CardLabelNumber';

import axios from 'axios';

import CONSTANTS from '../../../constants';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    getReportData();
  }, []);

  const getReportData = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/report/deliveryBoy')
      .then(response => {
        const reportData = response.data;
        console.log('data', reportData);
        setReportData(reportData);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    reportData && (
      <Page className={classes.root} title="Dashboard">
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
              <CardLabelNumber
                number={reportData.completedDelivery}
                label="Completed Delivery"
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <CardLabelNumber
                number={reportData.pendingDelivery}
                label="Pending Delivery"
              />
            </Grid>
          </Grid>
        </Container>
      </Page>
    )
  );
};

export default Dashboard;
