import React, {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  makeStyles,
  InputLabel,
  Select,
  MenuItem,
  FormControl
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';
import { NavLink as RouterLink } from 'react-router-dom';
import { useHasAuth } from 'src/hooks/use-Auth';

const useStyles = makeStyles(theme => ({
  root: {},
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  }
}));

const Toolbar = ({ className, onFilterChange,filter, ...rest }) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <Box display="flex" justifyContent="flex-end">
        {/* <Button className={classes.importButton}>
          Import
        </Button>
        <Button className={classes.exportButton}>
          Export
        </Button> */}
        {useHasAuth('review', 'createReview') && (
          <Button
            color="primary"
            variant="contained"
            component={RouterLink}
            to="/app/products/reviews/addReview"
          >
            Add Review
          </Button>
        )}
      </Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box maxWidth={500} display="flex" flexDirection="row-reverse">
              <FormControl
                fullWidth
                variant="outlined"
                className={classes.formControl}
              >
                <InputLabel id="category_id_label">Filter by rating</InputLabel>
                <Select
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  labelId="category_id_label"
                  id="ad_type"
                  name="ad_type"
                  value={filter}
                  onChange={onFilterChange}
                  label="Filter by rating"
                >
                  {[
                    { key: 'high_to_low', name: 'Rating(High > Low)' },
                    { key: 'low_to_high', name: 'Rating(Low > High)' }
                  ].map(filterType => {
                    return (
                      <MenuItem key={filterType.key} value={filterType.key}>
                        {filterType.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

Toolbar.propTypes = {
  className: PropTypes.string
};

export default Toolbar;
