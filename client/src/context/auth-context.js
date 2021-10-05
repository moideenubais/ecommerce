import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

import CONSTANTS from '../constants';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  userRole: null,
  onLogin: (email, password) => {},
  onLogout: () => {},
  onTokenChange: token => {}
});

export const AuthContextProvider = props => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    privileges: [],
    _id: '',
    image_url: '',
    name: ''
  });
  const [userRole, setUserRole] = useState(null);
  const [gettingAuth, setGettingAuth] = useState(true);

  const navigate = useNavigate();

  const getUserRole = async (role, token) => {
    try {
      const userRole = await axios.get(
        CONSTANTS.BASE_URL + 'api/general/getSingleRole/' + role,
        null,
        { headers: { 'x-auth-token': token } }
      );

      setUserRole(userRole.data);
    } catch (error) {
      console.log('Error in getUserRole, userContext', error);
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem('auth-token');
      if (token === null) {
        localStorage.setItem('auth-token', '');
        token = '';
      }
      // console.log("token",token)
      try {
        const tokenRes = await axios.post(
          CONSTANTS.BASE_URL + 'api/tokenIsValid',
          null,
          { headers: { 'x-auth-token': token } }
        );

        // console.log(tokenRes.data);
        if (tokenRes.data.value) {
          setIsLoggedIn(true);
          let user = jwt_decode(token);
          getUserRole(user.role, token);
          setUser(user);
          // console.log("user++++++++++++++++",user);
          // console.log("inside useEffexdt22222");
          setGettingAuth(false);
          // if (user.user_type == 'delivery_boy')
          //   navigate('/app/dashboard/deliveryBoy', { replace: true });
          // else if (user.user_type == 'seller')
          //   navigate('/app/dashboard/seller', { replace: true });
          // else navigate('/app/dashboard', { replace: true });

          // console.log("inside useEffexdt3333");
        } else {
          // console.log("not logged in")
          navigate('/login', { replace: true });
        }
      } catch (error) {
        setGettingAuth(false);
        navigate('/login', { replace: true });
        // console.log("error",error)
      }
    };
    checkLoggedIn();
  }, []);

  const logoutHandler = () => {
    localStorage.setItem('auth-token', '');
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
  };

  const handleTokenChange = token => {
    localStorage.setItem('auth-token', token);
    setIsLoggedIn(true);
    let user = jwt_decode(token);
    getUserRole(user.role, token);
    setUser(user);
  };
  const loginHandler = (loginType, email, password) => {
    return new Promise(async (resolve, reject) => {
      let data = {};
      let url = 'api/login';
      if (loginType === 'google') {
        data.tokenId = email;
        url = 'api/login/google';
      } else
        data = {
          email: email,
          password: password
        };
      await axios
        .post(CONSTANTS.BASE_URL + url, data)
        .then(response => {
          localStorage.setItem('auth-token', response.data.token);
          setIsLoggedIn(true);
          let user = jwt_decode(response.data.token);
          getUserRole(user.role, response.data.token);
          setUser(user);

          // console.log(user);
          //   console.log("here");
          resolve({ err: false, user: user });
          // navigate('/app/dashboard', { replace: true });
        })
        .catch(err => {
          //   console.log("catch",err.response.status);
          if (err.response.status == 400)
            //   setError(true);
            reject({ error: true });
          // console.log('error',err)
        });
    });
  };
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn,
        user: user,
        userRole: userRole,
        onLogin: loginHandler,
        onLogout: logoutHandler,
        onTokenChange: handleTokenChange
      }}
    >
      {!gettingAuth && props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
