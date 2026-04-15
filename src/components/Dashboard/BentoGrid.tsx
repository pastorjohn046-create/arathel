import React from 'react';
import { Card } from '../ui/Card';
import { PortfolioChart, PnLChart } from './PortfolioChart';
import { ArrowUpRight, ArrowDownRight, Newspaper, Zap, Wallet, BarChart3, Activity, TrendingUp } from 'lucide-react';

interface BentoGridProps {
  portfolioValue?: number;
  dailyPnL?: number;
  pnlPct?: number;
  holdingsCount?: number;
  buyingPower?: number;
  watchlist?: any[];
  allocationData?: any[];
  performanceData?: any[];
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  portfolioValue = 124592.45,
  dailyPnL = 1240.00,
  pnlPct = 1.2,
  holdingsCount = 24,
  buyingPower = 4500.00,
  watchlist = [
    { symbol: 'TSLA', price: '175.22', change: '-1.2%' },
    { symbol: 'MSFT', price: '415.50', change: '+0.8%' },
    { symbol: 'NVDA', price: '875.28', change: '+2.5%' },
    { symbol: 'AMZN', price: '178.15', change: '+0.4%' },
  ],
  allocationData,
  performanceData,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-4 md:gap-6 p-2 md:p-4 max-w-7xl mx-auto">
      {/* Main Portfolio Card */}
      <Card className="md:col-span-2 md:row-span-2 flex flex-col justify-between p-4 md:p-6">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="stat-label">Total Portfolio Value</p>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1">${portfolioValue.toLocaleString()}</h2>
            </div>
            <div className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center ${dailyPnL >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {dailyPnL >= 0 ? <ArrowUpRight size={14} className="md:mr-1" /> : <ArrowDownRight size={14} className="md:mr-1" />}
              <span className="hidden xs:inline">{dailyPnL >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>
              <span className="xs:hidden">{pnlPct.toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-40 md:h-56">
            <PnLChart data={performanceData} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <p className="stat-label text-[10px]">Daily P/L</p>
            <p className={`font-bold text-xs md:text-base ${dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dailyPnL >= 0 ? '+' : '-'}${Math.abs(dailyPnL).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="stat-label text-[10px]">Holdings</p>
            <p className="text-ink font-bold text-xs md:text-base">{holdingsCount} Stocks</p>
          </div>
          <div>
            <p className="stat-label text-[10px]">Buying Power</p>
            <p className="text-brand font-bold text-xs md:text-base">${buyingPower.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Asset Allocation */}
      <Card className="md:col-span-1 md:row-span-2">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet size={18} className="text-brand" />
          <h3 className="font-bold text-ink">Asset Allocation</h3>
        </div>
        <PortfolioChart data={allocationData} />
      </Card>

      {/* Watchlist */}
      <Card className="md:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity size={18} className="text-brand" />
            <h3 className="font-bold text-ink">Watchlist</h3>
          </div>
          <span className="text-[10px] font-bold text-brand cursor-pointer uppercase">Edit</span>
        </div>
        <div className="space-y-3">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="flex justify-between items-center group cursor-pointer">
              <span className="text-xs font-bold text-ink group-hover:text-brand transition-colors">{stock.symbol}</span>
              <div className="text-right">
                <p className="text-xs font-bold text-ink">${stock.price}</p>
                <p className={`text-[10px] font-bold ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Gainers */}
      <Card className="md:col-span-1">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={18} className="text-green-600" />
          <h3 className="font-bold text-ink">Top Gainers</h3>
        </div>
        <div className="space-y-3">
          {[
            { symbol: 'AMD', change: '+5.2%' },
            { symbol: 'META', change: '+4.8%' },
            { symbol: 'GOOGL', change: '+3.9%' },
          ].map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
              <span className="text-xs font-bold text-ink">{stock.symbol}</span>
              <span className="text-xs font-bold text-green-600">{stock.change}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Market News */}
      <Card className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Newspaper size={18} className="text-brand" />
            <h3 className="font-bold text-ink">Market Insights</h3>
          </div>
          <span className="text-[10px] text-brand cursor-pointer hover:underline font-bold uppercase tracking-wider">View All</span>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 group cursor-pointer">
              <div className="w-full sm:w-16 h-32 sm:h-16 rounded-lg bg-surface flex-shrink-0 overflow-hidden border border-border">
                <img 
                  src={`https://picsum.photos/seed/finance${i}/200/200`} 
                  alt="news" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-ink line-clamp-2 sm:line-clamp-1 group-hover:text-brand transition-colors">S&P 500 Hits New Record High Amid Tech Rally</h4>
                <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2 sm:line-clamp-1">Investors remain optimistic as corporate earnings exceed expectations...</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold uppercase">Markets</span>
                  <span className="text-[9px] text-ink-muted">2h ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Stats */}
      <Card className="md:col-span-1">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 size={18} className="text-brand" />
          <h3 className="font-bold text-ink">Performance</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-ink-muted">Weekly Return</span>
            <span className="text-green-600 text-sm font-bold">+4.2%</span>
          </div>
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
            <div className="bg-brand h-full w-[70%]" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-ink-muted">Monthly Return</span>
            <span className="text-green-600 text-sm font-bold">+18.5%</span>
          </div>
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
            <div className="bg-brand h-full w-[85%]" />
          </div>
        </div>
      </Card>
    </div>
  );
};
