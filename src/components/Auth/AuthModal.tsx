import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-ink">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              {isLogin ? 'Enter your credentials to access your portfolio' : 'Join Arathel Network and start trading'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl p-3 pl-10 focus:outline-none focus:border-brand transition-colors text-ink"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 pl-10 focus:outline-none focus:border-brand transition-colors text-ink"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 pl-10 focus:outline-none focus:border-brand transition-colors text-ink"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              className="w-full bg-brand text-white py-4 rounded-xl font-bold hover:bg-brand/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-ink-muted hover:text-brand transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
