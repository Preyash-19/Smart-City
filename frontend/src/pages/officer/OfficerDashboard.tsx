import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2,
  Filter,
  RefreshCw,
  AlertOctagon
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import SignalWaveform from '../../components/SignalWaveform';

interface Complaint {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  department: string;
  priority: string;
  status: string;
  evidenceScore: number;
  aiSummary: string;
  isFake?: boolean;
  isDuplicate?: boolean;
  address: string;
  createdAt: string;
}

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  const navigate = useNavigate();
  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchOfficerTelemetry();
  }, []);

  const fetchOfficerTelemetry = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/complaints/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access Denied: Authorized Department Officer credentials required.');
      } else {
        setError('Unable to fetch department reports. Please check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    setUpdatingId(complaintId);
    try {
      const token = localStorage.getItem('smartCityToken');
      await axios.put(
        `http://localhost:5000/api/complaints/${complaintId}/status`, 
        { status: newStatus, remark: `Status updated to ${newStatus} by ${user?.name || 'Department Officer'}.` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints(prev => 
        prev.map(item => item.id === complaintId ? { ...item, status: newStatus } : item)
      );

    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Could not update complaint status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalIncidents = complaints.length;
  const highPriorityCount = complaints.filter(c => c.priority === 'HIGH').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED').length;

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH': 
        return 'text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/30 dark:border-red-500/30';
      case 'MEDIUM': 
        return 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-500/30';
      case 'LOW': 
        return 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-500/30';
      default: 
        return 'text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center">
      <Navbar />

      {/* Header Banner */}
      <div className="w-full relative overflow-hidden bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 mb-8 transition-colors duration-200">
        <SignalWaveform />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-full text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              {user?.department || 'DEPARTMENT'} PORTAL
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Activity className="text-cyan-600 dark:text-neonCyan w-7 h-7" />
              Officer Control Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
              Active reports assigned to <strong className="text-cyan-600 dark:text-neonCyan">{user?.department || 'Your Department'}</strong>.
            </p>
          </div>

          <button
            onClick={fetchOfficerTelemetry}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Operational Metrics */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Total Reports</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalIncidents}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[11px] text-red-600 dark:text-red-400/90 uppercase font-semibold mb-1">High Priority</span>
            <span className="text-3xl font-black text-red-600 dark:text-red-400">{highPriorityCount}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[11px] text-amber-600 dark:text-amber-400/90 uppercase font-semibold mb-1">In Progress</span>
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400/90 uppercase font-semibold mb-1">Resolved</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="w-full mb-6 p-4 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyan-600 dark:text-neonCyan" />
          Filter Complaint Feed:
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="ROUTED">Routed / Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 transition-all"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 animate-pulse text-sm">
          Loading assigned complaints...
        </div>
      ) : error ? (
        <div className="w-full p-4 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl text-center text-sm mb-8">
          {error}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="w-full py-16 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 mb-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Active Reports Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">All registered complaints for your department have been handled.</p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredComplaints.map((complaint) => (
            <div 
              key={complaint.id} 
              className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 rounded-2xl transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                {complaint.imageUrl && (
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                    <img 
                      src={complaint.imageUrl} 
                      alt="Complaint attachment" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Title & Priority */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{complaint.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-full flex items-center gap-1 whitespace-nowrap ${getPriorityStyle(complaint.priority)}`}>
                    {complaint.priority === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                    {complaint.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">{complaint.description}</p>

                {/* Address */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <MapPin className="w-4 h-4 text-cyan-600 dark:text-neonCyan shrink-0" />
                  <span className="truncate">{complaint.address || 'Location coordinates attached'}</span>
                </div>

                {/* AI Summary Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-neonCyan">
                      <BrainCircuit className="w-4 h-4" />
                      AI Analysis Summary
                    </div>
                    {complaint.isFake && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        Low Quality / Review Needed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic mb-2">"{complaint.aiSummary}"</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Evidence Score: <strong className="text-slate-900 dark:text-white font-mono">{complaint.evidenceScore}%</strong></span>
                    <span>Status: <strong className="text-slate-900 dark:text-white uppercase font-bold">{complaint.status}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Change Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
                {complaint.status === 'ROUTED' && (
                  <button 
                    onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                    disabled={updatingId === complaint.id}
                    className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Dispatch Field Team
                  </button>
                )}
                
                {(complaint.status === 'ROUTED' || complaint.status === 'IN_PROGRESS') && (
                  <button 
                    onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                    disabled={updatingId === complaint.id}
                    className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Resolved
                  </button>
                )}

                {complaint.status === 'RESOLVED' && (
                  <div className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Resolved & Completed
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
