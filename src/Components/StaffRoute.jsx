import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../redux/selectors';
import StaffLayout from '../Pages/Staff/StaffLayout';

const StaffRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const isStaff = currentUser && ['admin', 'manager', 'chef', 'cashier'].includes(currentUser.role);

  if (!isAuthenticated) {
    return <Navigate to="/signIn" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <StaffLayout><Outlet /></StaffLayout>;
};

export default StaffRoute;
