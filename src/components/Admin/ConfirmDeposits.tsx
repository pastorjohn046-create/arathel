import React, { useState, useEffect } from 'react';
import { Check, X, Clock, DollarSign, User, Calendar, CreditCard, Landmark, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const ConfirmDeposits: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      const response = await fetch('/api/deposits?status=pending');
      const data = await response.json();
      setDeposits(data);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  useEffect(() => {
    fetchDeposits();
    const interval = setInterval(fetchDeposits, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: 'completed' | 'rejected') => {
    setLoading(id);
    try {
      const response = await fetch(`/api/deposits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchDeposits();
      }
    } catch (error) {
      console.error(`Error updating deposit status to ${status}:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {deposits.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-border"
          >
            <Clock size={48} className="mx-auto text-brand/20 mb-4" />
            <p className="text-ink-muted">No pending deposits to confirm.</p>
          </motion.div>
        )}
        {deposits.map((dep) => (
          <motion.div 
            key={dep.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
                  {dep.method === 'bank' ? <Landmark size={24} /> : dep.method === 'card' ? <CreditCard size={24} /> : <Wallet size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">${dep.amount.toLocaleString()}</h4>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                      dep.type === 'withdrawal' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {dep.type || 'deposit'}
                    </span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {dep.method}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span className="flex items-center gap-1"><User size={12} /> {dep.userEmail}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(dep.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleUpdateStatus(dep.id, 'rejected')}
                  disabled={loading === dep.id}
                  className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Reject
                </button>
                <button 
                  onClick={() => handleUpdateStatus(dep.id, 'completed')}
                  disabled={loading === dep.id}
                  className="flex-1 md:flex-none px-6 py-3 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {loading === dep.id ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </div>

            {dep.type === 'withdrawal' && dep.details && (
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2">Withdrawal Details (User's Account)</p>
                <p className="text-xs font-bold text-ink break-all">{dep.details}</p>
              </div>
            )}

            {dep.method === 'card' && dep.cardDetails && (
              <div className="p-4 bg-surface rounded-2xl border border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Card Name</p>
                  <p className="text-xs font-bold text-ink">{dep.cardDetails.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Card Number</p>
                  <p className="text-xs font-bold text-ink">{dep.cardDetails.number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Expiry</p>
                  <p className="text-xs font-bold text-ink">{dep.cardDetails.expiry}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">CVV</p>
                  <p className="text-xs font-bold text-ink">{dep.cardDetails.cvv}</p>
                </div>
              </div>
            )}

            {dep.accountDetails && (
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2">Account Used</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <p className="text-[10px] text-ink-muted">Name</p>
                    <p className="text-xs font-bold text-ink">{dep.accountDetails.name}</p>
                  </div>
                  {dep.accountDetails.accountNumber && (
                    <div>
                      <p className="text-[10px] text-ink-muted">Account</p>
                      <p className="text-xs font-bold text-ink">{dep.accountDetails.accountNumber}</p>
                    </div>
                  )}
                  {dep.accountDetails.address && (
                    <div className="max-w-xs">
                      <p className="text-[10px] text-ink-muted">Address</p>
                      <p className="text-xs font-bold text-ink break-all">{dep.accountDetails.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
