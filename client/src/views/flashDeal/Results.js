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
import CONSTANTS from "src/constants";
import { useNavigate } from "react-router-dom";
import SimpleModal from "../../components/Modal/Modal";
import AlertDialog from "../../components/confirmModal/confirmModal";
import axios from "axios";
import { isEmpty } from "lodash";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { useHasAuth } from 'src/hooks/use-Auth';

const useStyles = makeStyles(theme => ({
  root: {},
  avatar: {
    marginRight: theme.spacing(2)
  },
  dangerButton: {
    color: colors.red[500],
    // color: 'white'
  },
  bannerImage: {
    // color: colors.red[500],
    width:"200px"
    // color: 'white'
  },
  iconImage: {
    // color: colors.red[500],
    width:"32px"
    // color: 'white'
  },
  horizontalSpace: {
    display: "inline-table",
    width: "30px",
    height: "10px",
  },
  cellStyle: {
    whiteSpace: "normal",
    textOverflow: "ellipsis",
    overflow: "hidden",
    height: "100%",
    // width: '123px',
    // display: 'block',
    // minWidth: '123px'
    //   '& *':{

    // }
  },
}));

const Results = ({
  className,
  flashDeals,
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
    title: "Delete",
    content: "Are you sure",
  });
  const [cancelButtonAsOk, setCancelButtonAsOk] = useState("CANCEL");
  const [confirmDialog, setConfirmDialog] = useState(true);
  const editable = useHasAuth('flash','getSingleFlash');
  const updatable = useHasAuth('flash','updateFlash');
  const deleteble = useHasAuth('flash','deleteFlash');

  const handleDelete = (flashDeal, index) => {
    axios
      .delete(CONSTANTS.BASE_URL + "api/flash/" + flashDeal._id)
      .then((response) => {
        setconfirmOpen(false);
        flashDeal.openConfirm = false;
        flashDeals[index] = flashDeal;

        onDelete();
      })
      .catch((error) => {
        setModalBody({ title: "Error", content: error.response.data.error });
        setCancelButtonAsOk("OK");
        setConfirmDialog(false);
        // onDelete();
        console.log(error.response);
      });
  };
  const handleDeleteConfirm = (cus, index) => {
    setCancelButtonAsOk("CANCEL");
    setConfirmDialog(true);
    setconfirmOpen(true);
    cus.openConfirm = true;
    flashDeals[index] = cus;
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    cus.openConfirm = false;
    flashDeals[index] = cus;
    setconfirmOpen(false);
    setModalBody({ title: "Delete", content: "Are you sure" });
    setCancelButtonAsOk("Confirm");
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
                    checked={selectedCustomerIds.length === flashDeals.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < flashDeals.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Banner</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Featured</TableCell>
                {editable && updatable &&<TableCell></TableCell>}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flashDeals.slice(0, limit).map((flashDeal, index) => (
                <TableRow
                  hover
                  key={flashDeal._id}
                  // selected={selectedCustomerIds.indexOf(flashDeal.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(flashDeal.id) !== -1}
                      onChange={(event) => handleSelectOne(event, flashDeal.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>
                  {page * limit + index + 1}
                    </TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      {/* <Avatar
                        className={classes.avatar}
                        src={flashDeal.avatarUrl}
                      >
                        {getInitials(flashDeal.name)}
                      </Avatar> */}
                      <Typography color="textPrimary" variant="body1">
                        {flashDeal.i18nResourceBundle.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {flashDeal.banner_url?<img className={classes.bannerImage} src={CONSTANTS.BASE_URL+flashDeal.banner_url} alt="banner" />:"No Image"}
                  </TableCell>
                  {/* <TableCell>
                    {flashDeal.icon_url?<img className={classes.iconImage} src={CONSTANTS.BASE_URL+flashDeal.icon_url} alt="icon" />:"No Image"}
                  </TableCell> */}
                  <TableCell>{
                    moment(flashDeal.duration.from).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{
                                        moment(flashDeal.duration.to).format('DD/MM/YYYY')
                                      }
                    </TableCell>
                  <TableCell>
                        <Switch
                          checked={flashDeal.status}
                          onChange={()=>{onUpdateStatus(flashDeal, index)}}
                          name="checkedStatus"
                        />
                  </TableCell>
                  <TableCell>
                        <Switch
                          checked={flashDeal.featured}
                          onChange={()=>{onUpdateFeature(flashDeal, index)}}
                          name="checkedFeature"
                        />
                  </TableCell>
                 {editable && updatable && <TableCell align="right">
                    <IconButton
                      color="primary"
                      className={classes.editButton}
                      onClick={() => {
                        navigate("/app/marketing/flashDeals/editFlashDeal/" + flashDeal._id, {
                          replace: false,
                        });
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    </TableCell>}
                    {/* <div className={classes.horizontalSpace}></div> */}
                    {deleteble && <TableCell>
                    <IconButton
                      color="error"
                      className={classes.dangerButton}
                      onClick={() => {
                        handleDeleteConfirm(flashDeal, index);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {confirmOpen ? (
                      <AlertDialog
                        open={flashDeal.openConfirm}
                        handleClose={() => {
                          handleConfirmclose(flashDeal, index);
                        }}
                        handleConfirm={() => {
                          handleDelete(flashDeal, index);
                        }}
                        content={modalBody.content}
                        title={modalBody.title}
                        confirmDialog={confirmDialog}
                        cancelButtonAsOk={cancelButtonAsOk}
                      />
                    ) : null}
                  </TableCell>}
                  {/* <TableCell>
                    {moment(flashDeal.createdAt).format('DD/MM/YYYY')}
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
  flashDeals: PropTypes.array.isRequired
};

export default Results;
