import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div 
        id="online-status-indicator"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-medium shadow-sm transition-all"
        title="Network connection active"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span>Online</span>
      </div>
    );
  }

  return (
    <div 
      id="online-status-indicator"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-red-500/50 text-red-300 text-xs font-semibold shadow-md animate-pulse transition-all"
      title="You are currently offline. Some features require internet connection."
    >
      <span className="h-2 w-2 rounded-full bg-red-500"></span>
      <WifiOff className="w-3.5 h-3.5 text-red-400" />
      <span>Offline — Limited Network</span>
    </div>
  );
}
