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
  colors
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';
import CONSTANTS from 'src/constants';
import { useNavigate } from 'react-router-dom';
import SimpleModal from '../../components/Modal/Modal';
import AlertDialog from '../../components/confirmModal/confirmModal';
import axios from 'axios';
import { isEmpty } from 'lodash';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useHasAuth } from 'src/hooks/use-Auth';

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
  reviews,
  page,
  limit,
  total,
  handlePageChange,
  handleLimitChange,
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
  const editable = useHasAuth('review', 'getSingleReview');
  const updatable = useHasAuth('review', 'updateReview');
  const delelteble = useHasAuth('review', 'deleteReview');

  const handleDelete = (review, index) => {
    axios
      .delete(CONSTANTS.BASE_URL + 'api/review/' + review._id)
      .then(response => {
        setconfirmOpen(false);
        review.openConfirm = false;
        reviews[index] = review;

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
    reviews[index] = cus;
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    cus.openConfirm = false;
    reviews[index] = cus;
    setconfirmOpen(false);
    setModalBody({ title: 'Delete', content: 'Are you sure' });
    setCancelButtonAsOk('Confirm');
    onDelete();
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
                    checked={selectedCustomerIds.length === reviews.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < reviews.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>#</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Product Owner</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Rating</TableCell>
                {/* <TableCell>Comment</TableCell> */}
                <TableCell>Published</TableCell>
                {/* {editable && updatable && <TableCell></TableCell>} */}
                {delelteble && <TableCell></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.slice(0, limit).map((review, index) => (
                <TableRow
                  hover
                  key={review._id}
                  // selected={selectedCustomerIds.indexOf(review.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(review.id) !== -1}
                      onChange={(event) => handleSelectOne(event, review.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      {/* <Avatar
                        className={classes.avatar}
                        src={review.avatarUrl}
                      >
                        {getInitials(review.name)}
                      </Avatar> */}
                      <Typography color="textPrimary" variant="body1">
                        {review.productI18nResourceBundle.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{review.product_owner}</TableCell>
                  <TableCell>{review.customer_name}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  {/* <TableCell>{review.comment ?review.comment :''}</TableCell> */}
                  
                  <TableCell>
                    <Switch
                      checked={review.publish}
                      onChange={() => {
                        onUpdatePublish(review, index);
                      }}
                      name="checkedPublish"
                    />
                  </TableCell>
                  {/* {editable && updatable && (
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        className={classes.editButton}
                        onClick={() => {
                          navigate(
                            '/app/products/reviews/editReview/' + review._id,
                            {
                              replace: false
                            }
                          );
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )} */}
                  {/* <div className={classes.horizontalSpace}></div> */}
                  {delelteble && (
                    <TableCell>
                      <IconButton
                        color="error"
                        className={classes.dangerButton}
                        onClick={() => {
                          handleDeleteConfirm(review, index);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {confirmOpen ? (
                        <AlertDialog
                          open={review.openConfirm}
                          handleClose={() => {
                            handleConfirmclose(review, index);
                          }}
                          handleConfirm={() => {
                            handleDelete(review, index);
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
                    {moment(review.createdAt).format('DD/MM/YYYY')}
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
  reviews: PropTypes.array.isRequired
};

export default Results;
