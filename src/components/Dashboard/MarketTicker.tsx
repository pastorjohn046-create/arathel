import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MOCK_ASSETS = [
  { symbol: 'AAPL', price: '185.92', change: '-0.3%' },
  { symbol: 'TSLA', price: '172.45', change: '+4.2%' },
  { symbol: 'MSFT', price: '415.50', change: '+1.1%' },
  { symbol: 'GOLD', price: '2,184.30', change: '+0.5%' },
  { symbol: 'OIL', price: '82.45', change: '+1.8%' },
  { symbol: 'NVDA', price: '894.30', change: '+2.4%' },
  { symbol: 'AMZN', price: '178.10', change: '-0.8%' },
];

export const MarketTicker: React.FC = () => {
  return (
    <div className="w-full bg-white border-y border-border py-2 overflow-hidden whitespace-nowrap shadow-sm">
      <motion.div 
        className="inline-block"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {[...MOCK_ASSETS, ...MOCK_ASSETS].map((asset, idx) => (
          <div key={idx} className="inline-flex items-center mx-8 space-x-2">
            <span className="font-bold text-ink">{asset.symbol}</span>
            <span className="font-mono text-brand">{asset.price}</span>
            <span className={asset.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
              {asset.change}
            </span>
            {asset.change.startsWith('+') ? (
              <TrendingUp size={14} className="text-green-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
