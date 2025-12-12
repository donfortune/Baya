import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to login and notify the user
    // We use a toast ID to prevent duplicate toasts
    toast.warn('Please log in to access the dashboard.', { toastId: 'auth-error' });
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the child route (Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;