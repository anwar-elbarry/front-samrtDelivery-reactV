import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { useAuthContext } from '../../context';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar notifications={3} />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - can add breadcrumbs or page title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>

            {/* Right side - User info and notifications */}
            <div className="flex items-center gap-4">
              {/* Notifications Bell */}
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <i className="fa-solid fa-bell"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">
                    {user?.role?.roleName || 'User'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.prenom?.[0]?.toUpperCase() || 'U'}
                  {user?.nom?.[0]?.toUpperCase() || ''}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
