import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import Budget from './Budget';
import LatestOrders from './LatestOrders';
import LatestProducts from './LatestProducts';
import Sales from './CategoryProductSale';
import BrandSales from './BrandProductSale';
import TasksProgress from './TasksProgress';
import TotalCustomers from './TotalCustomers';
import TotalProfit from './TotalProfit';
import TrafficByDevice from './TrafficByDevice';
import axios from 'axios';

import CONSTANTS from '../../../constants';
import { DateRange } from '@material-ui/icons';

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
  const [brandData, setBrandData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  const getStartAndEndDate = key => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = new Date(today);
    switch (key) {
      case 'today':
        return {
          startDate: today,
          endDate: endDate
        };
      case 'week':
        return {
          startDate: new Date(today.setDate(today.getDate() - 7)),
          endDate: endDate
        };
      case 'month':
        return {
          startDate: new Date(today.setMonth(today.getMonth() - 1)),
          endDate: endDate
        };
      case 'year':
        return {
          startDate: new Date(today.setFullYear(today.getFullYear() - 1)),
          endDate: endDate
        };
    }
  };
  const dateRanges = [
    { key: 'today', value: 'Today' },
    { key: 'week', value: 'Last One Week' },
    { key: 'month', value: 'Last One Month' },
    { key: 'year', value: 'Last One Year' }
  ];
  const [brandRange, setBrandRange] = useState(dateRanges[0]);
  const [categoryRange, setCategoryRange] = useState(dateRanges[0]);

  useEffect(() => {
    getReportData();
    getBrandData();
    getCategoryData();
  }, []);

  const getReportData = () => {
    axios
      .get(CONSTANTS.BASE_URL + 'api/report')
      .then(response => {
        const reportData = response.data;
        console.log('data', reportData);
        setReportData(reportData);
      })
      .catch(error => {
        console.log(error);
      });
  };
  const getBrandData = brandDateRange => {
    if (!brandDateRange) brandDateRange = brandRange;
    const urlParams = getStartAndEndDate(brandDateRange.key);

    axios
      .get(CONSTANTS.BASE_URL + 'api/report/getGraphDataForBrand', {
        params: urlParams
      })
      .then(response => {
        const brandData = response.data.brandWiseProducts;
        console.log('brand data', brandData);
        setBrandData(brandData);
      })
      .catch(error => {
        console.log(error);
      });
  };
  const getCategoryData = categoryDateRange => {
    if (!categoryDateRange) categoryDateRange = categoryRange;
    const urlParams = getStartAndEndDate(categoryDateRange.key);
    axios
      .get(CONSTANTS.BASE_URL + 'api/report/getGraphDataForCategory', {
        params: urlParams
      })
      .then(response => {
        const categoryData = response.data.categoryWiseProducts;
        console.log('catory data', categoryData);
        setCategoryData(categoryData);
      })
      .catch(error => {
        console.log(error);
      });
  };
  const handleBrandRangeChange = event => {
    const index = dateRanges.findIndex(
      dateRange => dateRange.key === event.target.value
    );
    setBrandRange(dateRanges[index]);
    getBrandData(dateRanges[index]);
  };
  const handleCategoryRangeChange = event => {
    const index = dateRanges.findIndex(
      dateRange => dateRange.key === event.target.value
    );
    setCategoryRange(dateRanges[index]);
    getCategoryData(dateRanges[index]);
  };

  return (
    reportData &&
    brandData &&
    categoryData && (
      <Page className={classes.root} title="Dashboard">
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <Budget totalOrders={reportData.orderCount} />
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <TotalCustomers totalUsers={reportData.userCount} />
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <TasksProgress totalCategories={reportData.categories.length} />
            </Grid>
            <Grid item lg={3} sm={6} xl={3} xs={12}>
              <TotalProfit totalBrands={reportData.brands.length} />
            </Grid>
            <Grid item lg={6} md={12} xl={6} xs={12}>
              <Sales
                ranges={dateRanges}
                range={categoryRange}
                onRangeChange={handleCategoryRangeChange}
                categories={reportData.categories}
                categoryWiseProducts={categoryData}
              />
            </Grid>
            <Grid item lg={6} md={12} xl={6} xs={12}>
              <BrandSales
                ranges={dateRanges}
                range={brandRange}
                onRangeChange={handleBrandRangeChange}
                categories={reportData.brands}
                brandWiseProducts={brandData}
              />
            </Grid>
            {/* <Grid item lg={4} md={6} xl={3} xs={12}>
            <TrafficByDevice />
          </Grid>
          <Grid item lg={4} md={6} xl={3} xs={12}>
            <LatestProducts />
          </Grid>
          <Grid item lg={8} md={12} xl={9} xs={12}>
            <LatestOrders />
          </Grid> */}
          </Grid>
        </Container>
      </Page>
    )
  );
};

export default Dashboard;
