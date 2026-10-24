import { Wifi, WifiOff, Loader2, CheckCheck, AlertTriangle, CloudOff } from 'lucide-react';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { useLanguage } from '../context/LanguageContext';

export default function OnlineStatusIndicator() {
  const { status, draftsCount, checkReachability } = useNetworkStatus();
  const { t } = useLanguage();

  const getStatusDisplay = () => {
    switch (status) {
      case 'SYNCING_DRAFTS':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-400 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600 dark:text-cyan-400" />,
          label: t.networkStatus?.syncingDrafts || 'Syncing drafts...',
          dot: 'bg-cyan-500 animate-ping'
        };
      case 'DRAFT_SAVED':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300',
          icon: <CheckCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
          label: t.networkStatus?.draftSaved || 'Draft saved offline',
          dot: 'bg-indigo-500'
        };
      case 'SUBMISSION_SUCCESS':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
          icon: <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          label: t.networkStatus?.submissionSuccess || 'Submission successful',
          dot: 'bg-emerald-500'
        };
      case 'SUBMISSION_FAILED':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-500/40 text-rose-700 dark:text-rose-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          label: t.networkStatus?.submissionFailed || 'Submission failed',
          dot: 'bg-rose-500'
        };
      case 'OFFLINE':
        return {
          bg: 'bg-rose-50 dark:bg-red-950/80 border-rose-300 dark:border-red-500/40 text-rose-700 dark:text-rose-300',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          label: t.networkStatus?.offline || 'Offline',
          dot: 'bg-rose-500 animate-pulse'
        };
      case 'ONLINE':
      default:
        return {
          bg: 'bg-emerald-50 dark:bg-slate-900/90 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
          icon: <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
          label: t.networkStatus?.online || 'Online',
          dot: 'bg-emerald-500'
        };
    }
  };

  const current = getStatusDisplay();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        id="online-status-indicator"
        onClick={() => checkReachability()}
        title="Network status — Click to verify server reachability"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer ${current.bg}`}
      >
        <span className="relative flex h-2 w-2">
          {status === 'ONLINE' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}></span>
        </span>
        {current.icon}
        <span className="text-[11px] sm:text-xs">{current.label}</span>
      </button>

      {/* Drafts count indicator if drafts exist in IndexedDB */}
      {draftsCount > 0 && (
        <span 
          id="offline-drafts-badge"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-400 dark:border-amber-600/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold"
          title={`${draftsCount} offline draft(s) stored in browser storage`}
        >
          <CloudOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>{draftsCount} {t.networkStatus?.offlineDraftsTitle ? 'Drafts' : 'Drafts'}</span>
        </span>
      )}
    </div>
  );
}
