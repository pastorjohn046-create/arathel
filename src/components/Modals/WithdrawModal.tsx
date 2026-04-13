import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { X, CreditCard, Landmark, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'crypto' | 'paypal'>('bank');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { profile, updateProfile } = useAuth();

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !details) return;
    if (profile && Number(amount) > profile.buyingPower) {
      alert('Insufficient buying power');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.uid,
          userEmail: profile.email,
          amount: Number(amount),
          method,
          details,
          type: 'withdrawal'
        })
      });

      if (response.ok) {
        // Save payment method to profile if not already present
        if (profile) {
          const currentMethods = profile.paymentMethods || [];
          const methodExists = currentMethods.some(m => 
            m.type === method && (m.address === details || m.accountNumber === details)
          );

          if (!methodExists) {
            const newMethod = {
              type: method,
              name: method.toUpperCase(),
              address: method === 'crypto' || method === 'paypal' ? details : null,
              accountNumber: method === 'bank' ? details : null,
              savedAt: new Date().toISOString()
            };
            
            await updateProfile({ 
              paymentMethods: [...currentMethods, newMethod] 
            });
          }
        }
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setAmount('');
          setDetails('');
          onClose();
        }, 2000);
      } else {
        const data = await response.json();
        alert(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md relative overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-ink mb-2">Withdraw Funds</h2>
          <p className="text-sm text-ink-muted mb-8">Move your profits to your personal account.</p>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">Withdrawal Requested</h3>
              <p className="text-sm text-ink-muted mt-2">Your request is being processed and will arrive shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-6">
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
                <p className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Available: ${profile?.buyingPower?.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Withdrawal Method</label>
                <div className="grid grid-cols-3 gap-3">
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
                  <button 
                    type="button"
                    onClick={() => setMethod('paypal')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === 'paypal' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
                  >
                    <CreditCard size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">PayPal</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                  {method === 'bank' ? 'Bank Account Details' : method === 'crypto' ? 'Wallet Address' : 'PayPal Email'}
                </label>
                
                {profile?.paymentMethods?.filter(m => m.type === method).length ? (
                  <div className="space-y-2 mb-2">
                    <p className="text-[9px] font-bold text-brand uppercase tracking-tighter">Use Saved Method:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.paymentMethods.filter(m => m.type === method).map((pm, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => setDetails(pm.address || pm.accountNumber || '')}
                          className="px-3 py-1.5 bg-brand/5 border border-brand/20 rounded-lg text-[10px] font-bold text-brand hover:bg-brand/10 transition-all"
                        >
                          {pm.last4 ? `**** ${pm.last4}` : pm.address || pm.accountNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <input 
                  type="text" 
                  required 
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-bold text-ink focus:outline-none focus:border-brand transition-colors"
                  placeholder={method === 'bank' ? 'Account Number / IBAN' : method === 'crypto' ? 'BTC / ETH Address' : 'name@example.com'}
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-brand text-white py-4 rounded-xl font-bold hover:bg-brand/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : `Withdraw $${amount || '0'}`}
              </button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};
