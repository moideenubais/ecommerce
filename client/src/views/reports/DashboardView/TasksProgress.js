import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  makeStyles,
  colors
} from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';
import CategoryIcon from '@material-ui/icons/Category';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.orange[600],
    height: 56,
    width: 56
  }
}));

const TasksProgress = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
          spacing={3}
        >
          <Grid item >
            <Typography
              color="textSecondary"
              gutterBottom
              variant="h6"
            >
              TOTAL CATEGORIES
            </Typography>
            <Typography
              color="textPrimary"
              variant="h3"
            >
              {rest.totalCategories}
            </Typography>
          </Grid>
          <Grid item>
            <Avatar className={classes.avatar}>
              <CategoryIcon />
            </Avatar>
          </Grid>
        </Grid>
        {/* <Box mt={3}>
          <LinearProgress
            value={75.5}
            variant="determinate"
          />
        </Box> */}
      </CardContent>
    </Card>
  );
};

TasksProgress.propTypes = {
  className: PropTypes.string
};

export default TasksProgress;
