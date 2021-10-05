import 'react-perfect-scrollbar/dist/css/styles.css';
import React, {useContext} from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import GlobalStyles from 'src/components/GlobalStyles';
import 'src/mixins/chartjs';
import theme from 'src/theme';
import routes from 'src/routes';
import AuthContext from './context/auth-context';

const App = () => {
  const authCtx = useContext(AuthContext)
  const routing = useRoutes(routes(authCtx.isLoggedIn));

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {routing}
    </ThemeProvider>
  );
};

export default App;
