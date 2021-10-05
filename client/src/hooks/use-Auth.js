import { isEmpty } from 'lodash';
import { useContext } from 'react';
import AuthContext from 'src/context/auth-context';

export const useHasAuth = (route, path) => {
  const { userRole } = useContext(AuthContext);
  if (isEmpty(userRole)) return false;
  const userRoute = userRole.routes.find(
    userRoute => userRoute.route_name == route
  );
  if (isEmpty(userRoute)) return false;
  const pathsAvailable = userRoute.paths;
  if (pathsAvailable.includes(path)) return true;
  else return false;
};
