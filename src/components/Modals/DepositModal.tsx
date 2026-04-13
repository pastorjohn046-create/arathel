import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { X, CreditCard, Landmark, Wallet, Loader2, CheckCircle2, Copy, ShieldCheck, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | 'crypto'>('bank');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const { profile, updateProfile } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    setShowCardForm(false);
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        const data = await response.json();
        setAccounts(data);
        if (data.length > 0) {
          const firstOfMethod = data.find((a: any) => a.type === method) || data[0];
          setSelectedAccount(firstOfMethod);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [isOpen, method]);

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !profile) return;

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
          cardDetails: method === 'card' ? cardDetails : null,
          accountDetails: selectedAccount ? selectedAccount : null
        })
      });

      if (response.ok) {
        // Save payment method to profile if not already present
        if (profile) {
          const currentMethods = profile.paymentMethods || [];
          const methodExists = currentMethods.some(m => 
            (method === 'card' && m.last4 === cardDetails.number.slice(-4)) ||
            (method === 'bank' && m.accountNumber === selectedAccount?.accountNumber) ||
            (method === 'crypto' && m.address === selectedAccount?.address)
          );

          if (!methodExists) {
            const newMethod = {
              type: method,
              name: method === 'card' ? cardDetails.name : selectedAccount?.name,
              last4: method === 'card' ? cardDetails.number.slice(-4) : null,
              accountNumber: method === 'bank' ? selectedAccount?.accountNumber : null,
              address: method === 'crypto' ? selectedAccount?.address : null,
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
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error("Error creating deposit request:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredAccounts = accounts.filter(a => a.type === method);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md relative overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-ink mb-2">Deposit Funds</h2>
          <p className="text-sm text-ink-muted mb-8">Add capital to your trading account.</p>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="animate-spin" size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">Deposit Pending</h3>
              <p className="text-sm text-ink-muted mt-2">
                Your deposit request has been submitted. Please wait for admin confirmation to reflect in your balance.
              </p>
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
                    onClick={() => setMethod('bank')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === 'bank' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
                  >
                    <Landmark size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Bank</span>
                  </button>
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
                    onClick={() => setMethod('crypto')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === 'crypto' ? 'border-brand bg-brand/5 text-brand' : 'border-border bg-surface text-ink-muted'}`}
                  >
                    <Wallet size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">Crypto</span>
                  </button>
                </div>
              </div>

              {method === 'card' && (
                <div className="space-y-4 p-4 bg-surface rounded-2xl border border-border">
                  {!showCardForm ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-ink mb-1">Secure Card Payment</h4>
                      <p className="text-[10px] text-ink-muted mb-4">Your payment is encrypted and secure.</p>
                      <button 
                        type="button"
                        onClick={() => setShowCardForm(true)}
                        className="w-full bg-brand text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                      >
                        Enter Card Details
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck size={16} className="text-green-600" />
                          <span className="text-[10px] font-bold text-ink uppercase tracking-widest">Secure Card Payment</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a 
                            href="https://wa.me/13363247969" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-green-600 hover:underline flex items-center"
                          >
                            <Phone size={10} className="mr-1" />
                            WhatsApp
                          </a>
                          <button 
                            type="button" 
                            onClick={() => setShowCardForm(false)}
                            className="text-[10px] font-bold text-brand hover:underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {profile?.paymentMethods?.filter(m => m.type === 'card').length ? (
                          <div className="space-y-2 mb-2">
                            <p className="text-[9px] font-bold text-brand uppercase tracking-tighter">Use Saved Card:</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.paymentMethods.filter(m => m.type === 'card').map((pm, i) => (
                                <button 
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setCardDetails({
                                      ...cardDetails,
                                      name: pm.name || '',
                                      number: `**** **** **** ${pm.last4}`
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-brand/5 border border-brand/20 rounded-lg text-[10px] font-bold text-brand hover:bg-brand/10 transition-all"
                                >
                                  **** {pm.last4}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <input 
                          type="text" 
                          placeholder="Cardholder Name" 
                          className="w-full bg-white border border-border rounded-lg p-2.5 text-xs focus:border-brand outline-none"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Card Number" 
                          className="w-full bg-white border border-border rounded-lg p-2.5 text-xs focus:border-brand outline-none"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                          required
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            className="w-full bg-white border border-border rounded-lg p-2.5 text-xs focus:border-brand outline-none"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="CVV" 
                            className="w-full bg-white border border-border rounded-lg p-2.5 text-xs focus:border-brand outline-none"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {method === 'bank' && filteredAccounts.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Select Bank Account</label>
                  <div className="space-y-2">
                    {filteredAccounts.map((acc) => (
                      <div 
                        key={acc.id}
                        onClick={() => setSelectedAccount(acc)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAccount?.id === acc.id ? 'border-brand bg-brand/5' : 'border-border bg-surface'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-sm text-ink">{acc.name}</p>
                          {selectedAccount?.id === acc.id && <CheckCircle2 size={16} className="text-brand" />}
                        </div>
                        <div className="flex items-center justify-between text-xs text-ink-muted">
                          <span>{acc.accountNumber}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(acc.accountNumber); }} className="hover:text-brand">
                            <Copy size={12} />
                          </button>
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1 uppercase tracking-tighter">Routing: {acc.routingNumber}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {method === 'crypto' && filteredAccounts.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Select Crypto Wallet</label>
                  <div className="space-y-2">
                    {filteredAccounts.map((acc) => (
                      <div 
                        key={acc.id}
                        onClick={() => setSelectedAccount(acc)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAccount?.id === acc.id ? 'border-brand bg-brand/5' : 'border-border bg-surface'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-sm text-ink">{acc.name}</p>
                          {selectedAccount?.id === acc.id && <CheckCircle2 size={16} className="text-brand" />}
                        </div>
                        <div className="flex items-center justify-between text-xs text-ink-muted">
                          <span className="truncate mr-2">{acc.address}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(acc.address); }} className="hover:text-brand flex-shrink-0">
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                disabled={loading || (method !== 'card' && filteredAccounts.length === 0)}
                className="w-full bg-brand text-white py-4 rounded-xl font-bold hover:bg-brand/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : `Submit Deposit $${amount || '0'}`}
              </button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

