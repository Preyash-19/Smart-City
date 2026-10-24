import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Wrench, 
  Zap, 
  Droplets, 
  Wind,
  CloudOff
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import { useNetworkStatus } from '../../context/NetworkStatusContext';
import OfflineDraftsManager from '../../components/OfflineDraftsManager';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  department: string;
  priority: string;
  severity?: string;
  address?: string;
  createdAt: string;
}

export default function CitizenDashboard() {
  const { t, formatDate, formatNumber } = useLanguage();
  const { draftsCount, refreshDraftsCount } = useNetworkStatus();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  const navigate = useNavigate();
  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchCitizenTelemetry();
  }, []);

  const fetchCitizenTelemetry = async () => {
    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/complaints/my-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints || []);
    } catch (err: any) {
      console.error("Failed to fetch citizen telemetry:", err);
    }
  };

  const totalComplaints = complaints.length;
  const inProgressComplaints = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED').length;
  const pendingComplaints = totalComplaints - inProgressComplaints - resolvedComplaints;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  const recentComplaints = complaints.slice(0, 4);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'COMPLETED':
      case 'CLOSED':
        return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', text: t.statuses.RESOLVED, icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 'IN_PROGRESS':
        return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', text: t.statuses.IN_PROGRESS, icon: <Clock className="w-3.5 h-3.5" /> };
      case 'REJECTED':
        return { color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', text: t.statuses.REJECTED, icon: <AlertCircle className="w-3.5 h-3.5" /> };
      default:
        return { color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30', text: t.statuses.ROUTED, icon: <AlertCircle className="w-3.5 h-3.5" /> };
    }
  };

  const categories = [
    { title: t.departments.SANITATION, dept: 'SANITATION', icon: <Trash2 className="w-5 h-5 text-amber-500" /> },
    { title: t.departments.ROAD, dept: 'ROAD', icon: <Wrench className="w-5 h-5 text-cyan-500" /> },
    { title: t.departments.ELECTRICAL, dept: 'ELECTRICAL', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { title: t.departments.WATER_SUPPLY, dept: 'WATER_SUPPLY', icon: <Droplets className="w-5 h-5 text-blue-500" /> },
    { title: t.departments.DRAINAGE, dept: 'DRAINAGE', icon: <Wind className="w-5 h-5 text-purple-500" /> }
  ];

  return (
    <div className="w-full max-w-5xl flex flex-col items-center transition-colors">
      <Navbar />

      {/* Welcome Banner */}
      <div className="w-full p-6 sm:p-8 bg-gradient-to-r from-cyan-600/10 via-teal-500/10 to-indigo-600/10 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-600 dark:text-neonCyan text-xs font-bold uppercase tracking-wider mb-2">
            {t.citizenDashboard.title}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-cyan-600 dark:text-neonCyan">{user?.name || 'Citizen'}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            {t.citizenDashboard.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {draftsCount > 0 && (
            <button
              type="button"
              id="citizen-view-drafts-btn"
              onClick={() => setIsDraftsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <CloudOff className="w-5 h-5 text-amber-500" />
              <span>{t.networkStatus?.offlineDraftsTitle || 'Offline Drafts'} ({draftsCount})</span>
            </button>
          )}

          <Link 
            to="/citizen/report"
            className="w-full sm:w-auto px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            {t.citizenDashboard.reportIssueBtn}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            {t.citizenDashboard.statsTotal}
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {formatNumber(totalComplaints)}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
            {t.citizenDashboard.statsActive}
          </span>
          <span className="text-2xl font-black text-amber-500">
            {formatNumber(inProgressComplaints + pendingComplaints)}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">
            {t.citizenDashboard.statsResolved}
          </span>
          <span className="text-2xl font-black text-emerald-500">
            {formatNumber(resolvedComplaints)}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-cyan-600 dark:text-neonCyan uppercase tracking-wider block mb-1">
            {t.citizenDashboard.statsRate}
          </span>
          <span className="text-2xl font-black text-cyan-600 dark:text-neonCyan">
            {resolutionRate}%
          </span>
        </div>
      </div>

      {/* Quick Municipal Categories */}
      <div className="w-full mb-6 sm:mb-8">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          {t.citizenDashboard.quickCategoriesTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((c, i) => (
            <Link
              key={i}
              to="/citizen/report"
              className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-xl flex flex-col items-center text-center gap-2 transition-all shadow-xs group"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-neonCyan">
                {c.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.citizenDashboard.recentIncidentsTitle}
          </h3>
          <Link 
            to="/citizen/history" 
            className="text-xs font-bold text-cyan-600 dark:text-neonCyan hover:underline flex items-center gap-1"
          >
            {t.citizenDashboard.viewHistoryBtn}
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            <p className="font-semibold text-sm mb-1">{t.citizenDashboard.noIncidentsFound}</p>
            <p>{t.citizenDashboard.reportFirstPrompt}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentComplaints.map((item) => {
              const badge = getStatusBadge(item.status);
              const deptName = t.departments[item.department as keyof typeof t.departments] || item.department;
              return (
                <div 
                  key={item.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-neonCyan">
                        #{item.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {deptName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badge.color}`}>
                      {badge.icon}
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offline Drafts Modal */}
      <OfflineDraftsManager
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        onEditDraft={() => {
          navigate('/citizen/report');
        }}
        onDraftSubmitted={() => {
          fetchCitizenTelemetry();
          refreshDraftsCount();
        }}
      />
    </div>
  );
}
