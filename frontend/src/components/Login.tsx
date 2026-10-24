import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { 
  LogIn, 
  UserPlus, 
  Loader2, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Building2, 
  Users, 
  User, 
  AlertTriangle,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AdministrativeLocationModal from './AdministrativeLocationModal';
import { useLanguage } from '../context/LanguageContext';
import type { LocationSelection } from '../data/mockLocationData';

export default function Login() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const routeLocation = useLocation();

  // Route matches for /login/citizen, /login/officer, /login/city-admin
  const isCitizenRoute = Boolean(useMatch('/login/citizen'));
  const isOfficerRoute = Boolean(useMatch('/login/officer'));
  const isAdminRoute = Boolean(useMatch('/login/city-admin'));

  // Determine current active mode
  // If at generic /login, check if user switched tabs or default to citizen
  const [genericActiveRole, setGenericActiveRole] = useState<'CITIZEN' | 'OFFICER' | 'ADMIN'>('CITIZEN');

  const effectiveRole: 'CITIZEN' | 'OFFICER' | 'ADMIN' = isOfficerRoute
    ? 'OFFICER'
    : isAdminRoute
    ? 'ADMIN'
    : isCitizenRoute
    ? 'CITIZEN'
    : genericActiveRole;

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Administrative location state for Officer and City Admin
  const [locationContext, setLocationContext] = useState<LocationSelection | null>(() => {
    // Check route state first
    const fromState = (routeLocation.state as any)?.location as LocationSelection | undefined;
    if (fromState && fromState.state && fromState.district && fromState.city && fromState.division) {
      return fromState;
    }
    // Check sessionStorage fallback for page refresh
    const storageKey = isOfficerRoute 
      ? 'smartCityLocation_OFFICER' 
      : isAdminRoute 
      ? 'smartCityLocation_ADMIN' 
      : null;
    if (storageKey) {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.state && parsed.district && parsed.city && parsed.division) {
            return parsed;
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return null;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States (Citizen only)
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status & Feedback States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If visiting Officer or Admin route without location, prompt location modal once
  useEffect(() => {
    if ((isOfficerRoute || isAdminRoute) && !locationContext) {
      setIsLocationModalOpen(true);
    }
  }, [isOfficerRoute, isAdminRoute, locationContext]);

  // Persist location context to sessionStorage when updated
  useEffect(() => {
    if (locationContext) {
      if (isOfficerRoute) {
        sessionStorage.setItem('smartCityLocation_OFFICER', JSON.stringify(locationContext));
      } else if (isAdminRoute) {
        sessionStorage.setItem('smartCityLocation_ADMIN', JSON.stringify(locationContext));
      }
    }
  }, [locationContext, isOfficerRoute, isAdminRoute]);

  // Redirect already authenticated user
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

  // Handle Location Modal Confirm
  const handleLocationConfirmed = (location: LocationSelection, role: 'OFFICER' | 'ADMIN') => {
    setLocationContext(location);
    setIsLocationModalOpen(false);
    setError('');

    // If currently at generic /login, navigate to the specific route with state
    if (!isOfficerRoute && !isAdminRoute) {
      if (role === 'OFFICER') {
        navigate('/login/officer', { state: { location, role: 'OFFICER' } });
      } else {
        navigate('/login/city-admin', { state: { location, role: 'ADMIN' } });
      }
    }
  };

  const handleModalClose = () => {
    setIsLocationModalOpen(false);
    if ((isOfficerRoute || isAdminRoute) && !locationContext) {
      navigate('/');
    }
  };

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation: Require location context for Officer and City Admin
    if (effectiveRole === 'OFFICER' || effectiveRole === 'ADMIN') {
      if (!locationContext || !locationContext.state || !locationContext.division) {
        setIsLoading(false);
        setError(t.roleLogin.missingLocationAlert);
        setIsLocationModalOpen(true);
        return;
      }
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;

      // Role authorization verification:
      // Compare the authenticated account role against the intended portal
      if (effectiveRole === 'OFFICER') {
        if (user.role !== 'OFFICER') {
          throw new Error(t.roleLogin.unauthorizedOfficer);
        }
      } else if (effectiveRole === 'ADMIN') {
        if (user.role !== 'ADMIN') {
          throw new Error(t.roleLogin.unauthorizedAdmin);
        }
      } else if (effectiveRole === 'CITIZEN') {
        // If an officer/admin logs in via citizen portal, we accept or route to their portal
        if (user.role !== 'CITIZEN' && user.role !== 'OFFICER' && user.role !== 'ADMIN') {
          throw new Error(t.roleLogin.unauthorizedCitizen);
        }
      }

      // Check account status if present
      if (user.status && user.status === 'SUSPENDED') {
        throw new Error("Your account has been suspended by administration. Contact your city administrator.");
      }

      // Store credentials and contextual metadata
      localStorage.setItem('smartCityToken', token);
      localStorage.setItem('smartCityUser', JSON.stringify({
        ...user,
        sessionLocation: (effectiveRole === 'OFFICER' || effectiveRole === 'ADMIN') ? locationContext : undefined
      }));

      // Role-based redirection
      if (user.role === 'CITIZEN') {
        navigate('/citizen');
      } else if (user.role === 'OFFICER') {
        navigate('/officer');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      }

    } catch (err: any) {
      // Discard any credentials on role rejection
      localStorage.removeItem('smartCityToken');
      localStorage.removeItem('smartCityUser');
      
      const errMsg = err.response?.data?.error || err.message || t.auth.authError;
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Citizen Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/auth/register', {
        name,
        email: regEmail,
        password: regPassword,
        role: 'CITIZEN'
      });

      setSuccess(t.auth.regSuccess);
      setEmail(regEmail);
      setIsRegisterMode(false);
      setName('');
      setRegEmail('');
      setRegPassword('');

    } catch (err: any) {
      setError(err.response?.data?.error || t.auth.authError);
    } finally {
      setIsLoading(false);
    }
  };

  // Role accents and titles
  const isOfficer = effectiveRole === 'OFFICER';
  const isAdmin = effectiveRole === 'ADMIN';
  const isCitizen = effectiveRole === 'CITIZEN';

  const roleAccentColor = isOfficer 
    ? 'amber' 
    : isAdmin 
    ? 'purple' 
    : 'cyan';

  const pageHeading = isOfficer 
    ? t.roleLogin.officerHeading 
    : isAdmin 
    ? t.roleLogin.adminHeading 
    : isCitizenRoute
    ? t.roleLogin.citizenHeading
    : t.auth.portalTitle;

  const pageSubtitle = isOfficer
    ? t.roleLogin.officerSubtitle
    : isAdmin
    ? t.roleLogin.adminSubtitle
    : isCitizenRoute
    ? t.roleLogin.citizenSubtitle
    : t.auth.portalSubtitle;

  return (
    <div className="w-full max-w-md p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl transition-colors my-auto">
      
      {/* Header with Title, Language Switcher & Theme Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-neonCyan">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Smart<span className="text-cyan-600 dark:text-neonCyan">City</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'hi'
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'mr'
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>

          <ThemeToggle compact />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-left mb-5">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {pageHeading}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          {pageSubtitle}
        </p>
      </div>

      {/* Role Selection Tabs (Only on generic /login without route lock) */}
      {!isCitizenRoute && !isOfficerRoute && !isAdminRoute && (
        <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl mb-5 border border-slate-200 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              setGenericActiveRole('CITIZEN');
              setError('');
              setSuccess('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              genericActiveRole === 'CITIZEN'
                ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-neonCyan shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGenericActiveRole('OFFICER');
              setError('');
              setSuccess('');
              if (!locationContext) setIsLocationModalOpen(true);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              genericActiveRole === 'OFFICER'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Officer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGenericActiveRole('ADMIN');
              setError('');
              setSuccess('');
              if (!locationContext) setIsLocationModalOpen(true);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              genericActiveRole === 'ADMIN'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      )}

      {/* Role Badge for locked routes */}
      {(isCitizenRoute || isOfficerRoute || isAdminRoute) && (
        <div className="mb-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {isOfficer && <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            {isAdmin && <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
            {isCitizen && <User className="w-3.5 h-3.5 text-cyan-600 dark:text-neonCyan" />}
            <span className={
              isOfficer ? 'text-amber-700 dark:text-amber-400' :
              isAdmin ? 'text-purple-700 dark:text-purple-400' :
              'text-cyan-700 dark:text-neonCyan'
            }>
              {isOfficer ? t.roles.OFFICER : isAdmin ? t.roles.ADMIN : t.roles.CITIZEN} Portal
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[11px] font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-neonCyan transition-colors"
          >
            Switch Role
          </button>
        </div>
      )}

      {/* ADMINISTRATIVE LOCATION CONTEXT BANNER (Officer & City Admin only) */}
      {(isOfficer || isAdmin) && (
        <div className="mb-6">
          {locationContext ? (
            <div className={`p-4 rounded-2xl border ${
              isOfficer 
                ? 'bg-amber-500/5 border-amber-500/20' 
                : 'bg-purple-500/5 border-purple-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                  isOfficer ? 'text-amber-700 dark:text-amber-400' : 'text-purple-700 dark:text-purple-400'
                }`}>
                  <MapPin className="w-3 h-3" />
                  {t.roleLogin.jurisdictionHeader}
                </span>

                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-[11px] font-bold text-cyan-600 dark:text-neonCyan hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.roleLogin.changeLocationBtn}</span>
                </button>
              </div>

              {/* Breadcrumb pills */}
              <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  {locationContext.stateName || locationContext.state}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  {locationContext.districtName || locationContext.district}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  {locationContext.cityName || locationContext.city}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                  isOfficer 
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                    : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                }`}>
                  {locationContext.divisionName || locationContext.division}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="font-semibold leading-relaxed">
                  {t.roleLogin.missingLocationAlert}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t.roleLogin.selectLocationBtn}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Citizen Registration / Sign-In Toggle (Citizen Only) */}
      {isCitizen && (
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !isRegisterMode 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            {t.auth.signInTab}
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isRegisterMode 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {t.auth.registerTab}
          </button>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs text-center flex items-center justify-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-semibold leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* LOGIN FORM */}
      {(!isRegisterMode || !isCitizen) && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {t.auth.emailLabel}
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder={t.auth.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {t.auth.passwordLabel}
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder={t.auth.passwordPlaceholder}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || ((isOfficer || isAdmin) && !locationContext)}
            className={`w-full mt-2 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
              roleAccentColor === 'amber'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20 disabled:bg-slate-300 dark:disabled:bg-slate-800'
                : roleAccentColor === 'purple'
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 disabled:bg-slate-300 dark:disabled:bg-slate-800'
                : 'bg-cyan-600 dark:bg-neonCyan hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 disabled:bg-slate-300 dark:disabled:bg-slate-800'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {isLoading ? t.auth.loggingIn : t.auth.signInButton}
          </button>
        </form>
      )}

      {/* REGISTER FORM (Citizen only) */}
      {isCitizen && isRegisterMode && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {t.auth.fullNameLabel}
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder={t.auth.fullNamePlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {t.auth.emailLabel}
            </label>
            <input 
              type="email" 
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder={t.auth.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {t.auth.passwordLabel}
            </label>
            <input 
              type="password" 
              required
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
              placeholder={t.auth.passwordPlaceholder}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-cyan-600 dark:bg-neonCyan hover:bg-cyan-500 dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isLoading ? t.auth.creatingAccount : t.auth.registerButton}
          </button>
        </form>
      )}

      {/* Administrative Location Modal for selecting / changing location */}
      <AdministrativeLocationModal
        isOpen={isLocationModalOpen}
        targetRole={effectiveRole === 'ADMIN' ? 'ADMIN' : 'OFFICER'}
        initialSelection={locationContext}
        onClose={handleModalClose}
        onConfirm={handleLocationConfirmed}
      />
    </div>
  );
}