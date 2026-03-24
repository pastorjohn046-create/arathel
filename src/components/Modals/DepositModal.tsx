import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { X, CreditCard, Landmark, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | 'crypto'>('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { profile, updateProfile } = useAuth();

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (profile) {
      const depositRequest = {
        id: Math.random().toString(36).substring(2, 9),
        userId: profile.uid,
        userEmail: profile.email,
        amount: Number(amount),
        method,
        status: 'pending',
        type: 'deposit',
        createdAt: new Date().toISOString()
      };
      const deposits = JSON.parse(localStorage.getItem('arathel_deposits') || '[]');
      deposits.push(depositRequest);
      localStorage.setItem('arathel_deposits', JSON.stringify(deposits));
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md relative overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-ink mb-2">Deposit Funds</h2>
          <p className="text-sm text-ink-muted mb-8">Add capital to your trading account instantly.</p>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">Deposit Successful</h3>
              <p className="text-sm text-ink-muted mt-2">Your funds have been added to your buying power.</p>
            </div>
          ) : (
            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Amount (USD)</label>
                <input 
                  type="number" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-4 text-xl font-bold text-ink focus:outline-none focus:border-brand transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === 'card' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
                  >
                    <CreditCard size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Card</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === 'bank' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
                  >
                    <Landmark size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Bank</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMethod('crypto')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === 'crypto' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
                  >
                    <Wallet size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Crypto</span>
                  </button>
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-brand text-white py-4 rounded-xl font-bold hover:bg-brand/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : `Deposit $${amount || '0'}`}
              </button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};
