import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <a className="text-2xl font-bold text-primary hover:text-blue-700 transition-colors">
                  PM
                </a>
              </Link>
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-1">
                  <Link href="/dashboard">
                    <a
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/projects">
                    <a
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/projects')
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Projects
                    </a>
                  </Link>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{user?.email}</span>
                  {user?.roles && (
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                      {user.roles[0]}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
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
