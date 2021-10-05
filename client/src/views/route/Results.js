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
  routes,
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

  const handleDelete = (route, index) => {
    axios
      .delete(CONSTANTS.BASE_URL + 'api/route/' + route._id)
      .then(response => {
        setconfirmOpen(false);
        route.openConfirm = false;
        routes[index] = route;

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
    routes[index] = cus;
    // console.log("got here", cus);
  };

  const handleConfirmclose = (cus, index) => {
    cus.openConfirm = false;
    routes[index] = cus;
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
                    checked={selectedCustomerIds.length === routes.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0
                      && selectedCustomerIds.length < routes.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Paths</TableCell>
                {/* <TableCell>Icon</TableCell>
                <TableCell>Featured</TableCell> */}
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.slice(0, limit).map((route, index) => (
                <TableRow
                  hover
                  key={route._id}
                  // selected={selectedCustomerIds.indexOf(route.id) !== -1}
                >
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCustomerIds.indexOf(route.id) !== -1}
                      onChange={(event) => handleSelectOne(event, route.id)}
                      value="true"
                    />
                  </TableCell> */}
                  <TableCell>{page * limit + index + 1}</TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      {/* <Avatar
                        className={classes.avatar}
                        src={route.avatarUrl}
                      >
                        {getInitials(route.name)}
                      </Avatar> */}
                      <Typography color="textPrimary" variant="body1">
                        {route.route_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {!isEmpty(route.paths)
                      ? route.paths.map(path => <div>{path}</div>)
                      : null}
                  </TableCell>
                  {/* <TableCell>
                    {route.icon_url?<img className={classes.iconImage} src={CONSTANTS.BASE_URL+route.icon_url} alt="icon" />:"No Image"}
                  </TableCell> */}
                  {/* <TableCell>
                        <Switch
                          checked={route.featured}
                          onChange={()=>{onUpdateFeature(route, index)}}
                          name="checkedFeature"
                        />
                  </TableCell> */}
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      className={classes.editButton}
                      onClick={() => {
                        navigate('/app/roles/routes/editRoute/' + route._id, {
                          replace: false
                        });
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  {/* <div className={classes.horizontalSpace}></div> */}
                  <TableCell>
                    <IconButton
                      color="error"
                      className={classes.dangerButton}
                      onClick={() => {
                        handleDeleteConfirm(route, index);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {confirmOpen ? (
                      <AlertDialog
                        open={route.openConfirm}
                        handleClose={() => {
                          handleConfirmclose(route, index);
                        }}
                        handleConfirm={() => {
                          handleDelete(route, index);
                        }}
                        content={modalBody.content}
                        title={modalBody.title}
                        confirmDialog={confirmDialog}
                        cancelButtonAsOk={cancelButtonAsOk}
                      />
                    ) : null}
                  </TableCell>
                  {/* <TableCell>
                    {moment(route.createdAt).format('DD/MM/YYYY')}
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
  routes: PropTypes.array.isRequired
};

export default Results;
