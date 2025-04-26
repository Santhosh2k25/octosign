import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthRequired: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are logged in, render the child routes
  return <Outlet />;
};

export default AuthRequired;