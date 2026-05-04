import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Project Manager</h1>
            </div>
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user?.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-danger text-white rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
