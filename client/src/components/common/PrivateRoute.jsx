import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    // While loading authentication state, you might want to show a spinner
    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-slate-500">Loading...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
