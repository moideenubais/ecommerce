import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  makeStyles,
  colors,
  FormControl,
  MenuItem,
  Select
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { find, isEmpty } from 'lodash';

const useStyles = makeStyles(() => ({
  root: {}
}));

const Sales = ({
  className,
  range,
  ranges,
  onRangeChange,
  categories,
  brandWiseProducts,
  ...rest
}) => {
  const classes = useStyles();
  const theme = useTheme();
  // if(isEmpty(categories))
  //   categories = ["cat1","cat2","cat3","cat4","cat5"];
  let brandLabels = categories.map(cat => cat.name);
  let brandData = [];
  categories.forEach(cat => {
    let brandExist = find(brandWiseProducts, catWiseProduct => {
      return catWiseProduct._id == cat._id;
    });
    if (isEmpty(brandExist)) brandData.push(0);
    else brandData.push(brandExist.sold);
  });

  const data = {
    datasets: [
      {
        backgroundColor: colors.purple[500],
        data: brandData,
        label: 'Number of sale'
      }
      // {
      //   backgroundColor: colors.grey[200],
      //   data: [11, 20, 12, 29, 30, 25, 13],
      //   label: 'Last year'
      // }
    ],
    labels: brandLabels
  };

  const options = {
    // animation: false,
    // cornerRadius: 20,
    // layout: { padding: 0 },
    // legend: { display: false },
    maintainAspectRatio: false,
    // responsive: true,
    scales: {
      xAxes: [
        {
          // barThickness: 12,
          // maxBarThickness: 10,
          barPercentage: 0.5,
          brandPercentage: 0.5,
          ticks: {
            beginAtZero: true,
            fontColor: theme.palette.text.secondary
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            fontColor: theme.palette.text.secondary,
            beginAtZero: true,
            min: 0
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: theme.palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: theme.palette.divider
          }
        }
      ]
    }
    // tooltips: {
    //   backgroundColor: theme.palette.background.default,
    //   bodyFontColor: theme.palette.text.secondary,
    //   borderColor: theme.palette.divider,
    //   borderWidth: 1,
    //   enabled: true,
    //   footerFontColor: theme.palette.text.secondary,
    //   intersect: false,
    //   mode: 'index',
    //   titleFontColor: theme.palette.text.primary
    // }
  };

  return (
    categories && (
      <Card className={clsx(classes.root, className)} {...rest}>
        <CardHeader
          action={(
            // <Button
            //   endIcon={<ArrowDropDownIcon />}
            //   size="small"
            //   variant="text"
            // >
            //   Last 7 days
            // </Button>
            <FormControl
              fullWidth
              variant="outlined"
              className={classes.formControl}
            >
              {/* <InputLabel id="language_label">Language</InputLabel> */}
              <Select
                // style={{paddingTop:"5px",paddingBottom:"5px"}}
                sx={{'& .MuiOutlinedInput-input':{paddingTop:"5px",paddingBottom:"5px"}}}
                fullWidth
                // error={Boolean(touched.language && errors.language)}
                // helperText={touched.language && errors.language}
                margin="normal"
                variant="outlined"
                labelId="range_label"
                id="range"
                name="range"
                value={range.key}
                onChange={onRangeChange}
                // label="Language"
              >
                {ranges.map(range => {
                  return (
                    <MenuItem key={range.key} value={range.key}>
                      {range.value}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
          title="Brand wise product sale"
        />
        <Divider />
        <CardContent>
          <Box height={400} position="relative">
            <Bar data={data} options={options} />
          </Box>
        </CardContent>
        <Divider />
        {/* <Box
        display="flex"
        justifyContent="flex-end"
        p={2}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          Overview
        </Button>
      </Box> */}
      </Card>
    )
  );
};

Sales.propTypes = {
  className: PropTypes.string
};

export default Sales;
