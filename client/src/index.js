import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import * as serviceWorker from './serviceWorker';
import App from './App';
import { AuthContextProvider } from './context/auth-context';
import { subscribeUser } from './subscription';
import { socket } from 'src/services/socket';

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('auth-token');
  config.headers['x-auth-token'] =  token;

  return config;
});

ReactDOM.render((
  <BrowserRouter>
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
  </BrowserRouter>
), document.getElementById('root'));

serviceWorker.register();
// subscribeUser();
socket.emit('send-notification', "this is message from add brand");

