import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SalesProvider } from '@/contexts/SalesContext';
import PinLogin from '@/components/salesman/PinLogin';

// Main Index content that handles routing
const IndexContent: React.FC = () => {
    const { isAuthenticated, currentUser } = useAuth();

    // If authenticated, redirect based on role
    if (isAuthenticated && currentUser) {
        switch (currentUser.role) {
            case 'team_leader':
                return <Navigate to="/team-leader" replace />;
            case 'manager':
                return <Navigate to="/manager" replace />;
            case 'salesman':
                // Salesmen are blocked - show access denied
                return (
                    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                            <p className="text-gray-600 mb-4">
                                Salesman access has been disabled. Please contact your Team Leader for sales entry.
                            </p>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('currentUserId');
                                    window.location.reload();
                                }}
                                className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                );
            default:
                return <Navigate to="/team-leader" replace />;
        }
    }

    // Not authenticated - show login
    return <PinLogin onSuccess={() => { }} allowedRoles={['team_leader', 'manager']} />;
};

// Wrapper with providers
const Index: React.FC = () => {
    return (
        <AuthProvider>
            <SalesProvider>
                <IndexContent />
            </SalesProvider>
        </AuthProvider>
    );
};

export default Index;
