import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Bell, CheckCheck, Clock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  complaintId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('smartCityToken');
    if (!token) return;

    try {
      setIsLoading(true);
      const res = await apiClient.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('smartCityToken');
    if (!token) return;

    try {
      await apiClient.put('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    const token = localStorage.getItem('smartCityToken');

    if (!notif.isRead && token) {
      try {
        await apiClient.put(`/notifications/${notif.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    setIsOpen(false);

    if (notif.complaintId) {
      navigate('/citizen/history');
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="relative z-50" ref={panelRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 dark:bg-neonCyan text-white dark:text-slate-950 text-[11px] font-bold shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-600 dark:text-neonCyan" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{t.notifications.title}</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-neonCyan border border-cyan-500/30">
                  {unreadCount} {t.notifications.newBadge}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-neonCyan flex items-center gap-1 transition-colors font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">{t.loading}</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.notifications.empty}</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                    notif.isRead 
                      ? 'bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40' 
                      : 'bg-cyan-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-l-4 border-cyan-600 dark:border-neonCyan hover:bg-cyan-100/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold ${notif.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-cyan-600 dark:text-neonCyan'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
