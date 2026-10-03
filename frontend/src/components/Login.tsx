import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2, ShieldCheck, Activity } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status & Feedback States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // STEP 4: Redirect already authenticated user if they visit /login
  useEffect(() => {
    const token = localStorage.getItem('smartCityToken');
    const userString = localStorage.getItem('smartCityUser');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        if (user.role === 'CITIZEN') {
          navigate('/citizen', { replace: true });
        } else if (user.role === 'OFFICER') {
          navigate('/officer', { replace: true });
        } else if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        }
      } catch (e) {
        localStorage.removeItem('smartCityToken');
        localStorage.removeItem('smartCityUser');
      }
    }
  }, [navigate]);

  // STEP 3: Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;

      // Save token & user to localStorage
      localStorage.setItem('smartCityToken', token);
      localStorage.setItem('smartCityUser', JSON.stringify(user));

      // Role-Based Login Redirection
      if (user.role === 'CITIZEN') {
        navigate('/citizen');
      } else if (user.role === 'OFFICER') {
        navigate('/officer');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      }

    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle Citizen Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email: regEmail,
        password: regPassword,
        role: 'CITIZEN' // Defaults to Citizen registration for public portal
      });

      setSuccess('Account created successfully! You can now log in.');
      setEmail(regEmail);
      setIsRegisterMode(false);
      setName('');
      setRegEmail('');
      setRegPassword('');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl transition-colors my-auto">
      
      {/* Header with Title & Theme Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-neonCyan">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">Smart City</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => { setIsRegisterMode(false); setError(''); setSuccess(''); }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${!isRegisterMode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsRegisterMode(true); setError(''); setSuccess(''); }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isRegisterMode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <UserPlus className="w-4 h-4" />
          Register
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {isRegisterMode ? 'Create Citizen Account' : 'Welcome to Smart City'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          {isRegisterMode ? 'Register to submit & track civic issues' : 'Sign in to your account to continue'}
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 text-xs text-center flex items-center justify-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* LOGIN FORM */}
      {!isRegisterMode && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder="officer@smartcity.gov or citizen@city.gov"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-cyan-600 dark:bg-neonCyan hover:bg-cyan-500 dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-900 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Secure Login
          </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {isRegisterMode && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder="e.g., Alex Citizen"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder="alex@city.gov"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Create Password</label>
            <input 
              type="password" 
              required
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-cyan-600 dark:bg-neonCyan hover:bg-cyan-500 dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-900 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Register Account
          </button>
        </form>
      )}
    </div>
  );
}