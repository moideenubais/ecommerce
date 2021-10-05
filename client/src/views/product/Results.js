import React, { useState, useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles,
  Switch,
  FormControlLabel,
  IconButton,
  colors
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';
import CONSTANTS from 'src/constants';
import { useNavigate } from 'react-router-dom';
import SimpleModal from '../../components/Modal/Modal';
import AlertDialog from '../../components/confirmModal/confirmModal';
import axios from 'axios';
import { isEmpty, isUndefined } from 'lodash';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useHasAuth } from 'src/hooks/use-Auth';
import AuthContext from 'src/context/auth-context';

const useStyles = makeStyles(theme => ({
  root: {},
  avatar: {
    marginRight: theme.spacing(2)
  },
  dangerButton: {
    color: colors.red[500]
    // color: 'white'
  },
  productImage: {
    // color: colors.red[500],
    width: '600px'
    // color: 'white'
  },
  // iconImage: {
  //   // color: colors.red[500],
  //   width:"32px"
  //   // color: 'white'
  // },
  horizontalSpace: {
    display: 'inline-table',
    width: '30px',
    height: '10px'
  },
  cellStyle: {
    whiteSpace: 'normal',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    height: '100%'
    // width: '123px',
    // display: 'block',
    // minWidth: '123px'
    //   '& *':{

    // }
  }
}));

const Results = ({
  className,
  products,
  page,
  limit,
  total,
  handlePageChange,
  handleLimitChange,
  onUpdateFeature,
  onUpdateTodaysDeal,
  onUpdatePublish,
  onDelete,
  ...rest
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [confirmOpen, setconfirmOpen] = useState(false);
  const [modalBody, setModalBody] = useState({
    title: 'Delete',
    content: 'Are you sure'
  });
  const [cancelButtonAsOk, setCancelButtonAsOk] = useState('CANCEL');
  const [confirmDialog, setConfirmDialog] = useState(true);
  const editable = useHasAuth('product', 'getSingleProduct');
  const updatable = useHasAuth('product', 'updateProduct');
  const deleteble = useHasAuth('product', 'deleteProduct');
  const { user } = useContext(AuthContext);

  const handleDelete = (product, index) => {
    axios
      .delete(CONSTANTS.BASE_URL + 'api/product/' + product._id)
      .then(response => {
        setconfirmOpen(false);
        product.openConfirm = false;
        products[index] = product;

        onDelete();
      })
      .catch(error => {
        setModalBody({ title: 'Error', content: error.response.data.error });
        setCancelButtonAsOk('OK');
        setConfirmDialog(false);
        // onDelete();
        console.log(error.response);
      });
  };
  const handleDeleteConfirm = (cus, index) => {
    setCancelButtonAsOk('CANCEL');
    setConfirmDialog(true);
    setconfirmOpen(true);
    cus.openConfirm = true;
    products[index] = cus;
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    cus.openConfirm = false;
    products[index] = cus;
    setconfirmOpen(false);
    setModalBody({ title: 'Delete', content: 'Are you sure' });
    setCancelButtonAsOk('Confirm');
    onDelete();
  };

  function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
  }

  return (
    <Card className={clsx(classes.root, className)} {...rest}>
      <PerfectScrollbar>
        <Box minWidth={1050}>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCustomerIds.length === products.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < products.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>Name</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Info</TableCell>
                <TableCell>Total Stock</TableCell>
                <TableCell>Today's Deal</TableCell>
                <TableCell>Published</TableCell>
                <TableCell>Featured</TableCell>
                {editable && updatable && <TableCell></TableCell>}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.slice(0, limit).map((product, index) => (
                <TableRow
                  hover
                  key={product._id}
                  // selected={selectedCustomerIds.indexOf(product.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(product.id) !== -1}
                      onChange={(event) => handleSelectOne(event, product.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      {/* <Avatar
                        className={classes.avatar}
                        src={product.avatarUrl}
                      >
                        {getInitials(product.name)}
                      </Avatar> */}
                      {product.product_image_big ? (
                        <img
                          className={classes.productImage}
                          src={CONSTANTS.BASE_URL + product.product_image_big}
                          alt="product iamge"
                        />
                      ) : null}
                      <Typography color="textPrimary" variant="body1">
                        {product.i18nResourceBundle.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{capitalize(product.created_by)}</TableCell>
                  <TableCell>
                    {!isUndefined(product.num_of_sale) ? (
                      <div>
                        <span style={{ 'font-weight': 'bold' }}>
                          No. of Sale:{' '}
                        </span>
                        {product.num_of_sale}
                      </div>
                    ) : null}
                    {product.base_price ? (
                      <div>
                        <span style={{ 'font-weight': 'bold' }}>
                          Base Price:{' '}
                        </span>
                        {product.base_price}
                      </div>
                    ) : null}
                    {product.rating ? (
                      <div>
                        <span style={{ 'font-weight': 'bold' }}>Rating: </span>
                        {product.rating}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {product.varient_stock
                      ? product.varient_stock.map((varient, index) => (
                          <div key={index + varient.varient_value}>
                            {varient.varient_value}: {varient.quantity}
                          </div>
                        ))
                      : null}
                  </TableCell>
                  {/* <TableCell>
                    {product.banner_url?<img className={classes.bannerImage} src={CONSTANTS.BASE_URL+product.banner_url} alt="banner" />:"No Image"}
                  </TableCell> */}
                  {/* <TableCell>
                    {product.icon_url?<img className={classes.iconImage} src={CONSTANTS.BASE_URL+product.icon_url} alt="icon" />:"No Image"}
                  </TableCell> */}
                  <TableCell>
                    <Switch
                      checked={product.todays_deal}
                      onChange={() => {
                        onUpdateTodaysDeal(product, index);
                      }}
                      name="checkedTodaysDeal"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.publish}
                      onChange={() => {
                        onUpdatePublish(product, index);
                      }}
                      name="checkedPublish"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.featured}
                      onChange={() => {
                        onUpdateFeature(product, index);
                      }}
                      name="checkedFeature"
                    />
                  </TableCell>
                  {editable && updatable && (
                    <TableCell align="right">
                      {((user.user_type === 'seller' &&
                        user._id == product.created_by_id) ||
                        user.user_type !== 'seller') && (
                        <IconButton
                          color="primary"
                          className={classes.editButton}
                          onClick={() => {
                            navigate(
                              '/app/products/editProduct/' + product._id,
                              {
                                replace: false
                              }
                            );
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                  {/* <div className={classes.horizontalSpace}></div> */}
                  {deleteble && (
                    <TableCell>
                      {((user.user_type === 'seller' &&
                        user._id == product.created_by_id) ||
                        user.user_type !== 'seller') && (
                        <IconButton
                          color="error"
                          className={classes.dangerButton}
                          onClick={() => {
                            handleDeleteConfirm(product, index);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      {confirmOpen ? (
                        <AlertDialog
                          open={product.openConfirm}
                          handleClose={() => {
                            handleConfirmclose(product, index);
                          }}
                          handleConfirm={() => {
                            handleDelete(product, index);
                          }}
                          content={modalBody.content}
                          title={modalBody.title}
                          confirmDialog={confirmDialog}
                          cancelButtonAsOk={cancelButtonAsOk}
                        />
                      ) : null}
                    </TableCell>
                  )}
                  {/* <TableCell>
                    {moment(product.createdAt).format('DD/MM/YYYY')}
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={total}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

Results.propTypes = {
  className: PropTypes.string,
  products: PropTypes.array.isRequired
};

export default Results;
