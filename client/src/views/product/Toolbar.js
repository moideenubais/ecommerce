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
  Grid,
  InputLabel,
  MenuItem,
  Select,
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

const Toolbar = ({ className, shops, onSearchName, onCreatedByChange, onSellerChange, ...rest }) => {
  const classes = useStyles();
  const [createdBy, setCreatedBy] = useState('all');
  const [seller, setSeller] = useState(null);

  const createdByArray = [
    { key: 'all', value: 'All' },
    { key: 'admin', value: 'Admin' },
    { key: 'seller', value: 'Seller' }
  ];

  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <Box display="flex" justifyContent="flex-end">
        {/* <Button className={classes.importButton}>
          Import
        </Button>
        <Button className={classes.exportButton}>
          Export
        </Button> */}
        {useHasAuth('product', 'createProduct') && (
          <Button
            color="primary"
            variant="contained"
            component={RouterLink}
            to="/app/products/addProduct"
          >
            Add Product
          </Button>
        )}
      </Box>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon fontSize="small" color="action">
                            <SearchIcon />
                          </SvgIcon>
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search product"
                    variant="outlined"
                    onChange={onSearchName}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <InputLabel id="demo-simple-select-outlined-label">
                      Created By
                    </InputLabel>
                    <Select
                      // fullWidth
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      name="user_type"
                      value={createdBy}
                      onChange={event => {
                        setCreatedBy(event.target.value);
                        onCreatedByChange(event.target.value);
                      }}
                      label="Created By"
                    >
                      {/* <MenuItem value="">
                        <em>None</em>
                      </MenuItem> */}
                      {createdByArray.map(createdBy => {
                        return (
                          <MenuItem key={createdBy.key} value={createdBy.key}>
                            {createdBy.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <InputLabel id="demo-simple-select-outlined-label">
                      Seller
                    </InputLabel>
                    <Select
                      // fullWidth
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      name="user_type"
                      value={seller}
                      onChange={event => {
                        setSeller(event.target.value);
                        onSellerChange(event.target.value);
                      }}
                      label="Seller"
                    >
                      {/* <MenuItem value="">
                        <em>None</em>
                      </MenuItem> */}
                      {shops.map(shop => {
                        return (
                          <MenuItem key={shop._id} value={shop._id}>
                            {shop.i18nResourceBundle.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
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
