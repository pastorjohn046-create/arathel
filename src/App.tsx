/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navigation/Navbar';
import { MarketTicker } from './components/Dashboard/MarketTicker';
import { BentoGrid } from './components/Dashboard/BentoGrid';
import { Hero } from './components/Dashboard/Hero';
import { Card } from './components/ui/Card';
import { AdminPanel } from './components/Admin/AdminPanel';
import { BarChart3, BarChart2, TrendingUp, ShieldCheck, Activity, ShieldAlert, ArrowRight, User, Mail, Calendar, CreditCard, Shield, Search, ChevronDown, LayoutDashboard, ArrowUpRight, ArrowDownLeft, X, History, CheckCircle2, XCircle, Clock, Landmark, Wallet } from 'lucide-react';
import { AuthModal } from './components/Auth/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { cn } from './lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SplashScreen } from './components/ui/SplashScreen';
import { WithdrawalNotification } from './components/ui/WithdrawalNotification';
import { Reviews } from './components/Dashboard/Reviews';
import { DepositModal } from './components/Modals/DepositModal';
import { WithdrawModal } from './components/Modals/WithdrawModal';
import { SupportChat } from './components/Support/SupportChat';

const STOCKS = [
  { symbol: 'ARATHEL', name: 'Arathel Network', price: 500.00, change: '+0.00%' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: '+1.34%' },
  { symbol: 'TSLA', price: 172.45, name: 'Tesla, Inc.', change: '+4.2%' },
  { symbol: 'MSFT', price: 415.50, name: 'Microsoft Corp.', change: '+1.1%' },
  { symbol: 'NVDA', price: 894.30, name: 'NVIDIA Corp.', change: '+2.4%' },
  { symbol: 'AMZN', price: 178.10, name: 'Amazon.com, Inc.', change: '-0.8%' },
  { symbol: 'GOOGL', price: 151.77, name: 'Alphabet Inc.', change: '+0.5%' },
  { symbol: 'META', price: 507.76, name: 'Meta Platforms', change: '+1.2%' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { user, profile, isAdmin: isUserAdmin, updateProfile } = useAuth();

  const handleSplashComplete = React.useCallback(() => {
    setShowSplash(false);
  }, []);
  
  // Trading State
  const [stocks, setStocks] = useState(STOCKS);
  const [selectedStock, setSelectedStock] = useState(STOCKS[0]);
  const [quantity, setQuantity] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isStockListOpen, setIsStockListOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState('1D');
  const [declineNotice, setDeclineNotice] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : selectedStock.price;

  // Update stock prices periodically to simulate market movement
  useEffect(() => {
    const interval = setInterval(async () => {
      let arathelConfig = { price: 1.00, trend: 'stable', change: '+0.00%' };
      try {
        const res = await fetch('/api/arathel');
        if (res.ok) arathelConfig = await res.json();
      } catch (e) {
        console.error("Failed to fetch arathel config");
      }

      setStocks(prev => prev.map(s => {
        if (s.symbol === 'ARATHEL') {
          let change = 0;
          if (arathelConfig.trend === 'up') {
            // Guaranteed rise: between 0.5% and 1.5% per update
            change = (Math.random() * 0.01 + 0.005) * s.price;
          } else if (arathelConfig.trend === 'down') {
            // Guaranteed fall: between 0.5% and 1.5% per update
            change = -(Math.random() * 0.01 + 0.005) * s.price;
          } else {
            // Stable: No change at all
            change = 0;
          }

          const newPrice = Number((s.price + change).toFixed(2));
          const originalPrice = STOCKS.find(orig => orig.symbol === s.symbol)!.price;
          const pctChange = ((newPrice - originalPrice) / originalPrice * 100).toFixed(2);
          
          // Sync back to server frequently for real-time consistency
          fetch('/api/arathel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: newPrice, change: (Number(pctChange) >= 0 ? '+' : '') + pctChange + '%' })
          }).catch(() => {});

          return {
            ...s,
            price: newPrice,
            change: (Number(pctChange) >= 0 ? '+' : '') + pctChange + '%'
          };
        }

        const change = (Math.random() - 0.5) * (s.price * 0.002);
        const newPrice = Number((s.price + change).toFixed(2));
        const originalPrice = STOCKS.find(orig => orig.symbol === s.symbol)!.price;
        const pctChange = ((newPrice - originalPrice) / originalPrice * 100).toFixed(2);
        return {
          ...s,
          price: newPrice,
          change: (Number(pctChange) >= 0 ? '+' : '') + pctChange + '%'
        };
      }));
    }, 1000); // Increased frequency to 1 second for "immediate" feel
    return () => clearInterval(interval);
  }, []);

  // Sync selected stock with updated stocks list
  useEffect(() => {
    const updated = stocks.find(s => s.symbol === selectedStock.symbol);
    if (updated) setSelectedStock(updated);
  }, [stocks]);

  // Fetch deposits to check for declined withdrawals
  useEffect(() => {
    if (!user) {
      setDeclineNotice(null);
      return;
    }

    const checkDecline = async () => {
      try {
        const res = await fetch(`/api/deposits?userId=${user.uid}&status=rejected`);
        if (res.ok) {
          const rejected = await res.json();
          const notice = rejected.find((d: any) => d.declineReason)?.declineReason;
          if (notice) {
            setDeclineNotice(notice);
          }
        }
      } catch (e) {
        console.error("Failed to fetch rejected deposits");
      }
    };

    checkDecline();
    const interval = setInterval(checkDecline, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch all transactions for the user
  useEffect(() => {
    if (!user || activeTab !== 'settings') return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/deposits?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          // Sort by date descending
          setTransactions(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (e) {
        console.error("Failed to fetch transactions");
      }
    };

    fetchTransactions();
  }, [user, activeTab]);

  // Fetch global accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('/api/accounts');
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
        }
      } catch (e) {
        console.error("Failed to fetch accounts");
      }
    };

    fetchAccounts();
    const interval = setInterval(fetchAccounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = isUserAdmin;

  // Calculate Portfolio Stats
  const portfolioStats = React.useMemo(() => {
    if (!profile || !profile.holdings) return { 
      totalValue: profile?.buyingPower || 0, 
      totalPnL: 0, 
      dailyPnL: 0,
      allocationData: [],
      performanceData: []
    };
    
    let holdingsValue = 0;
    let totalPnL = 0;
    let totalCostBasis = 0;
    const allocationData: any[] = [];
    
    const COLORS = ['#2563eb', '#4f46e5', '#0891b2', '#10b981', '#f59e0b', '#ef4444'];
    
    profile.holdings.forEach((holding, index) => {
      const currentStock = stocks.find(s => s.symbol === holding.symbol);
      const price = currentStock ? currentStock.price : (holding.avgPrice || 0);
      const value = holding.amount * price;
      const costBasis = holding.amount * (holding.avgPrice || 0);
      
      holdingsValue += value;
      totalCostBasis += costBasis;
      totalPnL += value - costBasis;
      
      allocationData.push({
        name: holding.symbol,
        value: value,
        color: COLORS[index % COLORS.length]
      });
    });

    const totalPortfolioValue = (profile.buyingPower || 0) + holdingsValue;
    const totalPnLPct = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

    // Add cash to allocation
    if (profile.buyingPower > 0) {
      allocationData.push({ 
        name: 'Cash', 
        value: profile.buyingPower,
        color: '#10b981'
      });
    }

    // Convert values to percentages for the pie chart
    const finalAllocation = allocationData.map(item => ({
      ...item,
      value: Number(((item.value / (totalPortfolioValue || 1)) * 100).toFixed(1))
    }));

    // Generate some mock performance data based on totalPnL
    const performanceData = [];
    let currentVal = totalPortfolioValue - totalPnL;
    for (let i = 0; i < 7; i++) {
      currentVal += totalPnL / 7;
      performanceData.push({
        time: `Day ${i + 1}`,
        value: Number(currentVal.toFixed(2))
      });
    }
    
    return {
      totalValue: totalPortfolioValue,
      totalPnL: totalPnL,
      dailyPnL: totalPnL,
      allocationData: finalAllocation,
      performanceData
    };
  }, [profile]);

  // Protect tabs
  useEffect(() => {
    const protectedTabs = ['trading', 'settings'];
    if (!user && protectedTabs.includes(activeTab)) {
      setActiveTab('dashboard');
      setIsAuthModalOpen(true);
    }
  }, [activeTab, user]);

  useEffect(() => {
    // Generate random chart data for selected stock based on time frame
    const data = [];
    let basePrice = selectedStock.price;
    const points = timeFrame === '1D' ? 24 : timeFrame === '1W' ? 7 : timeFrame === '1M' ? 30 : 12;
    const labelPrefix = timeFrame === '1D' ? 'H' : timeFrame === '1W' ? 'Day ' : timeFrame === '1M' ? 'Day ' : 'Month ';

    for (let i = 0; i < points; i++) {
      basePrice = basePrice + (Math.random() - 0.5) * (basePrice * 0.02);
      data.push({
        time: `${labelPrefix}${i + 1}`,
        price: Number(basePrice.toFixed(2))
      });
    }
    setChartData(data);
  }, [selectedStock, timeFrame]);

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!user || !profile) {
      setIsAuthModalOpen(true);
      return;
    }

    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const totalCost = currentPrice * quantity;
    if (type === 'buy' && profile.buyingPower < totalCost) {
      alert('Insufficient buying power');
      return;
    }

    if (type === 'sell') {
      const holding = profile.holdings?.find(h => h.symbol === selectedStock.symbol);
      if (!holding || holding.amount < quantity) {
        alert('Insufficient shares');
        return;
      }
    }

    const newBuyingPower = type === 'buy' ? profile.buyingPower - totalCost : profile.buyingPower + totalCost;
    
    // Enhanced holdings update logic with avgPrice
    let newHoldings = [...(profile.holdings || [])];
    const existingIdx = newHoldings.findIndex(h => h.symbol === selectedStock.symbol);
    
    if (type === 'buy') {
      if (existingIdx >= 0) {
        const currentHolding = newHoldings[existingIdx];
        const totalAmount = currentHolding.amount + quantity;
        const totalCostBasis = (currentHolding.amount * (currentHolding.avgPrice || 0)) + totalCost;
        newHoldings[existingIdx] = {
          ...currentHolding,
          amount: totalAmount,
          avgPrice: Number((totalCostBasis / totalAmount).toFixed(2))
        };
      } else {
        newHoldings.push({ 
          symbol: selectedStock.symbol, 
          amount: quantity, 
          avgPrice: currentPrice 
        });
      }
    } else {
      const currentHolding = newHoldings[existingIdx];
      newHoldings[existingIdx] = {
        ...currentHolding,
        amount: currentHolding.amount - quantity
      };
      if (newHoldings[existingIdx].amount <= 0) {
        newHoldings.splice(existingIdx, 1);
      }
    }

    try {
      await updateProfile({
        buyingPower: newBuyingPower,
        holdings: newHoldings
      });

      setQuantity(0);
      alert(`${type.toUpperCase()} order completed for ${quantity} shares of ${selectedStock.symbol}`);
    } catch (error) {
      console.error("Trade error:", error);
      alert("Failed to execute trade. Please try again.");
    }
  };

  // Add Admin to nav items via a secret toggle or just for demo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        // Admin toggle logic removed in favor of real AuthContext isAdmin
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      <WithdrawalNotification />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAuth={() => setIsAuthModalOpen(true)} />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} />
      
      {user && <SupportChat />}

      {/* Admin Toggle Notification */}
      {isAdmin && (
        <div className="bg-red-600 text-white text-[10px] font-bold py-1 px-4 text-center uppercase tracking-widest">
          Admin Mode Active - Use with Caution
        </div>
      )}

      <MarketTicker />
      
      <main className="flex-grow">
        {activeTab === 'dashboard' && (
          <div className="space-y-12 pb-20">
            {!user && <Hero onOpenAuth={() => setIsAuthModalOpen(true)} />}
            <div className="max-w-7xl mx-auto px-4 mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center text-ink">
                  <Activity className="mr-2 text-brand" />
                  Portfolio Overview
                </h2>
                <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                  {['All', 'Stocks', 'ETFs', 'Bonds'].map((cat) => (
                    <button key={cat} className="px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold bg-white border border-border text-ink-muted hover:border-brand hover:text-brand transition-all whitespace-nowrap">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {user ? (
                <div className="space-y-6">
                  <div className="flex justify-end space-x-4">
                    <button 
                      onClick={() => setIsDepositModalOpen(true)}
                      className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-all flex items-center space-x-2 shadow-lg shadow-brand/20"
                    >
                      <ArrowUpRight size={18} />
                      <span>Deposit</span>
                    </button>
                    <button 
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="bg-white text-ink border border-border px-6 py-2.5 rounded-xl font-bold hover:bg-surface transition-all flex items-center space-x-2"
                    >
                      <ArrowDownLeft size={18} />
                      <span>Withdraw</span>
                    </button>
                  </div>

                  {declineNotice && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start space-x-3"
                    >
                      <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={18} />
                      <div className="flex-grow">
                        <p className="text-xs font-bold text-red-900 uppercase tracking-wider mb-1">Verification Required</p>
                        <p className="text-sm text-red-700 font-medium">{declineNotice}</p>
                      </div>
                      <button 
                        onClick={() => setDeclineNotice(null)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}

                  <BentoGrid 
                    portfolioValue={portfolioStats.totalValue}
                    buyingPower={profile?.buyingPower || 0}
                    holdingsCount={profile?.holdings?.length || 0}
                    dailyPnL={portfolioStats.totalPnL}
                    pnlPct={portfolioStats.totalPnLPct}
                    allocationData={portfolioStats.allocationData}
                    performanceData={portfolioStats.performanceData}
                  />
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-border shadow-sm">
                  <LayoutDashboard size={48} className="mx-auto text-brand/20 mb-4" />
                  <h3 className="text-xl font-bold text-ink mb-2">Your Portfolio Awaits</h3>
                  <p className="text-ink-muted max-w-md mx-auto mb-8">Sign in to track your assets, monitor performance, and manage your global investment strategy in real-time.</p>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                  >
                    Connect Account
                  </button>
                </div>
              )}
              
              <Reviews />
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <button 
                  onClick={() => setIsStockListOpen(!isStockListOpen)}
                  className="flex items-center justify-between md:justify-start space-x-3 bg-white border border-border px-4 py-2 rounded-xl hover:border-brand transition-all w-full md:w-auto"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center text-brand font-bold">
                      {selectedStock.symbol[0]}
                    </div>
                    <div className="text-left">
                      <h2 className="text-base md:text-lg font-bold text-ink flex items-center">
                        {selectedStock.symbol} <ChevronDown size={16} className="ml-1 text-ink-muted" />
                      </h2>
                      <p className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">{selectedStock.name}</p>
                    </div>
                  </div>
                </button>

                {isStockListOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-border bg-surface/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={12} />
                        <input type="text" placeholder="Search stocks..." className="w-full bg-white border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand" />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {stocks.map(stock => (
                        <button 
                          key={stock.symbol}
                          onClick={() => {
                            setSelectedStock(stock);
                            setIsStockListOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-surface transition-colors text-left border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-bold text-ink text-sm">{stock.symbol}</p>
                            <p className="text-[10px] text-ink-muted">{stock.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-ink">${stock.price.toFixed(2)}</p>
                            <p className={`text-[10px] font-bold ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stock.change}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center space-x-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-ink-muted">
                <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> Market Open</span>
                <span className="hidden md:inline">NASDAQ: 16,428.82 <span className="text-green-600">+1.2%</span></span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Chart Area */}
              <Card className="lg:col-span-8 h-[400px] md:h-[600px] flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-4 border-b border-border -mx-6 -mt-6 gap-4">
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-ink">{selectedStock.symbol}</h3>
                      <p className="text-[10px] md:text-xs text-ink-muted">{selectedStock.name}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-lg md:text-xl font-bold text-ink">${selectedStock.price}</p>
                      <p className={`text-[10px] md:text-xs font-bold ${selectedStock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{selectedStock.change}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 md:space-x-2">
                    {['1D', '1W', '1M', '1Y'].map(tf => (
                      <button 
                        key={tf} 
                        onClick={() => setTimeFrame(tf)}
                        className={`px-2.5 md:px-3 py-1 rounded text-[9px] md:text-[10px] font-bold border transition-all ${tf === timeFrame ? 'bg-brand text-white border-brand' : 'bg-surface text-ink-muted border-border hover:border-brand'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0052FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#0052FF', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#0052FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Order Panel & Order Book */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-0 overflow-hidden">
                  <div className="flex border-b border-border">
                    <button className="flex-1 py-3 text-xs font-bold border-b-2 border-brand text-brand bg-brand/5">Market</button>
                    <button className="flex-1 py-3 text-xs font-bold text-ink-muted hover:text-ink transition-colors">Limit</button>
                    <button className="flex-1 py-3 text-xs font-bold text-ink-muted hover:text-ink transition-colors">Stop</button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Quantity</label>
                        <span className="text-[10px] text-brand font-bold">Max: {Math.floor(profile?.buyingPower / selectedStock.price)}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="w-full bg-surface border border-border rounded-lg p-3 focus:outline-none focus:border-brand transition-colors text-ink font-bold pr-12" 
                          placeholder="0" 
                          value={quantity || ''}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-muted">SHARES</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-ink-muted font-bold uppercase tracking-wider mb-1 block">Estimated Cost</label>
                      <div className="p-3 bg-surface rounded-lg border border-border flex justify-between items-center">
                        <span className="text-ink font-bold">${(quantity * selectedStock.price).toLocaleString()}</span>
                        <span className="text-[10px] text-ink-muted">USD</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => handleTrade('buy')}
                        className="bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                      >
                        BUY
                      </button>
                      <button 
                        onClick={() => handleTrade('sell')}
                        className="bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                      >
                        SELL
                      </button>
                    </div>
                    
                    {/* Current Position Info */}
                    {user && profile?.holdings?.find(h => h.symbol === selectedStock.symbol) && (() => {
                      const holding = profile.holdings.find(h => h.symbol === selectedStock.symbol);
                      const costBasis = holding.amount * (holding.avgPrice || 0);
                      const currentValue = holding.amount * currentPrice;
                      const pnl = currentValue - costBasis;
                      const pnlPct = (pnl / costBasis) * 100;
                      
                      return (
                        <div className="mt-4 p-4 bg-surface rounded-2xl border border-border space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Your Position</span>
                            <span className="text-xs font-bold text-ink">{holding.amount} Shares</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Avg. Price</span>
                            <span className="text-xs font-bold text-ink">${holding.avgPrice?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Cost Basis</span>
                            <span className="text-xs font-bold text-ink">${costBasis.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t border-border flex justify-between items-center">
                            <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Profit/Loss</span>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                              </p>
                              <p className={`text-[10px] font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="p-4 border-b border-border bg-surface/50">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-widest">Order Book</h3>
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="grid grid-cols-3 text-[10px] font-bold text-ink-muted uppercase tracking-tighter mb-2">
                      <span>Price</span>
                      <span className="text-right">Size</span>
                      <span className="text-right">Total</span>
                    </div>
                    {[186.10, 186.05, 186.00, 185.95].map(price => (
                      <div key={price} className="grid grid-cols-3 text-[10px] font-mono py-0.5 group">
                        <span className="text-red-500 font-bold">{price.toFixed(2)}</span>
                        <span className="text-right text-ink">{(Math.random() * 1000).toFixed(0)}</span>
                        <span className="text-right text-ink-muted">{(Math.random() * 5000).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="py-2 my-1 border-y border-border/50 text-center">
                      <span className="text-sm font-bold text-ink">$185.92</span>
                    </div>
                    {[185.85, 185.80, 185.75, 185.70].map(price => (
                      <div key={price} className="grid grid-cols-3 text-[10px] font-mono py-0.5">
                        <span className="text-green-500 font-bold">{price.toFixed(2)}</span>
                        <span className="text-right text-ink">{(Math.random() * 1000).toFixed(0)}</span>
                        <span className="text-right text-ink-muted">{(Math.random() * 5000).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-ink">Market Intelligence</h2>
              <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {['All News', 'Analysis', 'Earnings', 'Macro'].map(filter => (
                  <button key={filter} className="px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold bg-white border border-border text-ink-muted hover:border-brand hover:text-brand transition-all whitespace-nowrap">
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 group cursor-pointer hover:border-brand/30 transition-all">
                    <div className="w-full md:w-56 h-40 rounded-xl bg-surface overflow-hidden flex-shrink-0 border border-border">
                      <img 
                        src={`https://picsum.photos/seed/finance_news${i}/500/400`} 
                        alt="news" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded uppercase font-bold tracking-wider">Analysis</span>
                          <span className="text-[10px] text-ink-muted font-medium">March 24, 2026</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-ink group-hover:text-brand transition-colors leading-tight">Quarterly Earnings Report: Tech Giants Show Resilience Amid Economic Shifts</h3>
                        <p className="text-ink-muted text-sm line-clamp-2 leading-relaxed">Our analysts dive deep into the latest financial statements from the top 500 companies, revealing key trends in consumer spending and corporate investment...</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <button className="text-brand text-xs font-bold flex items-center hover:underline">
                          Read Full Report <ArrowRight size={14} className="ml-1" />
                        </button>
                        <div className="flex items-center space-x-4 text-ink-muted">
                          <span className="text-[10px] font-bold">5 min read</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="space-y-6">
                <Card>
                  <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-6">Trending Topics</h3>
                  <div className="space-y-4">
                    {['#FedRates', '#TechEarnings', '#OilPrices', '#AIBoom', '#GlobalTrade'].map((topic, idx) => (
                      <div key={idx} className="flex items-center justify-between group cursor-pointer">
                        <span className="text-sm text-ink-muted group-hover:text-brand transition-colors">{topic}</span>
                        <span className="text-[10px] font-bold bg-surface px-2 py-1 rounded border border-border">{Math.floor(Math.random() * 100)}k posts</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="bg-brand text-white border-brand">
                  <h3 className="text-lg font-bold mb-2">Premium Research</h3>
                  <p className="text-xs text-white/80 mb-6 leading-relaxed">Get exclusive access to institutional-grade market analysis and stock picks.</p>
                  <button className="w-full bg-white text-brand py-3 rounded-xl font-bold text-sm hover:bg-surface transition-colors">Upgrade to Pro</button>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h2 className="text-3xl font-bold text-ink">Account Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {/* Client Details */}
                <Card>
                  <div className="flex items-center space-x-2 mb-6">
                    <User size={20} className="text-brand" />
                    <h3 className="font-bold text-ink">Client Details</h3>
                  </div>
                  
                  {user ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-bold text-ink">{profile?.displayName || 'Not Set'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-bold text-ink">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Account ID</p>
                        <p className="text-sm font-bold text-brand">#{profile?.numericId || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Arathel (ARATHEL) Holdings</p>
                        <p className="text-sm font-bold text-brand">
                          {profile?.holdings?.find(h => h.symbol === 'ARATHEL')?.amount?.toLocaleString() || '0'} ARATHEL
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Member Since</p>
                        <p className="text-sm font-bold text-ink">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Account Type</p>
                        <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-bold rounded uppercase">Individual Brokerage</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">KYC Status</p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-surface rounded-xl border border-dashed border-border">
                      <Shield size={32} className="text-brand/20 mx-auto mb-2" />
                      <p className="text-sm font-bold text-ink-muted">Sign in to view your details</p>
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="mt-4 text-brand text-xs font-bold hover:underline"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </Card>

                <Card>
                  <h3 className="font-bold mb-4 text-ink">Security & Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                      <div>
                        <p className="font-bold text-ink">Two-Factor Authentication</p>
                        <p className="text-xs text-ink-muted">Recommended for all accounts</p>
                      </div>
                      <div className="w-12 h-6 bg-brand rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <CreditCard size={20} className="text-brand" />
                      <h3 className="font-bold text-ink">Saved Payment Methods</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {profile?.paymentMethods?.length ? (
                      profile.paymentMethods.map((pm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-brand/10 text-brand rounded-lg flex items-center justify-center">
                              {pm.type === 'card' ? <CreditCard size={16} /> : pm.type === 'bank' ? <Landmark size={16} /> : <Wallet size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink">{pm.name || pm.type.toUpperCase()}</p>
                              <p className="text-[10px] text-ink-muted">{pm.last4 ? `**** ${pm.last4}` : pm.address || 'Saved Method'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              const newMethods = profile.paymentMethods?.filter((_, i) => i !== idx);
                              await updateProfile({ paymentMethods: newMethods });
                            }}
                            className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-surface rounded-xl border border-dashed border-border">
                        <p className="text-xs text-ink-muted">No saved payment methods.</p>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-ink-muted italic text-center">
                      Payment methods are automatically saved when you complete a successful deposit.
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <History size={20} className="text-brand" />
                      <h3 className="font-bold text-ink">Transaction History</h3>
                    </div>
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Last 10 Activities</span>
                  </div>

                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 bg-surface rounded-xl border border-dashed border-border">
                        <p className="text-xs text-ink-muted">No transactions found.</p>
                      </div>
                    ) : (
                      transactions.slice(0, 10).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border group hover:border-brand/30 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              tx.type === 'withdrawal' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                            )}>
                              {tx.type === 'withdrawal' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-ink capitalize">{tx.type || 'Deposit'} via {tx.method}</p>
                              <p className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-sm font-black", tx.type === 'withdrawal' ? "text-red-600" : "text-green-600")}>
                              {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              {tx.status === 'completed' ? (
                                <span className="flex items-center text-[9px] font-bold text-green-600 uppercase tracking-widest">
                                  <CheckCircle2 size={10} className="mr-1" /> Success
                                </span>
                              ) : tx.status === 'rejected' ? (
                                <div className="flex flex-col items-end">
                                  <span className="flex items-center text-[9px] font-bold text-red-600 uppercase tracking-widest">
                                    <XCircle size={10} className="mr-1" /> Declined
                                  </span>
                                  {tx.declineReason && (
                                    <p className="text-[8px] text-red-400 font-medium mt-0.5 max-w-[120px] truncate" title={tx.declineReason}>
                                      {tx.declineReason}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="flex items-center text-[9px] font-bold text-yellow-600 uppercase tracking-widest">
                                  <Clock size={10} className="mr-1" /> Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-surface/50 border-dashed">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-4">Account Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-ink-muted">Portfolio Value</span>
                      <span className="text-sm font-bold text-ink">${profile?.portfolioValue?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-ink-muted">Buying Power</span>
                      <span className="text-sm font-bold text-brand">${profile?.buyingPower?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="pt-4 border-t border-border flex space-x-3">
                      <button 
                        onClick={() => setIsDepositModalOpen(true)}
                        className="flex-1 bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-hover transition-all flex items-center justify-center space-x-2"
                      >
                        <ArrowUpRight size={16} />
                        <span>Deposit</span>
                      </button>
                      <button 
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="flex-1 bg-white text-ink border border-border py-3 rounded-xl font-bold text-sm hover:bg-surface transition-all flex items-center justify-center space-x-2"
                      >
                        <ArrowDownLeft size={16} />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand/5 border-brand/20">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard size={18} className="text-brand" />
                    <h3 className="text-xs font-bold text-ink uppercase tracking-widest">Available Deposit Options</h3>
                  </div>
                  <div className="space-y-3">
                    {accounts.length === 0 ? (
                      <p className="text-[10px] text-ink-muted italic">No public deposit options available.</p>
                    ) : (
                      accounts.map((acc) => (
                        <div key={acc.id} className="p-3 bg-white rounded-xl border border-brand/10 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              acc.type === 'bank' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {acc.type === 'bank' ? <Landmark size={14} /> : <Wallet size={14} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink">{acc.name}</p>
                              <p className="text-[9px] text-ink-muted uppercase font-bold tracking-tighter">{acc.type}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsDepositModalOpen(true)}
                            className="text-[9px] font-bold text-brand hover:underline uppercase"
                          >
                            Use
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {isAdmin && (
                  <button 
                    onClick={() => setActiveTab('admin')}
                    className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 hover:bg-red-100 transition-all font-bold"
                  >
                    <ShieldAlert size={20} />
                    <span>Access Admin Control Center</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>

      <footer className="bg-white border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <BarChart2 className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-ink">ARATHEL <span className="text-brand">NETWORK</span></h1>
            </div>
            <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
              Arathel Network is a leading multi-asset investment platform providing institutional-grade tools for individual investors worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-ink mb-4">Platform</h4>
            <ul className="text-ink-muted text-sm space-y-3">
              <li className="hover:text-brand cursor-pointer transition-colors">Stock Markets</li>
              <li className="hover:text-brand cursor-pointer transition-colors">ETF Screener</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Institutional Research</li>
              <li className="hover:text-brand cursor-pointer transition-colors">API Access</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ink mb-4">Support</h4>
            <ul className="text-ink-muted text-sm space-y-3">
              <li className="hover:text-brand cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-brand cursor-pointer transition-colors">
                <a href="https://wa.me/13363247969" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>WhatsApp Support</span>
                </a>
              </li>
              <li className="hover:text-brand cursor-pointer transition-colors">Contact Support</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Security Center</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Regulatory Info</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center text-ink-muted text-xs">
          <p>© 2026 Arathel Network. Member SIPC & FINRA.</p>
          <div className="flex space-x-8 mt-4 md:mt-0 font-medium">
            <span className="hover:text-brand cursor-pointer">Privacy Policy</span>
            <span className="hover:text-brand cursor-pointer">Terms of Service</span>
            <span className="hover:text-brand cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper icons for footer
