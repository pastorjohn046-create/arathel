import React from 'react';
import { LayoutDashboard, BarChart2, Newspaper, Settings, User, LogIn, Menu, X, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, profile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Portfolio', icon: LayoutDashboard },
    { id: 'trading', label: 'Trade', icon: BarChart2 },
    { id: 'news', label: 'Insights', icon: Newspaper },
    { id: 'settings', label: 'Account', icon: Settings },
  ];

  const { isAdmin } = useAuth();
  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldAlert });
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 md:w-9 md:h-9 bg-brand rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
            <BarChart2 className="text-white" size={18} />
          </div>
          <h1 className="text-lg md:text-xl font-black tracking-tighter text-ink">ARATHEL<span className="text-brand">.</span></h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === item.id ? "text-brand bg-brand/5" : "text-ink-muted hover:text-ink hover:bg-surface"
              )}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-surface rounded-lg border border-border">
                <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-[10px]">
                  {profile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-ink">{profile?.displayName || user.email?.split('@')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-hover transition-all shadow-lg shadow-brand/10 active:scale-95"
            >
              Get Started
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-ink" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white p-6 space-y-4 border-t border-border shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center space-x-4 w-full text-left p-3 rounded-lg transition-all",
                activeTab === item.id ? "bg-brand/10 text-brand" : "text-ink-muted hover:bg-surface"
              )}
            >
              <item.icon size={20} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
          <div className="pt-4 border-t border-border">
            {user ? (
              <button onClick={handleLogout} className="w-full btn-secondary py-3 text-red-600">
                Logout
              </button>
            ) : (
              <button onClick={onOpenAuth} className="w-full btn-primary py-3">
                Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
