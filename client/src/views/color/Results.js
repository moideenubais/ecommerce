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
  },
  colorCircle: {
    width: '18px',
    height: '18px',
    border: '1px solid black',
    marginRight: '10px',
    borderRadius: '50%'
  }
}));

const Results = ({
  className,
  colors,
  page,
  limit,
  total,
  handlePageChange,
  handleLimitChange,
  // onUpdateFeature,
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
  const editable = useHasAuth('color', 'getSingleColor');
  const updatable = useHasAuth('color', 'updateColor');
  const delelteble = useHasAuth('color', 'deleteColor');

  const handleDelete = (color, index) => {
    axios
      .delete(CONSTANTS.BASE_URL + 'api/color/' + color._id)
      .then(response => {
        setconfirmOpen(false);
        color.openConfirm = false;
        colors[index] = color;

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
    colors[index] = cus;
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    cus.openConfirm = false;
    colors[index] = cus;
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
                    checked={selectedCustomerIds.length === colors.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < colors.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
                {/* <TableCell>Icon</TableCell>
                <TableCell>Featured</TableCell> */}
                {editable && updatable && <TableCell></TableCell>}
                {delelteble && <TableCell></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {colors.slice(0, limit).map((color, index) => (
                <TableRow
                  key={color._id}
                  // selected={selectedCustomerIds.indexOf(color.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(color.id) !== -1}
                      onChange={(event) => handleSelectOne(event, color.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      <Box
                        className={classes.colorCircle}
                        style={{ backgroundColor: color.value }}
                        // src={color.avatarUrl}
                        // style={{color:color.value}}
                      ></Box>
                      <Typography variant="body1">
                        {color.i18nResourceBundle.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{color.value}</TableCell>

                  {editable && updatable && (
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        className={classes.editButton}
                        onClick={() => {
                          navigate(
                            '/app/products/colors/editColor/' + color._id,
                            {
                              replace: false
                            }
                          );
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                  {/* <div className={classes.horizontalSpace}></div> */}
                  {delelteble && (
                    <TableCell>
                      <IconButton
                        color="error"
                        className={classes.dangerButton}
                        onClick={() => {
                          handleDeleteConfirm(color, index);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {confirmOpen ? (
                        <AlertDialog
                          open={color.openConfirm}
                          handleClose={() => {
                            handleConfirmclose(color, index);
                          }}
                          handleConfirm={() => {
                            handleDelete(color, index);
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
                    {moment(color.createdAt).format('DD/MM/YYYY')}
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
  colors: PropTypes.array.isRequired
};

export default Results;
