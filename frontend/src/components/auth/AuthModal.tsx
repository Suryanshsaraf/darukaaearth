import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('admin@darukaa.earth', 'admin123456');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-carbon-900 border border-emerald-900/60 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/60">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {isRegister ? 'Create Administrator Account' : 'Darukaa.Earth Login'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access geospatial MRV dashboards and PostGIS project sites
          </p>
        </div>

        {/* Quick Demo Login Pill */}
        <div className="mb-5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-semibold text-emerald-300 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Evaluation Demo Account
            </p>
            <p className="text-[11px] text-slate-400 font-mono">admin@darukaa.earth</p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/40 disabled:opacity-50"
          >
            Instant Demo Sign-In
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Ankita Dasgupta"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="admin@darukaa.earth"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/60 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Register & Authenticate' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-emerald-400 hover:underline font-semibold ml-1"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new administrator account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-emerald-400 hover:underline font-semibold ml-1"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
