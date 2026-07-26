// src/components/NavShell.tsx
import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LogoBrand } from '../components/common/LogoBrand';
import { LogOut, Bell, User } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface NavShellProps {
  portalTitle?: string;
  portalName?: string; // Support for both portalTitle and portalName prop aliases
  navItems: NavItem[];
  children?: React.ReactNode;
  userDisplayName?: string;
}

export const NavShell: React.FC<NavShellProps> = ({
  portalTitle,
  portalName,
  navItems,
  children,
  userDisplayName = 'Staff User',
}) => {
  const navigate = useNavigate();
  const displayTitle = portalTitle || portalName || 'Portal Workspace';

  const handleLogout = () => {
    // Clear session tokens / auth state here
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between p-4 shadow-md shrink-0">
        <div>
          {/* Top Branding Header */}
          <div className="flex items-center justify-center pb-6 border-b border-emerald-700/60 mb-6">
            <div className="bg-white p-2 rounded-xl shadow-sm w-full max-w-[180px] flex items-center justify-center">
              <LogoBrand size="sm" className="h-9 w-auto" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="pt-4 border-t border-emerald-700/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-700/50 hover:text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm sticky top-0 z-30">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            {displayTitle}
          </h2>

          <div className="flex items-center gap-4">
            <button
              onClick={() => alert('No new notifications')}
              className="p-2 text-gray-400 hover:text-emerald-600 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-800">{userDisplayName}</p>
                <p className="text-[10px] text-gray-400">Active Session</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page View Body (Renders explicit children or nested route Outlet) */}
        <main className="p-6 flex-1 overflow-y-auto">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};