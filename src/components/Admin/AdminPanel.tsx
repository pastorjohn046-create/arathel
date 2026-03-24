import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Users, CreditCard, Package, MessageSquare, ShieldAlert, Search, Plus, Trash2, Code, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PaymentMethod, SmartContract } from '../../types';

const USERS_KEY = 'arathel_users';
const PM_KEY = 'arathel_pms';
const SC_KEY = 'arathel_scs';
const DEPOSITS_KEY = 'arathel_deposits';
const WITHDRAWALS_KEY = 'arathel_withdrawals';

export const AdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // New Payment Method Form
  const [newPM, setNewPM] = useState({ name: '', type: 'bank' as any, details: '', isGlobal: true, userId: '' });
  // New SC Form
  const [newSC, setNewSC] = useState({ name: '', address: '', network: 'Ethereum' });

  useEffect(() => {
    const loadData = () => {
      const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const storedPMs = JSON.parse(localStorage.getItem(PM_KEY) || '[]');
      const storedSCs = JSON.parse(localStorage.getItem(SC_KEY) || '[]');
      const storedDeposits = JSON.parse(localStorage.getItem(DEPOSITS_KEY) || '[]');
      const storedWithdrawals = JSON.parse(localStorage.getItem(WITHDRAWALS_KEY) || '[]');
      
      setUsers(storedUsers);
      setPaymentMethods(storedPMs);
      setSmartContracts(storedSCs);
      setTransactions([...storedDeposits, ...storedWithdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    };

    loadData();
    // Poll for changes since we don't have real-time listeners with localStorage
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveTransaction = async (tx: any) => {
    const key = tx.type === 'deposit' ? DEPOSITS_KEY : WITHDRAWALS_KEY;
    const allTxs = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedTxs = allTxs.map((t: any) => t.id === tx.id ? { ...t, status: 'approved' } : t);
    localStorage.setItem(key, JSON.stringify(updatedTxs));

    // Update user balance
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = allUsers.map((u: any) => {
      if (u.uid === tx.userId) {
        const amount = tx.type === 'deposit' ? tx.amount : -tx.amount;
        return { ...u, buyingPower: (u.buyingPower || 0) + amount };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleRejectTransaction = async (tx: any) => {
    const key = tx.type === 'deposit' ? DEPOSITS_KEY : WITHDRAWALS_KEY;
    const allTxs = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedTxs = allTxs.map((t: any) => t.id === tx.id ? { ...t, status: 'rejected' } : t);
    localStorage.setItem(key, JSON.stringify(updatedTxs));
  };

  const handleUpdateBalance = async (userId: string, field: 'buyingPower' | 'portfolioValue', amount: number) => {
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = allUsers.map((u: any) => {
      if (u.uid === userId) {
        return { ...u, [field]: (u[field] || 0) + amount };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleAddPaymentMethod = async () => {
    if (!newPM.name || !newPM.details) return;
    const allPMs = JSON.parse(localStorage.getItem(PM_KEY) || '[]');
    const newEntry = {
      ...newPM,
      id: Math.random().toString(36).substring(2, 9),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    allPMs.push(newEntry);
    localStorage.setItem(PM_KEY, JSON.stringify(allPMs));
    setPaymentMethods(allPMs);
    setNewPM({ name: '', type: 'bank', details: '', isGlobal: true, userId: '' });
  };

  const handleDeletePM = async (id: string) => {
    const allPMs = JSON.parse(localStorage.getItem(PM_KEY) || '[]');
    const filtered = allPMs.filter((pm: any) => pm.id !== id);
    localStorage.setItem(PM_KEY, JSON.stringify(filtered));
    setPaymentMethods(filtered);
  };

  const handleAddSC = async () => {
    if (!newSC.name || !newSC.address) return;
    const allSCs = JSON.parse(localStorage.getItem(SC_KEY) || '[]');
    const newEntry = {
      ...newSC,
      id: Math.random().toString(36).substring(2, 9),
      status: 'deployed',
      createdAt: new Date().toISOString()
    };
    allSCs.push(newEntry);
    localStorage.setItem(SC_KEY, JSON.stringify(allSCs));
    setSmartContracts(allSCs);
    setNewSC({ name: '', address: '', network: 'Ethereum' });
  };

  const handleDeleteSC = async (id: string) => {
    const allSCs = JSON.parse(localStorage.getItem(SC_KEY) || '[]');
    const filtered = allSCs.filter((sc: any) => sc.id !== id);
    localStorage.setItem(SC_KEY, JSON.stringify(filtered));
    setSmartContracts(filtered);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Pending Txs', value: transactions.filter(t => t.status === 'pending').length.toString(), icon: CreditCard, color: 'text-red-600' },
    { label: 'Global PMs', value: paymentMethods.filter(p => p.isGlobal).length.toString(), icon: Wallet, color: 'text-amber-600' },
    { label: 'Smart Contracts', value: smartContracts.length.toString(), icon: Code, color: 'text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center text-ink">
          <ShieldAlert className="mr-3 text-red-600" />
          Admin Control Center
        </h2>
        <div className="flex space-x-2">
          <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors">
            System Freeze
          </button>
        </div>
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
        {/* Sidebar */}
        <div className="space-y-1">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'payments', label: 'Payment Gateway', icon: Wallet },
            { id: 'sc', label: 'SC Section', icon: Code },
            { id: 'assets', label: 'Asset Manager', icon: Package },
            { id: 'support', label: 'Support Center', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-sm font-bold",
                activeSubTab === item.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-ink-muted hover:bg-surface"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card className="lg:col-span-3 min-h-[600px] p-0">
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
              <div className="overflow-x-auto">
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
            </div>
          )}

          {activeSubTab === 'transactions' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold text-ink">Transactions</h3>
                <p className="text-xs text-ink-muted">Approve or reject deposits and withdrawals</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-ink-muted text-[10px] uppercase border-b border-border bg-surface/50">
                      <th className="px-6 py-4 font-bold tracking-widest">Type</th>
                      <th className="px-6 py-4 font-bold tracking-widest">User</th>
                      <th className="px-6 py-4 font-bold tracking-widest">Amount</th>
                      <th className="px-6 py-4 font-bold tracking-widest">Method</th>
                      <th className="px-6 py-4 font-bold tracking-widest">Status</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            tx.type === 'deposit' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-ink">{tx.userEmail}</p>
                          <p className="text-[10px] text-ink-muted">ID: {tx.userId}</p>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-ink">${tx.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-ink uppercase">{tx.method}</p>
                          {tx.details && <p className="text-[10px] text-ink-muted truncate max-w-[150px]">{tx.details}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            tx.status === 'pending' ? "bg-amber-100 text-amber-700" :
                            tx.status === 'approved' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {tx.status === 'pending' && (
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleApproveTransaction(tx)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700 transition-all"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectTransaction(tx)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'payments' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-ink">Payment Gateway</h3>
                  <p className="text-xs text-ink-muted">Manage global and per-user payment methods</p>
                </div>
              </div>

              <Card className="bg-surface/50">
                <h4 className="text-sm font-bold mb-4">Add New Payment Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input 
                    type="text" 
                    placeholder="Name (e.g. Bank Transfer)" 
                    className="bg-white border border-border rounded-lg p-2 text-xs"
                    value={newPM.name}
                    onChange={(e) => setNewPM({...newPM, name: e.target.value})}
                  />
                  <select 
                    className="bg-white border border-border rounded-lg p-2 text-xs"
                    value={newPM.type}
                    onChange={(e) => setNewPM({...newPM, type: e.target.value as any})}
                  >
                    <option value="bank">Bank</option>
                    <option value="crypto">Crypto</option>
                    <option value="card">Card</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Details (e.g. IBAN or Wallet)" 
                    className="bg-white border border-border rounded-lg p-2 text-xs"
                    value={newPM.details}
                    onChange={(e) => setNewPM({...newPM, details: e.target.value})}
                  />
                  <button 
                    onClick={handleAddPaymentMethod}
                    className="bg-brand text-white rounded-lg p-2 text-xs font-bold flex items-center justify-center"
                  >
                    <Plus size={14} className="mr-1" /> Add Method
                  </button>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-xs font-bold text-ink-muted">
                    <input 
                      type="checkbox" 
                      checked={newPM.isGlobal}
                      onChange={(e) => setNewPM({...newPM, isGlobal: e.target.checked})}
                    />
                    <span>Global Method</span>
                  </label>
                  {!newPM.isGlobal && (
                    <input 
                      type="text" 
                      placeholder="User ID" 
                      className="bg-white border border-border rounded-lg p-2 text-xs flex-grow"
                      value={newPM.userId}
                      onChange={(e) => setNewPM({...newPM, userId: e.target.value})}
                    />
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Existing Payment Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => (
                    <Card key={pm.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-ink">{pm.name} <span className="text-[10px] bg-brand/10 text-brand px-1 rounded">{pm.type}</span></p>
                        <p className="text-xs text-ink-muted truncate max-w-[200px]">{pm.details}</p>
                        <p className="text-[10px] text-ink-muted mt-1">{pm.isGlobal ? 'Global' : `User: ${pm.userId}`}</p>
                      </div>
                      <button 
                        onClick={() => handleDeletePM(pm.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'sc' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-ink">SC Section</h3>
                <p className="text-xs text-ink-muted">Manage Smart Contracts and Blockchain nodes</p>
              </div>

              <Card className="bg-surface/50">
                <h4 className="text-sm font-bold mb-4">Deploy New Contract</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Contract Name" 
                    className="bg-white border border-border rounded-lg p-2 text-xs"
                    value={newSC.name}
                    onChange={(e) => setNewSC({...newSC, name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Contract Address" 
                    className="bg-white border border-border rounded-lg p-2 text-xs"
                    value={newSC.address}
                    onChange={(e) => setNewSC({...newSC, address: e.target.value})}
                  />
                  <button 
                    onClick={handleAddSC}
                    className="bg-brand text-white rounded-lg p-2 text-xs font-bold flex items-center justify-center"
                  >
                    <Plus size={14} className="mr-1" /> Register Contract
                  </button>
                </div>
              </Card>

              <div className="space-y-4">
                <h4 className="text-sm font-bold">Active Contracts</h4>
                <div className="grid grid-cols-1 gap-4">
                  {smartContracts.map((sc) => (
                    <Card key={sc.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <Code size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-ink">{sc.name}</p>
                          <p className="text-xs font-mono text-ink-muted">{sc.address}</p>
                          <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-widest">{sc.status}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteSC(sc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {['assets', 'support', 'news'].includes(activeSubTab) && (
            <div className="h-full flex flex-col items-center justify-center text-ink-muted">
              <Package size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Module "{activeSubTab}" is under development</p>
              <p className="text-xs mt-2">Arathel Network v2.0.0-pro</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
