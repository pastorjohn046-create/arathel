import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, ShieldCheck, Activity } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-brand rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/30 mb-8 relative overflow-hidden">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <BarChart3 className="text-white" size={48} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-ink mb-2">
          ARATHEL <span className="text-brand">NETWORK</span>
        </h1>
        <p className="text-sm font-bold text-ink-muted uppercase tracking-[0.3em] mb-12">
          Institutional Grade Trading
        </p>

        <div className="flex space-x-8">
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck className="text-brand" size={20} />
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Secure</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Activity className="text-brand" size={20} />
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Real-time</span>
          </div>
        </div>

        <div className="mt-16 w-48 h-1 bg-border rounded-full overflow-hidden relative">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-brand"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
