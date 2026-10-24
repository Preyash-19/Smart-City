import { useNavigate } from 'react-router-dom';
import { Activity, LogOut, Shield, User, Building2, Globe } from 'lucide-react';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import PwaInstallButton from './PwaInstallButton';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('smartCityToken');
    localStorage.removeItem('smartCityUser');
    navigate('/login');
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'OFFICER':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'CITIZEN':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-neonCyan border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <nav className="relative z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 mb-6 sm:mb-8 shadow-sm dark:shadow-xl flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 sm:gap-4 transition-colors">
      {/* Platform Branding */}
      <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : (user?.role === 'OFFICER' ? '/officer' : '/citizen'))}>
        <div className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-cyan-600 dark:text-neonCyan">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.brandName.split(' ')[0]} <span className="text-cyan-600 dark:text-neonCyan">{t.brandName.split(' ').slice(1).join(' ') || 'Portal'}</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">{t.brandTagline}</p>
        </div>
        <div className="ml-1 sm:ml-2">
          <OnlineStatusIndicator />
        </div>
      </div>

      {/* User Controls, Language Switcher, Theme Toggle & Log Out */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0 flex-wrap sm:flex-nowrap">
        
        {/* Global Language Selector (English, हिन्दी, मराठी) */}
        <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs">
          <div className="pl-1.5 pr-0.5 text-slate-400 hidden lg:block">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
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
            className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
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
            className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === 'mr'
                ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            मराठी
          </button>
        </div>

        <ThemeToggle />
        <PwaInstallButton />

        {user && (
          <>
            <NotificationCenter />
            <div className="flex items-center gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex flex-col text-right">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  {user.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {user.department && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {t.departments[user.department as keyof typeof t.departments] || user.department}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user.role)} flex items-center gap-1`}>
                    <Shield className="w-2.5 h-2.5" />
                    {t.roles[user.role as keyof typeof t.roles] || user.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:border-red-500/50 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.logOut}</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
