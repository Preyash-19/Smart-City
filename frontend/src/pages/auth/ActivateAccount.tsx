import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building2, 
  UserCheck, 
  ArrowRight,
  Globe
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useLanguage } from '../../context/LanguageContext';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [invitedUser, setInvitedUser] = useState<any>(null);
  const [tokenError, setTokenError] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(t.accountActivation.invalidOrExpiredToken);
      setIsLoading(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setIsLoading(true);
    setTokenError('');
    try {
      const response = await apiClient.get(`/auth/verify-invitation/${token}`);
      setInvitedUser(response.data.user);
    } catch (err: any) {
      setTokenError(err.response?.data?.error || t.accountActivation.invalidOrExpiredToken);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError(t.accountActivation.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t.accountActivation.passwordsDoNotMatch);
      return;
    }

    setIsActivating(true);
    try {
      const response = await apiClient.post('/auth/activate', {
        token,
        password
      });

      const { token: jwtToken, user } = response.data;
      localStorage.setItem('smartCityToken', jwtToken);
      localStorage.setItem('smartCityUser', JSON.stringify(user));

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/officer', { replace: true });
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to activate account. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const getDeptName = (deptCode: string) => {
    return t.departments[deptCode as keyof typeof t.departments] || deptCode;
  };

  const getRoleName = (roleCode: string) => {
    return t.departmentRoles[roleCode as keyof typeof t.departmentRoles] || roleCode;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      {/* Top Controls: Theme & Language */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.accountActivation.pageTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.accountActivation.subtitle}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="text-xs font-semibold">{t.loading}</span>
          </div>
        )}

        {/* Token Error State */}
        {!isLoading && tokenError && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{tokenError}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              ← Return to Login
            </button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && isSuccess && (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.accountActivation.successMessage}
            </h2>
            <button
              onClick={() => navigate('/officer')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>{t.accountActivation.goToDashboard}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Activation Form */}
        {!isLoading && !tokenError && !isSuccess && invitedUser && (
          <form onSubmit={handleActivate} className="space-y-4">
            {/* User Details Badge */}
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  {invitedUser.name}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{invitedUser.email}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-purple-200/60 dark:border-purple-900/40">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded text-[11px] font-bold text-purple-700 dark:text-purple-300">
                  <Building2 className="w-3 h-3" />
                  {getDeptName(invitedUser.department)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-3 h-3" />
                  {getRoleName(invitedUser.departmentRole)}
                </span>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.accountActivation.passwordLabel}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.accountActivation.passwordPlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.accountActivation.confirmPasswordLabel}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.accountActivation.confirmPasswordPlaceholder}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isActivating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.accountActivation.activating}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.accountActivation.activateButton}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
