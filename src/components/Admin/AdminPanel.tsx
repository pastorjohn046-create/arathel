import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Users, CreditCard, Package, MessageSquare, ShieldAlert, Search, Plus, Trash2, Code, Wallet, Landmark, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ManageAccounts } from './ManageAccounts';
import { ConfirmDeposits } from './ConfirmDeposits';
import { AdminSupport } from './AdminSupport';

export const AdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [arathelConfig, setArathelConfig] = useState({ price: 1.00, trend: 'stable', change: '+0.00%' });

  const fetchArathel = async () => {
    try {
      const res = await fetch('/api/arathel');
      if (res.ok) setArathelConfig(await res.json());
    } catch (e) {
      console.error("Error fetching arathel:", e);
    }
  };

  const updateArathelTrend = async (trend: 'up' | 'down' | 'stable') => {
    try {
      const res = await fetch('/api/arathel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend })
      });
      if (res.ok) setArathelConfig(await res.json());
    } catch (e) {
      console.error("Error updating arathel trend:", e);
    }
  };

  const resetArathelPrice = async () => {
    try {
      const res = await fetch('/api/arathel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 500.00, change: '+0.00%', trend: 'stable' })
      });
      if (res.ok) setArathelConfig(await res.json());
    } catch (e) {
      console.error("Error resetting arathel price:", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const u = await response.json();
      setUsers(u);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchArathel();
    const interval = setInterval(() => {
      fetchUsers();
      fetchArathel();
    }, 2000); // Poll every 2s for immediate feedback
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBalance = async (userId: string, field: 'buyingPower' | 'portfolioValue', amount: number) => {
    try {
      const user = users.find(u => u.uid === userId);
      if (!user) return;

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: (user[field] || 0) + amount
        })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'System Status', value: 'Active', icon: ShieldAlert, color: 'text-green-600' },
    { label: 'Network', value: 'Mainnet', icon: Code, color: 'text-purple-600' },
    { label: 'Security', value: 'High', icon: ShieldAlert, color: 'text-red-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center text-ink">
          <ShieldAlert className="mr-3 text-red-600" />
          Admin Control Center
        </h2>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex items-center space-x-4">
            <div className={cn("p-3 rounded-xl bg-surface", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Tabs */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 space-x-2 lg:space-x-0 lg:space-y-1 no-scrollbar">
          {[
            { id: 'users', label: 'Users', fullLabel: 'User Management', icon: Users },
            { id: 'deposits', label: 'Deposits', fullLabel: 'Confirm Deposits', icon: CheckCircle2 },
            { id: 'accounts', label: 'Accounts', fullLabel: 'Manage Accounts', icon: Landmark },
            { id: 'arathel', label: 'Arathel', fullLabel: 'Arathel Control', icon: TrendingUp },
            { id: 'support', label: 'Support', fullLabel: 'Support Center', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={cn(
                "flex-shrink-0 flex items-center space-x-3 p-3 rounded-xl transition-all text-sm font-bold whitespace-nowrap lg:w-full",
                activeSubTab === item.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-ink-muted hover:bg-surface"
              )}
            >
              <item.icon size={18} />
              <span className="hidden lg:inline">{item.fullLabel}</span>
              <span className="lg:hidden">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card className="lg:col-span-3 min-h-[500px] lg:min-h-[600px] p-0 overflow-hidden">
          {activeSubTab === 'users' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-ink">User Management</h3>
                  <p className="text-xs text-ink-muted">Manage system users and access levels</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-ink-muted text-[10px] uppercase border-b border-border bg-surface/50">
                      <th className="px-6 py-4 font-bold tracking-widest">User Details</th>
                      <th className="px-6 py-4 font-bold tracking-widest">Buying Power</th>
                      <th className="px-6 py-4 font-bold tracking-widest">Portfolio Value</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-right">Balance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold border border-brand/20">
                              {user.email?.[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-ink">{user.email}</p>
                              <p className="text-[10px] text-ink-muted font-mono tracking-tighter">ID: {user.uid.slice(0, 12)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-ink font-bold">${(user.buyingPower || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-ink font-bold">${(user.portfolioValue || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-end space-x-2">
                              <span className="text-[8px] font-bold text-ink-muted uppercase self-center">Buying Power:</span>
                              <button 
                                onClick={() => handleUpdateBalance(user.uid, 'buyingPower', 1000)}
                                className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold border border-green-100 hover:bg-green-600 hover:text-white transition-all"
                              >
                                +1k
                              </button>
                              <button 
                                onClick={() => handleUpdateBalance(user.uid, 'buyingPower', -1000)}
                                className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                              >
                                -1k
                              </button>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <span className="text-[8px] font-bold text-ink-muted uppercase self-center">Portfolio:</span>
                              <button 
                                onClick={() => handleUpdateBalance(user.uid, 'portfolioValue', 1000)}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                              >
                                +1k
                              </button>
                              <button 
                                onClick={() => handleUpdateBalance(user.uid, 'portfolioValue', -1000)}
                                className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold border border-slate-100 hover:bg-slate-600 hover:text-white transition-all"
                              >
                                -1k
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile User List */}
              <div className="md:hidden divide-y divide-border">
                {filteredUsers.map((user) => (
                  <div key={user.uid} className="p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold border border-brand/20">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-ink text-sm">{user.email}</p>
                        <p className="text-[10px] text-ink-muted font-mono tracking-tighter">ID: {user.uid.slice(0, 12)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-surface rounded-2xl p-4 border border-border">
                      <div>
                        <p className="text-[8px] font-bold text-ink-muted uppercase tracking-widest mb-1">Buying Power</p>
                        <p className="text-sm font-mono text-ink font-bold">${(user.buyingPower || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-ink-muted uppercase tracking-widest mb-1">Portfolio</p>
                        <p className="text-sm font-mono text-ink font-bold">${(user.portfolioValue || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Buying Power</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleUpdateBalance(user.uid, 'buyingPower', 1000)}
                            className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold border border-green-100"
                          >
                            +1k
                          </button>
                          <button 
                            onClick={() => handleUpdateBalance(user.uid, 'buyingPower', -1000)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100"
                          >
                            -1k
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Portfolio</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleUpdateBalance(user.uid, 'portfolioValue', 1000)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100"
                          >
                            +1k
                          </button>
                          <button 
                            onClick={() => handleUpdateBalance(user.uid, 'portfolioValue', -1000)}
                            className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100"
                          >
                            -1k
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'deposits' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-ink mb-6">Pending Deposits</h3>
              <ConfirmDeposits />
            </div>
          )}

          {activeSubTab === 'accounts' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-ink mb-6">Manage Deposit Accounts</h3>
              <ManageAccounts />
            </div>
          )}

          {activeSubTab === 'arathel' && (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-ink">Arathel Coin Control</h3>
                <p className="text-xs text-ink-muted">Control the market trend of Arathel Network (ARATHEL)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-surface border-border">
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Current Price</p>
                    <p className="text-3xl font-black text-ink">${arathelConfig.price.toFixed(2)}</p>
                    <p className={cn("text-xs font-bold mt-1", arathelConfig.change.startsWith('+') ? 'text-green-600' : 'text-red-600')}>
                      {arathelConfig.change}
                    </p>
                    <button 
                      onClick={resetArathelPrice}
                      className="mt-4 w-full py-2 bg-brand text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand/90 transition-all"
                    >
                      Reset to $500.00
                    </button>
                  </Card>
                <Card className="bg-surface border-border">
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Current Trend</p>
                  <p className="text-2xl font-bold text-brand uppercase tracking-tighter">{arathelConfig.trend}</p>
                  <p className="text-[10px] text-ink-muted mt-1">Market is currently following this trend</p>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-ink text-sm uppercase tracking-widest">Set Market Direction</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => updateArathelTrend('up')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group",
                      arathelConfig.trend === 'up' ? "border-green-600 bg-green-50" : "border-border bg-white hover:border-green-600"
                    )}
                  >
                    <TrendingUp size={32} className={cn("mb-2", arathelConfig.trend === 'up' ? "text-green-600" : "text-ink-muted group-hover:text-green-600")} />
                    <span className={cn("font-bold", arathelConfig.trend === 'up' ? "text-green-600" : "text-ink")}>BULLISH (UP)</span>
                    <p className="text-[10px] text-ink-muted mt-1">Price will gradually increase</p>
                  </button>

                  <button 
                    onClick={() => updateArathelTrend('stable')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group",
                      arathelConfig.trend === 'stable' ? "border-brand bg-brand/5" : "border-border bg-white hover:border-brand"
                    )}
                  >
                    <Activity size={32} className={cn("mb-2", arathelConfig.trend === 'stable' ? "text-brand" : "text-ink-muted group-hover:text-brand")} />
                    <span className={cn("font-bold", arathelConfig.trend === 'stable' ? "text-brand" : "text-ink")}>STABLE</span>
                    <p className="text-[10px] text-ink-muted mt-1">Price will fluctuate slightly</p>
                  </button>

                  <button 
                    onClick={() => updateArathelTrend('down')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group",
                      arathelConfig.trend === 'down' ? "border-red-600 bg-red-50" : "border-border bg-white hover:border-red-600"
                    )}
                  >
                    <TrendingUp size={32} className={cn("mb-2 rotate-180", arathelConfig.trend === 'down' ? "text-red-600" : "text-ink-muted group-hover:text-red-600")} />
                    <span className={cn("font-bold", arathelConfig.trend === 'down' ? "text-red-600" : "text-ink")}>BEARISH (DOWN)</span>
                    <p className="text-[10px] text-ink-muted mt-1">Price will gradually decrease</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'support' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-ink mb-6">Support Center</h3>
              <AdminSupport />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

