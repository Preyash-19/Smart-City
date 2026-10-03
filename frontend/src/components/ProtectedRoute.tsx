import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('smartCityToken');
  const userString = localStorage.getItem('smartCityUser');

  // 1. Unauthenticated Check: If no token or user object, redirect to login
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  let user: { role?: string } = {};
  try {
    user = JSON.parse(userString);
  } catch (e) {
    // Malformed user object -> clear storage and redirect
    localStorage.removeItem('smartCityToken');
    localStorage.removeItem('smartCityUser');
    return <Navigate to="/login" replace />;
  }

  // 2. Role Authorization Check
  if (allowedRoles && allowedRoles.length > 0 && user.role) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect unauthorized user to their designated portal
      switch (user.role) {
        case 'CITIZEN':
          return <Navigate to="/citizen" replace />;
        case 'OFFICER':
          return <Navigate to="/officer" replace />;
        case 'ADMIN':
          return <Navigate to="/admin" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
}
