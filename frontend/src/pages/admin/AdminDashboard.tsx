import { useEffect, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2,
  Trash2,
  RefreshCw,
  AlertOctagon,
  Layers,
  CheckCheck,
  Radar
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import SignalWaveform from '../../components/SignalWaveform';

// Lazy-load the heatmap so that a map failure never crashes the admin portal
const ComplaintHeatmap = lazy(() => import('../../components/ComplaintHeatmap'));

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
  latitude: number;
  longitude: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [masterDeptFilter, setMasterDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const navigate = useNavigate();
  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchCityWideTelemetry();
  }, []);

  const fetchCityWideTelemetry = async () => {
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
        setError('Access Denied: Admin authorization required.');
      } else {
        setError('Unable to load city-wide reports. Please verify connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm("Are you sure you want to remove this report from the system?")) {
      return;
    }

    setDeletingId(complaintId);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('smartCityToken');
      
      const res = await axios.delete(`http://localhost:5000/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(prev => prev.filter(c => c.id !== complaintId));
      setSuccessMsg(res.data.message || 'Complaint record deleted successfully.');

    } catch (err: any) {
      console.error("Delete Error:", err);
      setError(err.response?.data?.error || 'System error: Could not remove complaint.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('smartCityToken');
      await axios.put(
        `http://localhost:5000/api/complaints/${complaintId}/status`,
        { status: newStatus, remark: `Administrator status override to ${newStatus}.` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert("Error updating complaint status.");
    }
  };

  const totalIncidents = complaints.length;
  const highPriorityCount = complaints.filter(c => c.priority === 'HIGH').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED').length;
  const pendingCount = totalIncidents - inProgressCount - resolvedCount;

  const departmentBreakdown = {
    ROAD: complaints.filter(c => c.department === 'ROAD').length,
    SANITATION: complaints.filter(c => c.department === 'SANITATION').length,
    WATER_SUPPLY: complaints.filter(c => c.department === 'WATER_SUPPLY').length,
    ELECTRICAL: complaints.filter(c => c.department === 'ELECTRICAL').length,
    DRAINAGE: complaints.filter(c => c.department === 'DRAINAGE').length,
    TRAFFIC: complaints.filter(c => c.department === 'TRAFFIC').length,
    GENERAL: complaints.filter(c => c.department === 'GENERAL').length
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesDept = masterDeptFilter === 'ALL' || c.department === masterDeptFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesDept && matchesStatus;
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
      <div className="w-full relative overflow-hidden bg-white dark:bg-slate-900/80 backdrop-blur-md border border-purple-200 dark:border-purple-500/30 rounded-2xl shadow-xl p-6 mb-8 transition-colors duration-200">
        <SignalWaveform />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 rounded-full text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              CITY ADMINISTRATION PORTAL
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Activity className="text-purple-600 dark:text-purple-400 w-7 h-7" />
              City Governance Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
              Logged in as <strong className="text-purple-700 dark:text-purple-400">{user?.name || 'City Administrator'}</strong> (Full City Overview).
            </p>
          </div>

          <button
            onClick={fetchCityWideTelemetry}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* City Summary KPI Cards */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Total Reports</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalIncidents}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-bold mb-1">Pending</span>
            <span className="text-2xl font-black text-cyan-600 dark:text-neonCyan">{pendingCount}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold mb-1">In Progress</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1">Resolved</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <span className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold mb-1">High Priority</span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400">{highPriorityCount}</span>
          </div>
        </div>
      </div>

      {/* Department Distribution Section */}
      <div className="w-full mb-8">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Department Report Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Roads & Streets</span>
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{departmentBreakdown.ROAD}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Sanitation</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{departmentBreakdown.SANITATION}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Water Supply</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{departmentBreakdown.WATER_SUPPLY}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Electrical</span>
            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{departmentBreakdown.ELECTRICAL}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Drainage</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{departmentBreakdown.DRAINAGE}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">Traffic</span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{departmentBreakdown.TRAFFIC}</span>
          </div>
        </div>

        {/* Duplicate Radii Config */}
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Radar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Configured Duplicate Radius by Department:
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-cyan-700 dark:text-cyan-400 font-bold">ROAD: 50m</span>
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400 font-bold">SANITATION: 100m</span>
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-blue-700 dark:text-blue-400 font-bold">WATER: 100m</span>
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-purple-700 dark:text-purple-400 font-bold">DRAINAGE: 100m</span>
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-yellow-700 dark:text-yellow-400 font-bold">ELECTRICAL: 75m</span>
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-red-700 dark:text-red-400 font-bold">TRAFFIC: 100m</span>
          </div>
        </div>
      </div>

      {/* ── Complaint Heatmap Section ── */}
      <div className="w-full mb-8 p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-200">
        <Suspense
          fallback={
            <div className="w-full py-10 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
              <MapPin className="w-7 h-7 animate-bounce text-purple-500" />
              <span className="text-sm font-medium">Loading complaint map...</span>
            </div>
          }
        >
          <ComplaintHeatmap complaints={complaints} />
        </Suspense>
      </div>

      {/* Filter Toolbar */}
      <div className="w-full mb-6 p-4 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Filter City Reports:
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={masterDeptFilter}
            onChange={(e) => setMasterDeptFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="ALL">All Departments (City-Wide)</option>
            <option value="ROAD">Street & Road</option>
            <option value="SANITATION">Waste & Sanitation</option>
            <option value="WATER_SUPPLY">Water & Plumbing</option>
            <option value="ELECTRICAL">Power & Lighting</option>
            <option value="DRAINAGE">Drainage & Gutters</option>
            <option value="TRAFFIC">Traffic & Signals</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="ROUTED">Routed / Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="w-full mb-6 p-3 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs text-center flex items-center justify-center gap-2 font-medium">
          <CheckCheck className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="w-full mb-6 p-3 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-xl text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* Complaint List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 animate-pulse text-sm">
          Loading city-wide reports...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="w-full py-16 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 mb-8">
          <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Matching Reports</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">No reports match the selected department or status filters.</p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredComplaints.map((complaint) => (
            <div 
              key={complaint.id} 
              className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500/50 rounded-2xl transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                {complaint.imageUrl && (
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                    <img 
                      src={complaint.imageUrl} 
                      alt="Attachment" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Header Info */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 px-2 py-0.5 rounded mb-1">
                      {complaint.department}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{complaint.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-full flex items-center gap-1 whitespace-nowrap ${getPriorityStyle(complaint.priority)}`}>
                    {complaint.priority === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                    {complaint.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">{complaint.description}</p>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">{complaint.address || 'Location coordinates attached'}</span>
                </div>

                {/* AI Summary Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                      <BrainCircuit className="w-4 h-4" />
                      AI Diagnostics Summary
                    </div>
                    {complaint.isFake && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        Flagged Low Detail
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

              {/* Administrative Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex gap-2">
                  {complaint.status === 'ROUTED' && (
                    <button 
                      onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                      className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Dispatch Team
                    </button>
                  )}
                  {(complaint.status === 'ROUTED' || complaint.status === 'IN_PROGRESS') && (
                    <button 
                      onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => handleDeleteComplaint(complaint.id)}
                  disabled={deletingId === complaint.id}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Report
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
