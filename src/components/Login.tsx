import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  onGoToRegister: () => void;
}

export default function Login({ onLoginSuccess, onGoToRegister }: LoginProps) {
  // Controlled States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Client-side Validation & API Request
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Strict Client-side Validation (Trimming checks)
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setError('Username or Email is required.');
      return;
    }
    
    if (!trimmedPassword) {
      setError('Password is required.');
      return;
    }

    if (trimmedPassword.length < 5) {
      setError('Password is too short. It must be at least 5 character units.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Perform authentic JWT obtain fetch call
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Keep standard JWT keys inside localStorage for continuous requests
        localStorage.setItem('jobtracker_access_token', data.access);
        localStorage.setItem('jobtracker_refresh_token', data.refresh);
        
        if (rememberMe) {
          localStorage.setItem('jobtracker_remembered_username', trimmedUsername);
        } else {
          localStorage.removeItem('jobtracker_remembered_username');
        }

        setSuccess('Authentication successful! Initializing candidate workspace credentials...');
        
        // Let user see the green toast glow for a brief moment before shifting
        setTimeout(() => {
          onLoginSuccess(trimmedUsername);
        }, 1100);
      } else {
        // Django error or authentication failure response details
        const detailError = data.detail || 'The credentials you specified did not match active PostgreSQL database entries.';
        setError(detailError);
      }
    } catch (networkError) {
      console.error('Network Error during login fetch:', networkError);
      setError('Connection to Django postgres SQL server could not be established. Ensure server is initialized.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-populate credentials helper
  const handlePreFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center font-sans relative px-4 py-12 select-none overflow-hidden">
      {/* Background radial atmosphere glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        {/* Main Logo Signpost */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.08 }}
            className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/20 mb-3"
          >
            <LogIn className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>JobTracker</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-800/40">
              SECURE DOOR
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Django & PostgreSQL Career Pipeline Portal</p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top aesthetic accent band */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Success / Error State Alert Banners */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 px-4 py-3 rounded-xl text-left"
            >
              <AlertCircle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-400 block">Security Alert</span>
                <p className="text-rose-300/90 leading-normal mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 rounded-xl text-left"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-450 block">Success Verified</span>
                <p className="text-emerald-350/90 leading-normal mt-0.5">{success}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            {/* Username/Email Input */}
            <div>
              <label 
                htmlFor="username-input" 
                className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider"
              >
                Username or Email Address
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="username-input"
                  required
                  type="text"
                  placeholder="e.g. vikram"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs transition outline-none text-slate-150 placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label 
                  htmlFor="password-input" 
                  className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  Password
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    setError('To resolve credentials, please utilize the default admin passwords shown in the helpful credentials drawer below.');
                  }}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="password-input"
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-11 text-xs transition outline-none text-slate-150 placeholder:text-slate-600 disabled:opacity-50 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition ${
                    rememberMe 
                      ? 'bg-indigo-600 border-indigo-500' 
                      : 'border-slate-800 bg-slate-950 group-hover:border-slate-600'
                  } flex items-center justify-center`}>
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors select-none">
                  Keep me signed in
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.015 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                isSubmitting 
                  ? 'bg-indigo-600/50 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/10 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Configuring Workspace Key...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Verify Login credentials</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Credentials Helper Box (Fideli-Drawer) */}
          <div className="mt-6 pt-5 border-t border-slate-850 text-left">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Candidate Login details</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal mb-3">
              To interface with Django simplejwt, use the default seeded credentials.
            </p>
            <div className="bg-slate-950/80 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-2">
              <div className="text-[10px] text-slate-450 font-mono">
                <div><span className="text-slate-500">ID:</span> <strong className="text-indigo-300">vikram</strong></div>
                <div className="mt-0.5"><span className="text-slate-500">PW:</span> <strong className="text-indigo-300">vikram123</strong></div>
              </div>
              <button
                type="button"
                onClick={() => handlePreFill('vikram', 'vikram123')}
                className="text-[9px] bg-indigo-950 hover:bg-indigo-920 text-indigo-300 border border-indigo-900/30 px-2.5 py-1.5 rounded-lg font-bold transition select-none active:scale-95 shrink-0"
              >
                Auto-fill credentials
              </button>
            </div>
          </div>

          {/* New Account onboarding link */}
          <div className="mt-5 pt-4 border-t border-slate-850/60 text-center">
            <span className="text-xs text-slate-400">New to JobTracker? </span>
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-block cursor-pointer underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400"
            >
              Create Candidate Account
            </button>
          </div>

        </div>

        {/* Footer info line */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            JobTracker SECURE PROTOCOL v1.4 • JWT-Bearer Simple Rotator
          </p>
        </div>
      </motion.div>
    </div>
  );
}
