import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface RegisterProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (username: string) => void;
}

export default function Register({ onBackToLogin, onRegisterSuccess }: RegisterProps) {
  // Balanced Form controlled states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Layout states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Client Validation checks and backend submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Trimming fields
    const fName = fullName.trim();
    const uName = username.trim();
    const uEmail = email.trim();
    const uPassword = password;
    const uConfirmPassword = confirmPassword;

    // 1. Mandatory input field validation
    if (!fName || !uName || !uEmail || !uPassword || !uConfirmPassword) {
      setError('Please fill in all the required signup fields to process.');
      return;
    }

    // 2. Email pattern validation checks
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(uEmail)) {
      setError('Please provide a valid, well-formed email address (e.g. candidate@example.com).');
      return;
    }

    // 3. Password length requirements (minimum 8 characters)
    if (uPassword.length < 8) {
      setError('Your password security is too weak. It must occupy at least 8 characters.');
      return;
    }

    // 4. Passwords match verification checks
    if (uPassword !== uConfirmPassword) {
      setError('Verify your inputs: Password and Confirm Password fields must match exactly.');
      return;
    }

    // 5. Terms of Service checkbox verification
    if (!agreeTerms) {
      setError('You must read and agree to the Terms of Service & Privacy Guidelines before onboarding.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute REST payload write in django view
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fName,
          username: uName,
          email: uEmail,
          password: uPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Autostarting Secure Portal...');
        
        // Graceful automatic login sequence trigger or toggle back
        setTimeout(async () => {
          try {
            // Attempt auto-login with simplejwt token grant view as a convenience
            const loginRes = await fetch('/api/token/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: uName, password: uPassword })
            });
            if (loginRes.ok) {
              const tokens = await loginRes.json();
              localStorage.setItem('jobtracker_access_token', tokens.access);
              localStorage.setItem('jobtracker_refresh_token', tokens.refresh);
              onRegisterSuccess(uName);
            } else {
              // Redirect gracefully to login view state if autologin had a minor issue
              onBackToLogin();
            }
          } catch {
            onBackToLogin();
          }
        }, 1200);
      } else {
        setError(data.detail || 'Signup rejected by database. Handle or email may already be taken.');
      }
    } catch (networkError) {
      console.error('Registration server connection failure:', networkError);
      setError('Database link failed. Make sure your local Django dev server is fully active and listening.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center font-sans relative px-4 py-12 select-none overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid Pattern overlay mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        {/* Upper Identity Signature */}
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            whileHover={{ scale: 1.08 }}
            className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/25 mb-3"
          >
            <UserPlus className="w-6 h-6" />
          </motion.div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Onboard JobTracker</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2.5 py-0.5 rounded-lg border border-indigo-800/45">
              NEW CANDIDATE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Join the premium full-stack carrier pipeline tracker</p>
        </div>

        {/* Signup form body wrapper card */}
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Aesthetic accent header strip */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Error and Success Banners */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 px-4 py-3.5 rounded-xl text-left font-sans"
            >
              <AlertCircle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-400 block">Verification Alert</span>
                <p className="text-rose-300 leading-normal mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 px-4 py-3.5 rounded-xl text-left font-sans"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-450 block">Registered Successfully</span>
                <p className="text-emerald-350 leading-normal mt-0.5">{success}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {/* Full Name */}
            <div>
              <label htmlFor="fullname-input" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="fullname-input"
                  required
                  type="text"
                  placeholder="e.g. Vikram Dev"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs transition outline-none text-slate-150 placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="register-username-input" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Username Handle *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="register-username-input"
                  required
                  type="text"
                  placeholder="e.g. vikram_candidate"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs transition outline-none text-slate-150 placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email-input" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="email-input"
                  required
                  type="email"
                  placeholder="e.g. vikram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs transition outline-none text-slate-150 placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Password * (min 8)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-password"
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
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-confirm"
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-11 text-xs transition outline-none text-slate-150 placeholder:text-slate-600 disabled:opacity-50 font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="mt-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <div className="relative shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition ${
                    agreeTerms 
                      ? 'bg-indigo-600 border-indigo-500' 
                      : 'border-slate-800 bg-slate-950 group-hover:border-slate-600'
                  } flex items-center justify-center`}>
                    {agreeTerms && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] leading-relaxed font-semibold text-slate-400 group-hover:text-slate-200 transition-colors select-none text-left">
                  I read and agree to follow the standard candidates user policy, security protocol guidelines, and mock terms of service.
                </span>
              </label>
            </div>

            {/* Primary Signup Request button */}
            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.015 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-3 ${
                isSubmitting 
                  ? 'bg-indigo-600/50 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/10 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Constructing Secure Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Onboard New Account</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Already have an account back link */}
          <div className="mt-6 pt-5 border-t border-slate-850 text-center">
            <span className="text-xs text-slate-400">Already logged or have an active account? </span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Log In</span>
            </button>
          </div>

        </div>

        {/* Footer info line */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            JobTracker REGISTER SUITE v1.4 • DB Transactional Safe
          </p>
        </div>
      </motion.div>
    </div>
  );
}
