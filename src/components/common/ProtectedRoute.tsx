import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70dvh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        <p className="text-xs text-neutral-400 font-mono tracking-wider uppercase">
          Verifying Owner Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
