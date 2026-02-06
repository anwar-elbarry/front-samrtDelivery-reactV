import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../../context';
import { getMenuForRole, getRoleDisplayName } from './sidebarConfig';

interface SidebarProps {
  notifications?: number;
}

export default function Sidebar({ notifications = 0 }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthContext();

  const roleName = user?.role?.roleName || 'CLIENT';
  const menuSections = getMenuForRole(roleName);
  const roleDisplayName = getRoleDisplayName(roleName);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <span className="text-sm font-semibold text-slate-700">{roleDisplayName}</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      {/* Logo Section */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <i className="fa-solid fa-truck-fast text-white"></i>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-slate-800">Smart Delivery</span>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && !isCollapsed && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <i className={`${item.icon} w-5 text-center`}></i>
                    {!isCollapsed && <span>{item.label}</span>}
                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section at Bottom */}
      <div className="border-t border-slate-200 p-4">
        {/* Notifications */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer mb-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Notifications"
        >
          <div className="relative">
            <i className="fa-solid fa-bell w-5 text-center"></i>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </div>
          {!isCollapsed && <span>Notifications</span>}
        </div>

        {/* User Info */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.prenom?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            {user?.nom?.[0]?.toUpperCase() || ''}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-slate-500 uppercase">{roleDisplayName}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Déconnexion"
        >
          <i className="fa-solid fa-right-from-bracket w-5 text-center"></i>
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
