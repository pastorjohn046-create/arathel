import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CreditCard } from 'lucide-react';

const NAMES = ['John Doe', 'Jane Smith', 'Michael Brown', 'Emily Davis', 'Chris Wilson', 'Sarah Miller', 'David Taylor', 'Jessica Moore', 'James Anderson', 'Linda Thomas', 'Robert Garcia', 'Maria Rodriguez', 'William Martinez', 'Patricia Hernandez', 'James Lopez'];

export const WithdrawalNotification = () => {
  const [currentNotification, setCurrentNotification] = useState<{ id: string, name: string, amount: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.floor(Math.random() * 900000 + 100000).toString();
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      
      // Generate a diverse range of amounts
      // 60% small ($100 - $900), 30% medium ($1,000 - $9,000), 10% large ($10,000 - $50,000)
      const rand = Math.random();
      let amount: number;
      if (rand < 0.6) {
        amount = Math.floor(Math.random() * 8 + 1) * 100 + Math.floor(Math.random() * 99);
      } else if (rand < 0.9) {
        amount = Math.floor(Math.random() * 8 + 1) * 1000 + Math.floor(Math.random() * 999);
      } else {
        amount = Math.floor(Math.random() * 4 + 1) * 10000 + Math.floor(Math.random() * 9999);
      }
      
      setCurrentNotification({ id, name, amount });
      
      // Clear after 3 seconds
      setTimeout(() => {
        setCurrentNotification(null);
      }, 3000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 z-[100] bg-white border border-border rounded-2xl shadow-2xl p-4 flex items-center space-x-4 max-w-xs"
        >
          <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center text-brand">
            <User size={24} />
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Recent Withdrawal</p>
            <p className="text-sm font-bold text-ink leading-tight">
              User <span className="text-brand">#{currentNotification.id}</span> ({currentNotification.name})
            </p>
            <div className="flex items-center mt-1 text-green-600">
              <CreditCard size={12} className="mr-1" />
              <span className="text-xs font-bold tracking-tight">Withdrew ${currentNotification.amount.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
