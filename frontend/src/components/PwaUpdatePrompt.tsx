import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: any) {
      console.error('SW Registration Error:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div 
      id="pwa-update-banner"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 bg-slate-900 border border-neonCyan/50 text-white rounded-xl shadow-2xl backdrop-blur-md animate-bounce"
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold">New version available</span>
        <span className="text-xs text-slate-400">An update for Smart City Platform is ready.</span>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1.5 bg-neonCyan text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-all flex items-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="p-1 text-slate-400 hover:text-white transition-colors"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
