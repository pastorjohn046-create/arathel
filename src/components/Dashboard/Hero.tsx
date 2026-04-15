import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export const Hero: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <section className="relative pt-24 pb-12 overflow-hidden bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-bold tracking-widest uppercase border border-brand/20">
                Institutional-Grade
              </span>
              <span className="text-[10px] text-ink-muted font-bold uppercase tracking-widest">
                Trusted by 2M+ Investors
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-ink mb-6 leading-[1.1]">
              The Future of <br />
              <span className="text-brand">Wealth Management</span>
            </h1>
            <p className="text-ink-muted text-base md:text-xl max-w-xl mb-10 leading-relaxed">
              Arathel Network provides a sophisticated trading environment for stocks, ETFs, and commodities. Built for precision, security, and performance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onOpenAuth}
                className="w-full sm:w-auto bg-brand text-white px-8 py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center hover:bg-brand-hover transition-all shadow-xl shadow-brand/20 active:scale-95"
              >
                Get Started Now
                <ArrowRight className="ml-2" size={20} />
              </button>
              <button className="w-full sm:w-auto bg-white text-ink px-8 py-4 rounded-xl font-bold text-base md:text-lg border border-border hover:bg-surface transition-all active:scale-95">
                View Markets
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-20 bg-brand/5 blur-[100px] rounded-full opacity-50" />
            <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-border">
              <img 
                src="https://picsum.photos/seed/trading_pro/1000/800" 
                alt="Trading Interface" 
                className="rounded-2xl w-full h-auto"
                referrerPolicy="no-referrer"
              />
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-border max-w-[200px]">
                <p className="text-[10px] font-bold text-ink-muted uppercase mb-1">Portfolio Growth</p>
                <p className="text-2xl font-bold text-ink">+24.8%</p>
                <div className="mt-2 h-1 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[75%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Market Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-border">
          {[
            { name: 'S&P 500', value: '5,137.08', change: '+1.03%', up: true },
            { name: 'Dow Jones', value: '38,996.39', change: '+0.23%', up: true },
            { name: 'Nasdaq', value: '16,274.94', change: '+1.14%', up: true },
            { name: 'Gold', value: '2,114.10', change: '-0.15%', up: false },
          ].map((index, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{index.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-ink">{index.value}</span>
                <span className={`text-[10px] font-bold ${index.up ? 'text-green-600' : 'text-red-600'}`}>
                  {index.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
