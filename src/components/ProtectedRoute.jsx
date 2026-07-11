import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4 select-none">
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-light-green border-t-primary-green rounded-full animate-spin" />
          <Leaf className="w-6 h-6 text-primary-green absolute animate-pulse" />
        </div>
        <p className="text-[14px] font-bold text-gray-500 tracking-wide animate-pulse">
          Loading your fresh account...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect user to login, but keep reference to target page to return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
