import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      // Save auth info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userEmail', res.data.user.email);
      localStorage.setItem('userAvatar', res.data.user.avatar);

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Password reset link has been sent to your email (Demo mode).');
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primaryAccent/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondaryAccent/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-premium border border-white/5 relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent-gradient flex items-center justify-center text-darkBg mb-4 shadow-accent-glow">
            <Music className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-textSecondary text-sm mt-1">Listen to music tailored to your emotions</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent rounded-xl text-sm text-white placeholder-textSecondary/50 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primaryAccent hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/5 focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent rounded-xl text-sm text-white placeholder-textSecondary/50 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-accent-gradient hover:opacity-95 text-darkBg font-bold text-sm rounded-xl shadow-premium hover:shadow-accent-glow focus:outline-none transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Register Redirect */}
        <p className="text-center text-textSecondary text-xs mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primaryAccent font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
