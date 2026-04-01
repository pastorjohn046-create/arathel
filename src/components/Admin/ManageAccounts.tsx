import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard, Landmark, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ManageAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [newAccount, setNewAccount] = useState({
    name: '',
    accountNumber: '',
    routingNumber: '',
    address: '',
    type: 'bank' as 'bank' | 'crypto'
  });
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;
    if (newAccount.type === 'bank' && (!newAccount.accountNumber || !newAccount.routingNumber)) return;
    if (newAccount.type === 'crypto' && !newAccount.address) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAccount,
          createdAt: new Date().toISOString()
        })
      });
      if (response.ok) {
        setNewAccount({ name: '', accountNumber: '', routingNumber: '', address: '', type: 'bank' });
        fetchAccounts();
      }
    } catch (error) {
      console.error("Error adding account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Plus className="text-brand" size={20} />
          Add New Deposit Option
        </h3>
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setNewAccount({...newAccount, type: 'bank'})}
              className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${newAccount.type === 'bank' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
            >
              Bank Account
            </button>
            <button 
              type="button"
              onClick={() => setNewAccount({...newAccount, type: 'crypto'})}
              className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${newAccount.type === 'crypto' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
            >
              Crypto Wallet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {newAccount.type === 'bank' ? 'Bank Name' : 'Wallet Name (e.g. BTC)'}
              </label>
              <input 
                type="text" 
                value={newAccount.name}
                onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                placeholder={newAccount.type === 'bank' ? "e.g. Chase Bank" : "e.g. Bitcoin (BTC)"}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
              />
            </div>

            {newAccount.type === 'bank' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Account Number</label>
                  <input 
                    type="text" 
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Routing Number</label>
                  <input 
                    type="text" 
                    value={newAccount.routingNumber}
                    onChange={(e) => setNewAccount({...newAccount, routingNumber: e.target.value})}
                    placeholder="e.g. 091000019"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Wallet Address</label>
                <input 
                  type="text" 
                  value={newAccount.address}
                  onChange={(e) => setNewAccount({...newAccount, address: e.target.value})}
                  placeholder="e.g. bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-xl py-4 text-sm font-bold hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : `Add ${newAccount.type === 'bank' ? 'Bank Account' : 'Crypto Wallet'}`}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {accounts.map((acc) => (
            <motion.div 
              key={acc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${acc.type === 'bank' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {acc.type === 'bank' ? <Landmark size={20} /> : <Wallet size={20} />}
                </div>
                <button 
                  onClick={() => handleDelete(acc.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-ink">{acc.name}</h4>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3">{acc.type}</p>
                
                {acc.type === 'bank' ? (
                  <div className="space-y-2">
                    <div className="bg-surface rounded-xl p-3 flex items-center justify-between">
                      <span className="text-xs font-mono text-ink">{acc.accountNumber}</span>
                      <CreditCard size={14} className="text-ink-muted" />
                    </div>
                    <p className="text-[10px] text-ink-muted px-1">Routing: {acc.routingNumber}</p>
                  </div>
                ) : (
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs font-mono text-ink break-all">{acc.address}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
