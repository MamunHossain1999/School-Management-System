import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../../store';
import { getProfile } from '../../store/slices/authSlice';
import { useGetProfileQuery } from '../../store/api/authApi';


interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student' | 'parent')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isAuthenticated, user, isLoading, token } = useSelector((state: RootState) => state.auth);

  // If we have a token but no user loaded yet, attempt to fetch profile via RTK Query
  const shouldFetchProfile = Boolean(token) && !user;
  const { isFetching: fetchingProfile } = useGetProfileQuery(undefined as void | undefined, { skip: !shouldFetchProfile });

  useEffect(() => {
    if (token && !user) {
      // Fetch user profile to restore session when token exists
      void getProfile(dispatch);
    }
  }, [dispatch, token, user]);

  if (isLoading || fetchingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
