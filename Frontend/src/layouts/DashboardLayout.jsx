import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Terminal, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ShieldAlert 
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { clearKeySession } = useApiKey();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'API Tester', path: '/tester', icon: Terminal },
  ];

  const handleLogout = () => {
    logout();
    clearKeySession(); // Reset key context on logout
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-border">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-lg text-primary-foreground select-none glow-indigo">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-zinc-100 tracking-wider uppercase select-none">ApiSentinel</span>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase select-none">Management Service</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary pl-3.5'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile section */}
      <div className="p-4 border-t border-border bg-zinc-900/20">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <User className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-300 truncate leading-none">
              {user?.username || 'Talha'}
            </p>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">
              Developer
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <SidebarContent />
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-zinc-950/60 backdrop-blur sticky top-0 z-15">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-zinc-300 tracking-tight flex items-center gap-1.5">
              <span>ApiSentinel Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider select-none">API Gateway Online</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-full max-w-xs flex-1 flex flex-col bg-zinc-950 animate-slide-in shadow-2xl">
              <div className="absolute top-4 right-4 z-40">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Page Content Panel */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
