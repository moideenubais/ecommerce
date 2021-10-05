import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import CONSTANTS from 'src/constants';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
  makeStyles
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';
import axios from 'axios';
import { isEmpty, isUndefined } from 'lodash';
import AuthContext from 'src/context/auth-context';


// const user = {
//   avatar: '/static/images/avatars/avatar_6.png',
//   city: 'Los Angeles',
//   country: 'USA',
//   jobTitle: 'Senior Developer',
//   name: 'Katarina Smith',
//   timezone: 'GTM-7'
// };

const useStyles = makeStyles(() => ({
  root: {},
  avatar: {
    height: 100,
    width: 100
  }
}));

const Profile = ({ className, user, ...rest }) => {
  const classes = useStyles();
  const [profileImageFile, setProfileImageFile] = useState(
    CONSTANTS.BASE_URL + user.image_url
  );
  const [image_url, setImage_url] = useState(undefined);
  const authCtx = useContext(AuthContext);

  const uploadImageToServer = (fileArray,imageFile) => {
    let data = new FormData();
     data.append('image', imageFile);
    axios
      .put(CONSTANTS.BASE_URL + 'api/user/' + user._id, data)
      .then(response => {
        setProfileImageFile(fileArray[0]);
        // console.log("token",response.data.token);
        if(!isEmpty(response.data.token))
        authCtx.onTokenChange(response.data.token);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <Card className={clsx(classes.root, className)} {...rest}>
      <CardContent>
        <Box alignItems="center" display="flex" flexDirection="column">
          <Avatar className={classes.avatar} src={profileImageFile}>
            {getInitials(user.name)}
          </Avatar>
          <Typography color="textPrimary" gutterBottom variant="h3">
            {user.name}
          </Typography>
          {/* <Typography
            color="textSecondary"
            variant="body1"
          >
            {`${user.city} ${user.country}`}
          </Typography>
          <Typography
            className={classes.dateText}
            color="textSecondary"
            variant="body1"
          >
            {`${moment().format('hh:mm A')} ${user.timezone}`}
          </Typography> */}
        </Box>
      </CardContent>
      <Divider />
      <CardActions fullWidth>
        {/* <Button
          color="primary"
          fullWidth
          variant="text"
        >
          Change Profile Picture
        </Button> */}
        <Box alignContent="center">
          <input
            fullWidth
            accept="image/*"
            style={{ display: 'none' }}
            id="contained-button-file"
            type="file"
            name="image_url"
            onChange={event => {
              if (event.target.files) {
                let fileArray = Array.from(event.target.files).map(file =>
                  URL.createObjectURL(file)
                );
                
                setImage_url(event.target.files[0]);
                uploadImageToServer(fileArray,event.target.files[0]);
              }
            }}
          />
          <label htmlFor="contained-button-file" fullWidth>
            <Button fullWidth variant="text" color="primary" component="span">
              Update Profile Image
            </Button>
          </label>
        </Box>
      </CardActions>
    </Card>
  );
};

Profile.propTypes = {
  className: PropTypes.string
};

export default Profile;
