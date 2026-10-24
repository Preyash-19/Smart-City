import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PwaUpdatePrompt() {
  const { t } = useLanguage();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) {
        console.log('Smart City AI SW registered successfully in scope:', r.scope);
      }
    },
    onRegisterError(error: any) {
      console.warn('SW registration failed:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div 
      id="pwa-update-banner"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 bg-slate-900 border border-cyan-500/60 text-white rounded-xl shadow-2xl backdrop-blur-md animate-bounce"
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white">
          {t.refresh}: Smart City AI
        </span>
        <span className="text-xs text-slate-300">
          A new platform version is ready. Click update to refresh.
        </span>
      </div>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {t.refresh}
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        title={t.close}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
