import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  History, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Trash2,
  Wrench,
  Zap,
  Droplets,
  Wind,
  Car
} from 'lucide-react';
import Navbar from '../../components/Navbar';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  department: string;
  priority: string;
  address?: string;
  createdAt: string;
}

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      // Reusing EXISTING GET /api/complaints/my-history endpoint
      const response = await axios.get('http://localhost:5000/api/complaints/my-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints || []);
    } catch (err: any) {
      setError('Failed to load your complaint telemetry.');
    } finally {
      setLoading(false);
    }
  };

  // Summary Metrics Calculated from EXISTING API Response
  const totalComplaints = complaints.length;
  const inProgressComplaints = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED').length;
  const pendingComplaints = totalComplaints - inProgressComplaints - resolvedComplaints;

  // Recent Complaints (Top 3)
  const recentComplaints = complaints.slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'COMPLETED':
      case 'CLOSED':
        return { color: 'text-green-400 bg-green-400/10 border-green-400/30', text: 'Resolved', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 'IN_PROGRESS':
        return { color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', text: 'In Progress', icon: <Clock className="w-3.5 h-3.5" /> };
      default:
        return { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30', text: 'Routed / Pending', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    }
  };

  const categories = [
    { title: 'Waste & Sanitation', dept: 'SANITATION', icon: <Trash2 className="w-5 h-5 text-amber-400" />, desc: 'Garbage, filth, odor & litter' },
    { title: 'Roads & Infrastructure', dept: 'ROAD', icon: <Wrench className="w-5 h-5 text-cyan-400" />, desc: 'Potholes, cracks & sidewalks' },
    { title: 'Power & Streetlights', dept: 'ELECTRICAL', icon: <Zap className="w-5 h-5 text-yellow-400" />, desc: 'Outages, lamps & wiring' },
    { title: 'Water Supply & Plumbing', dept: 'WATER_SUPPLY', icon: <Droplets className="w-5 h-5 text-blue-400" />, desc: 'Leaks, pipe bursts & supply' },
    { title: 'Drainage & Flooding', dept: 'DRAINAGE', icon: <Wind className="w-5 h-5 text-purple-400" />, desc: 'Clogged drains & gutters' },
    { title: 'Traffic & Signals', dept: 'TRAFFIC', icon: <Car className="w-5 h-5 text-red-400" />, desc: 'Signal failures & congestion' }
  ];

  return (
    <div className="w-full max-w-5xl flex flex-col items-center transition-colors">
      {/* STEP 1: Unified Header */}
      <Navbar />

      {/* STEP 1: Welcome Banner */}
      <div className="w-full p-6 sm:p-8 bg-gradient-to-r from-blue-600/10 via-teal-500/10 to-indigo-600/10 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md dark:shadow-2xl mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-600 dark:text-neonCyan text-xs font-bold uppercase tracking-wider mb-2">
            Citizen Governance Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-cyan-600 dark:text-neonCyan">{user?.name || 'Citizen'}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Report neighborhood issues easily and track real-time resolution progress from city officials.
          </p>
        </div>

        <Link 
          to="/citizen/report"
          className="w-full sm:w-auto px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Report Civic Issue
        </Link>
      </div>

      {/* STEP 2: Quick Actions Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link 
          to="/citizen/report"
          className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 dark:hover:border-neonCyan/60 rounded-2xl transition-all shadow-sm dark:shadow-xl group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-600 dark:text-neonCyan group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-neonCyan group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">Report an Issue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Capture photos, record voice details, and mark location.</p>
          </div>
        </Link>

        <Link 
          to="/citizen/history"
          className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-purple-500/60 rounded-2xl transition-all shadow-sm dark:shadow-xl group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">My Complaints</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">View your full submission history and status timelines.</p>
          </div>
        </Link>

        <Link 
          to="/citizen/history"
          className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 rounded-2xl transition-all shadow-sm dark:shadow-xl group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">Track Resolution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Check current officer progress and updates.</p>
          </div>
        </Link>
      </div>

      {/* STEP 4: Complaint Summary Stats */}
      <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl mb-6 sm:mb-8">
        <h2 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-600 dark:text-neonCyan" />
          My Complaint Summary
        </h2>

        {loading ? (
          <div className="py-6 text-center text-slate-400 animate-pulse text-sm">Loading metrics...</div>
        ) : error ? (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl text-xs text-center">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Total Filed</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalComplaints}</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[11px] sm:text-xs text-cyan-600 dark:text-cyan-400 uppercase font-semibold mb-1">Pending</span>
              <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-neonCyan">{pendingComplaints}</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 uppercase font-semibold mb-1">In Progress</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{inProgressComplaints}</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold mb-1">Resolved</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{resolvedComplaints}</span>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: Supported Civic Categories */}
      <div className="w-full mb-6 sm:mb-8">
        <h2 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-600 dark:text-neonCyan" />
          Issue Categories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat, idx) => (
            <Link 
              key={idx}
              to="/citizen/report"
              className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl flex items-start gap-3 transition-all hover:shadow-md dark:hover:bg-slate-900/80 group"
            >
              <div className="p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-neonCyan transition-colors">{cat.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* STEP 5: Recent Complaints Overview */}
      <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-600 dark:text-neonCyan" />
            Recent Submissions
          </h2>
          {complaints.length > 0 && (
            <Link to="/citizen/history" className="text-xs font-bold text-cyan-600 dark:text-neonCyan hover:underline flex items-center gap-1">
              View All Complaints →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-6 text-center text-slate-400 animate-pulse text-sm">Loading recent activity...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
            You haven't submitted any complaints yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentComplaints.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-500 mt-2">
                      <span>Department: <strong className="text-slate-700 dark:text-slate-300">{item.department || 'GENERAL'}</strong></span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 border rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${badge.color}`}>
                    {badge.icon}
                    {badge.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
