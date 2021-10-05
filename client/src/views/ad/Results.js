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
  bannerImage: {
    // color: colors.red[500],
    width: '200px'
    // color: 'white'
  },
  iconImage: {
    // color: colors.red[500],
    width: '32px'
    // color: 'white'
  },
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
  },
  uploadBigImage: {
    // height: '100px',
    maxWidth: '500px',
    margin: '10px'
  }
}));

const Results = ({
  className,
  ads,
  page,
  limit,
  total,
  handlePageChange,
  handleLimitChange,
  onUpdateFeature,
  onUpdateStatus,
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
  const editable = useHasAuth('ad', 'getSingleAd');
  const updatable = useHasAuth('ad', 'updateAd');
  const deleteble = useHasAuth('ad', 'deleteAd');

  const getImages = images => {
    return images.map((image, index) => (
      <img
        className={classes.uploadBigImage}
        src={CONSTANTS.BASE_URL + image}
        key={index + image}
      />
    ));
  };

  const handleDelete = (ad, index) => {
    axios
      .delete(CONSTANTS.BASE_URL + 'api/ad/' + ad._id)
      .then(response => {
        setconfirmOpen(false);
        ad.openConfirm = false;
        ads[index] = ad;

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
    ads[index] = cus;
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    cus.openConfirm = false;
    ads[index] = cus;
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
                    checked={selectedCustomerIds.length === ads.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < ads.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Images</TableCell>
                {/* <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Featured</TableCell> */}
                {editable && updatable && <TableCell></TableCell>}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ads.slice(0, limit).map((ad, index) => (
                <TableRow
                  hover
                  key={ad._id}
                  // selected={selectedCustomerIds.indexOf(ad.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(ad.id) !== -1}
                      onChange={(event) => handleSelectOne(event, ad.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>{page * limit + index + 1}</TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      {/* <Avatar
                        className={classes.avatar}
                        src={ad.avatarUrl}
                      >
                        {getInitials(ad.name)}
                      </Avatar> */}
                      <Typography color="textPrimary" variant="body1">
                        {ad.name ? ad.name : ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{ad.ad_type}</TableCell>
                  <TableCell>
                    {ad.ad_url ? getImages(ad.ad_url) : 'No Image'}
                  </TableCell>
                  {/* <TableCell>
                    {ad.icon_url?<img className={classes.iconImage} src={CONSTANTS.BASE_URL+ad.icon_url} alt="icon" />:"No Image"}
                  </TableCell> */}
                  {/* <TableCell>{
                    moment(ad.duration.from).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{
                                        moment(ad.duration.to).format('DD/MM/YYYY')
                                      }
                    </TableCell> */}
                  {/* <TableCell>
                        <Switch
                          checked={ad.status}
                          onChange={()=>{onUpdateStatus(ad, index)}}
                          name="checkedStatus"
                        />
                  </TableCell>
                  <TableCell>
                        <Switch
                          checked={ad.featured}
                          onChange={()=>{onUpdateFeature(ad, index)}}
                          name="checkedFeature"
                        />
                  </TableCell> */}
                  {editable && updatable && (
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        className={classes.editButton}
                        onClick={() => {
                          navigate('/app/marketing/ads/editAd/' + ad._id, {
                            replace: false
                          });
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                  {/* <div className={classes.horizontalSpace}></div> */}
                  {deleteble && (
                    <TableCell>
                      <IconButton
                        color="error"
                        className={classes.dangerButton}
                        onClick={() => {
                          handleDeleteConfirm(ad, index);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {confirmOpen ? (
                        <AlertDialog
                          open={ad.openConfirm}
                          handleClose={() => {
                            handleConfirmclose(ad, index);
                          }}
                          handleConfirm={() => {
                            handleDelete(ad, index);
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
                    {moment(ad.createdAt).format('DD/MM/YYYY')}
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
  ads: PropTypes.array.isRequired
};

export default Results;
