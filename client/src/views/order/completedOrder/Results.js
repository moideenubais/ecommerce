import React, { useState } from 'react';
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
  colors,
  Button
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';
import CONSTANTS from 'src/constants';
import { useNavigate } from 'react-router-dom';
import SimpleModal from '../../../components/Modal/Modal';
import AlertDialog from '../../../components/confirmModal/confirmModal';
import axios from 'axios';
import { isEmpty } from 'lodash';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';

const useStyles = makeStyles(theme => ({
  root: {},
  avatar: {
    marginRight: theme.spacing(2)
  },
  dangerButton: {
    color: colors.red[500]
    // color: 'white'
  },
  logoImage: {
    // color: colors.red[500],
    width: '120px'
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
  orders,
  page,
  limit,
  total,
  handlePageChange,
  handleLimitChange,
  // onUpdateFeature,
  onUpdateDeliveryStatus,
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

  const handleDeliveryConfirm = (order, index) => {
    axios
      .put(CONSTANTS.BASE_URL + 'api/order/updateDeliveryStatus' + order._id)
      .then(response => {
        setconfirmOpen(false);
        order.openConfirm = false;
        orders[index] = order;

        onUpdateDeliveryStatus();
      })
      .catch(error => {
        setModalBody({ title: 'Error', content: error.response.data.err });
        setCancelButtonAsOk('OK');
        setConfirmDialog(false);
        // onUpdateDeliveryStatus();
        console.log(error.response);
      });
  };
  const handlePaymentConfirm = (order, index) => {
    axios
      .put(CONSTANTS.BASE_URL + 'api/order/updatePaymentStatus' + order._id)
      .then(response => {
        setconfirmOpen(false);
        order.openConfirmStatus = false;
        orders[index] = order;

        onUpdateDeliveryStatus();
      })
      .catch(error => {
        setModalBody({ title: 'Error', content: error.response.data.err });
        setCancelButtonAsOk('OK');
        setConfirmDialog(false);
        // onUpdateDeliveryStatus();
        console.log(error.response);
      });
  };
  const handleDeliveryComplete = (cus, index) => {
    setCancelButtonAsOk('CANCEL');
    setConfirmDialog(true);
    setconfirmOpen(true);
    cus.openConfirmStatus = true;
    orders[index] = cus;
    // console.log("got here", cus);
  };

  const setPaymentCompleted = (cus, index) => {
    setCancelButtonAsOk('CANCEL');
    setConfirmDialog(true);
    setconfirmOpen(true);
    cus.openConfirm = true;
    orders[index] = cus;
    setModalBody({
      title: 'Confirm Payment Completion',
      content: 'Are you sure'
    });
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    if (cus.openConfirm) cus.openConfirm = false;
    if (cus.openConfirmStatus) cus.openConfirmStatus = false;
    orders[index] = cus;
    setconfirmOpen(false);
    setModalBody({
      title: 'Confirm Delivery Completion',
      content: 'Are you sure'
    });
    setCancelButtonAsOk('Confirm');
    onUpdateDeliveryStatus();
  };

  return (
    <Card className={clsx(classes.root, className)} {...rest}>
      <PerfectScrollbar>
        <Box minWidth={1050}>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCustomerIds.length === orders.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < orders.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>Order Code</TableCell>
                <TableCell>No. of Products</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Delivery Status</TableCell>
                <TableCell>Payment Status</TableCell>
                {/* <TableCell>Icon</TableCell>
                <TableCell>Featured</TableCell> */}
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(0, limit).map((order, index) => (
                <TableRow
                  hover
                  key={order._id}
                  // selected={selectedCustomerIds.indexOf(order.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(order.id) !== -1}
                      onChange={(event) => handleSelectOne(event, order.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>{order.order_code}</TableCell>
                  <TableCell>{order.no_of_products}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.total_amount}</TableCell>
                  <TableCell>{order.delivery_status}</TableCell>
                  <TableCell>{order.payment_status}</TableCell>
                  {/* <TableCell>
                    <Box alignItems="center" display="flex">
                      <Typography color="textPrimary" variant="body1">
                        {order.i18nResourceBundle.name}
                      </Typography>
                    </Box>
                  </TableCell> */}
                  {/* <TableCell>
                    {order.logo_url?<img className={classes.logoImage} src={CONSTANTS.BASE_URL+order.logo_url} alt="logo" />:"No Logo"}
                  </TableCell> */}
                  {/* <TableCell>
                    {order.icon_url?<img className={classes.iconImage} src={CONSTANTS.BASE_URL+order.icon_url} alt="icon" />:"No Image"}
                  </TableCell> */}
                  {/* <TableCell>
                        <Switch
                          checked={order.featured}
                          onChange={()=>{onUpdateFeature(order, index)}}
                          name="checkedFeature"
                        />
                  </TableCell> */}
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      className={classes.editButton}
                      onClick={() => {
                        navigate('/app/orders/completedDelivery/' + order._id, {
                          replace: false
                        });
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  {/* <div className={classes.horizontalSpace}></div> */}
                  {/* {order.payment_method === 'cod' && order.payment_status === 'unpaid' && (
                    <TableCell>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={()=>{setPaymentCompleted(order, index)}}
                      >
                        set as paid
                      </Button>
                    </TableCell>
                  )} */}
                  {/* <TableCell>
                    {order.payment_status === 'paid' && <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        handleDeliveryComplete(order, index);
                      }}
                    >
                      set as Delivered
                    </Button>}
                    {confirmOpen ? (
                      <>
                        <AlertDialog
                          open={order.openConfirm}
                          handleClose={() => {
                            handleConfirmclose(order, index);
                          }}
                          handleConfirm={() => {
                            handleDeliveryConfirm(order, index);
                          }}
                          content={modalBody.content}
                          title={modalBody.title}
                          confirmDialog={confirmDialog}
                          cancelButtonAsOk={cancelButtonAsOk}
                        />
                        <AlertDialog
                          open={order.openConfirmStatus}
                          handleClose={() => {
                            handleConfirmclose(order, index);
                          }}
                          handleConfirm={() => {
                            handlePaymentConfirm(order, index);
                          }}
                          content={modalBody.content}
                          title={modalBody.title}
                          confirmDialog={confirmDialog}
                          cancelButtonAsOk={cancelButtonAsOk}
                        />
                      </>
                    ) : null}
                  </TableCell> */}
                  {/* <TableCell>
                    {moment(order.createdAt).format('DD/MM/YYYY')}
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
  orders: PropTypes.array.isRequired
};

export default Results;
