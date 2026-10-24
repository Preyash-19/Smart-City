import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PwaInstallButton() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic browser banner
      e.preventDefault();
      // Stash event for user gesture trigger
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('Smart City AI PWA was installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User install choice: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Do not render anything if already installed
  if (isInstalled) {
    return null;
  }

  // Render install button when installable
  if (!isInstallable) {
    return null;
  }

  return (
    <button
      type="button"
      id="pwa-install-app-btn"
      onClick={handleInstallClick}
      title={t.networkStatus?.installAppPrompt || 'Install Smart City AI App'}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer animate-pulse"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{t.networkStatus?.installApp || 'Install App'}</span>
    </button>
  );
}
