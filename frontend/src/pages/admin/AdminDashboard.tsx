import React, { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { apiClient } from '../../services/api';
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
  HelpCircle, 
  ShieldCheck, 
  Ban,
  Users,
  ArrowRightLeft,
  X,
  Gauge,
  Loader2,
  RotateCcw,
  Eye,
  Search,
  Calendar,
  BarChart3
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import SignalWaveform from '../../components/SignalWaveform';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import DepartmentUserManagement from '../../components/admin/DepartmentUserManagement';

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
  severity?: string;
  aiPredictedSeverity?: string;
  severityScore?: number;
  confidence?: number;
  civicRelevance?: string;
  departmentMatch?: string;
  verificationStatus?: string;
  aiPredictedDept?: string;
  aiPredictedIssue?: string;
  aiExplanation?: string;
  aiExplanationHi?: string;
  aiExplanationMr?: string;
  severityReasons?: string;
  humanVerified?: boolean;
  humanRemarks?: string;
  isFake?: boolean;
  isDuplicate?: boolean;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  assignedOfficer?: {
    id: string;
    name: string;
    email: string;
    departmentRole?: string;
  } | null;
}

export default function AdminDashboard() {
  const { t, formatNumber } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'users'>('telemetry');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteComplaintId, setConfirmDeleteComplaintId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filters & Search
  const [masterDeptFilter, setMasterDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingSeverityId, setUpdatingSeverityId] = useState<string | null>(null);

  // Department Reassignment Override Modal State
  const [reassigningComplaint, setReassigningComplaint] = useState<Complaint | null>(null);
  const [newDepartment, setNewDepartment] = useState('ROAD');
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  
  const navigate = useNavigate();
  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchCityWideTelemetry();
  }, []);

  const fetchCityWideTelemetry = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/complaints/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        showToast('Access Denied: Admin authorization required.', 'error');
      } else {
        showToast('Unable to load city-wide reports. Please verify connection.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteComplaint = async () => {
    if (!confirmDeleteComplaintId) return;
    const complaintId = confirmDeleteComplaintId;
    setDeletingId(complaintId);

    try {
      const token = localStorage.getItem('smartCityToken');
      
      const res = await apiClient.delete(`/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(prev => prev.filter(c => c.id !== complaintId));
      showToast(res.data.message || 'Complaint record deleted successfully.', 'success');
      setConfirmDeleteComplaintId(null);

    } catch (err: any) {
      console.error("Delete Error:", err);
      const errMsg = err.response?.data?.error || 'System error: Could not remove complaint.';
      showToast(errMsg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('smartCityToken');
      await apiClient.put(
        `/complaints/${complaintId}/status`,
        { status: newStatus, remark: `Administrator status override to ${newStatus}.` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
      showToast(`Status updated to ${newStatus}.`, 'success');
    } catch (err) {
      showToast("Error updating complaint status.", 'error');
    }
  };

  const handleReassignDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningComplaint) return;
    setIsReassigning(true);

    try {
      const token = localStorage.getItem('smartCityToken');
      const response = await apiClient.put(
        `/complaints/${reassigningComplaint.id}/reassign-department`,
        {
          department: newDepartment,
          reason: reassignReason || 'Administrative routing override by City Admin'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response.data.complaint;
      setComplaints(prev => prev.map(c => c.id === reassigningComplaint.id ? { ...c, ...updated, department: newDepartment } : c));
      showToast(`Incident reassigned to ${newDepartment} Department.`, 'success');
      setReassigningComplaint(null);
      setReassignReason('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to reassign department.', 'error');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleSeverityUpdate = async (complaintId: string, newSeverity: string) => {
    setUpdatingSeverityId(complaintId);

    try {
      const token = localStorage.getItem('smartCityToken');
      const res = await apiClient.put(
        `/complaints/${complaintId}/severity`,
        { severity: newSeverity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.complaint;
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, ...updated, severity: newSeverity, priority: newSeverity } : c));
      showToast(`${t.adminDashboard.severityUpdated} (${t.severities[newSeverity as keyof typeof t.severities] || newSeverity})`, 'success');
    } catch (err: any) {
      console.error("Severity Update Error:", err);
      showToast(err.response?.data?.error || t.adminDashboard.severityUpdateError, 'error');
    } finally {
      setUpdatingSeverityId(null);
    }
  };

  // Separate valid civic complaints from rejected / irrelevant uploads
  const validComplaints = useMemo(() => {
    return complaints.filter(
      c => c.status !== 'REJECTED' && c.civicRelevance !== 'IRRELEVANT' && c.severity !== 'REJECTED_AS_IRRELEVANT'
    );
  }, [complaints]);

  const rejectedComplaints = useMemo(() => {
    return complaints.filter(
      c => c.status === 'REJECTED' || c.civicRelevance === 'IRRELEVANT' || c.severity === 'REJECTED_AS_IRRELEVANT'
    );
  }, [complaints]);

  // Complaints needing review that are not human-verified are kept separate from active civic counts
  const activeCivicComplaints = useMemo(() => {
    return validComplaints.filter(
      c => !((c.verificationStatus === 'NEEDS_REVIEW' || c.civicRelevance === 'UNCERTAIN') && !c.humanVerified)
    );
  }, [validComplaints]);

  const highSeverityCount = activeCivicComplaints.filter(c => {
    const eff = c.severity || c.priority;
    return eff === 'HIGH' || eff === 'CRITICAL';
  }).length;

  const mediumSeverityCount = activeCivicComplaints.filter(c => {
    const eff = c.severity || c.priority;
    return eff === 'MEDIUM';
  }).length;

  const lowSeverityCount = activeCivicComplaints.filter(c => {
    const eff = c.severity || c.priority;
    return eff === 'LOW';
  }).length;

  const allSeverityCount = validComplaints.length;

  const totalIncidents = validComplaints.length;
  const highPriorityCount = highSeverityCount;
  const inProgressCount = validComplaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = validComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED').length;
  const pendingCount = validComplaints.filter(c => c.status === 'ROUTED' || c.status === 'SUBMITTED' || c.status === 'OFFICER_REVIEW').length;
  const rejectedCount = rejectedComplaints.length;

  const departmentBreakdown = useMemo(() => ({
    ROAD: validComplaints.filter(c => c.department === 'ROAD').length,
    SANITATION: validComplaints.filter(c => c.department === 'SANITATION').length,
    WATER_SUPPLY: validComplaints.filter(c => c.department === 'WATER_SUPPLY').length,
    ELECTRICAL: validComplaints.filter(c => c.department === 'ELECTRICAL').length,
    DRAINAGE: validComplaints.filter(c => c.department === 'DRAINAGE').length,
    LEGACY: validComplaints.filter(c => c.department === 'TRAFFIC' || c.department === 'OTHER' || c.department === 'GENERAL').length
  }), [validComplaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesDept = masterDeptFilter === 'ALL' || c.department === masterDeptFilter;
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'REJECTED'
          ? (c.status === 'REJECTED' || c.civicRelevance === 'IRRELEVANT' || c.severity === 'REJECTED_AS_IRRELEVANT')
          : statusFilter === 'NEEDS_REVIEW'
          ? (c.verificationStatus === 'NEEDS_REVIEW' || c.civicRelevance === 'UNCERTAIN')
          : c.status === statusFilter;
      const effSev = c.severity || c.priority;
      const matchesSeverity =
        severityFilter === 'ALL'
          ? true
          : severityFilter === 'HIGH'
          ? (effSev === 'HIGH' || effSev === 'CRITICAL')
          : effSev === severityFilter;

      // Fast text search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        c.id.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.aiPredictedIssue && c.aiPredictedIssue.toLowerCase().includes(q))
      );

      return matchesDept && matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [complaints, masterDeptFilter, statusFilter, severityFilter, searchQuery]);

  const getSeverityStyle = (severity?: string, priority?: string) => {
    const eff = severity || priority;
    switch (eff) {
      case 'CRITICAL':
        return 'text-rose-900 bg-rose-200 border-rose-400 dark:text-rose-200 dark:bg-rose-950 dark:border-rose-800 font-black';
      case 'HIGH':
        return 'text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-950/60 dark:border-red-800 font-bold';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800 font-semibold';
      case 'LOW':
        return 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800 font-medium';
      case 'REJECTED_AS_IRRELEVANT':
        return 'text-slate-600 bg-slate-200 border-slate-400 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center transition-colors">
      <Navbar />

      {/* EXECUTIVE CITY COMMAND CENTER HEADER */}
      <div className="w-full relative overflow-hidden bg-white dark:bg-slate-900/90 backdrop-blur-md border border-purple-200/80 dark:border-purple-500/30 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 transition-colors duration-200">
        <SignalWaveform />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.roles.ADMIN} Command</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-xs font-semibold">
                <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>{user?.name || 'City Administrator'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>City Telemetry Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Activity className="text-purple-600 dark:text-purple-400 w-7 h-7" />
              <span>{t.adminDashboard.title}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.adminDashboard.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCityWideTelemetry}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            <span>{t.refresh}</span>
          </button>
        </div>

        {/* City Summary KPI Cards (6 items) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 tracking-wider">
              {t.adminDashboard.totalIncidents}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatNumber(totalIncidents)}
            </span>
          </div>

          <div className="p-3.5 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-bold mb-1 tracking-wider">
              {t.statuses.ROUTED}
            </span>
            <span className="text-2xl font-black text-cyan-600 dark:text-neonCyan font-mono">
              {formatNumber(pendingCount)}
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold mb-1 tracking-wider">
              {t.statuses.IN_PROGRESS}
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {formatNumber(inProgressCount)}
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1 tracking-wider">
              {t.adminDashboard.resolvedIncidents}
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatNumber(resolvedCount)}
            </span>
          </div>

          <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold mb-1 tracking-wider">
              {t.adminDashboard.highAlerts}
            </span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
              {formatNumber(highPriorityCount)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 tracking-wider">
              Non-Civic Media
            </span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-300 font-mono">
              {formatNumber(rejectedCount)}
            </span>
          </div>
        </div>
      </div>

      {/* TOP VIEW NAVIGATION TABS */}
      <div className="w-full mb-8 flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`pb-3.5 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t.deptUserManagement.tabTelemetry}</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
            {formatNumber(complaints.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.deptUserManagement.tabUsers}</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <DepartmentUserManagement />
      ) : (
        <>
          {/* MUNICIPAL DEPARTMENT DISTRIBUTION */}
          <div className="w-full mb-8 p-5 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.adminDashboard.departmentBreakdownTitle}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div 
                onClick={() => setMasterDeptFilter(masterDeptFilter === 'ROAD' ? 'ALL' : 'ROAD')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  masterDeptFilter === 'ROAD'
                    ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500 shadow-xs ring-1 ring-cyan-500'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-cyan-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">{t.departments.ROAD}</span>
                <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{formatNumber(departmentBreakdown.ROAD)}</span>
              </div>

              <div 
                onClick={() => setMasterDeptFilter(masterDeptFilter === 'SANITATION' ? 'ALL' : 'SANITATION')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  masterDeptFilter === 'SANITATION'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-xs ring-1 ring-amber-500'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">{t.departments.SANITATION}</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{formatNumber(departmentBreakdown.SANITATION)}</span>
              </div>

              <div 
                onClick={() => setMasterDeptFilter(masterDeptFilter === 'WATER_SUPPLY' ? 'ALL' : 'WATER_SUPPLY')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  masterDeptFilter === 'WATER_SUPPLY'
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">{t.departments.WATER_SUPPLY}</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{formatNumber(departmentBreakdown.WATER_SUPPLY)}</span>
              </div>

              <div 
                onClick={() => setMasterDeptFilter(masterDeptFilter === 'ELECTRICAL' ? 'ALL' : 'ELECTRICAL')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  masterDeptFilter === 'ELECTRICAL'
                    ? 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-500 shadow-xs ring-1 ring-yellow-500'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-yellow-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">{t.departments.ELECTRICAL}</span>
                <span className="text-xl font-black text-yellow-600 dark:text-yellow-400 font-mono">{formatNumber(departmentBreakdown.ELECTRICAL)}</span>
              </div>

              <div 
                onClick={() => setMasterDeptFilter(masterDeptFilter === 'DRAINAGE' ? 'ALL' : 'DRAINAGE')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  masterDeptFilter === 'DRAINAGE'
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 shadow-xs ring-1 ring-purple-500'
                    : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-0.5">{t.departments.DRAINAGE}</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">{formatNumber(departmentBreakdown.DRAINAGE)}</span>
              </div>
            </div>

            {departmentBreakdown.LEGACY > 0 && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Historical / Legacy Complaints: {departmentBreakdown.LEGACY}</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Reassignment to active municipal departments recommended</span>
              </div>
            )}
          </div>

          {/* COMPLAINT HEATMAP SECTION */}
          <div className="w-full mb-8 p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm transition-colors duration-200">
            <Suspense
              fallback={
                <div className="w-full py-12 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-8 h-8 animate-bounce text-purple-500" />
                  <span className="text-xs font-semibold">{t.loading} geospatial heatmap...</span>
                </div>
              }
            >
              <ComplaintHeatmap complaints={validComplaints} />
            </Suspense>
          </div>

          {/* FUNCTIONAL SEVERITY FILTER CARDS */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.adminDashboard.severityFilterTitle}
                </h3>
              </div>
              {severityFilter !== 'ALL' && (
                <button
                  type="button"
                  id="reset-severity-filter-btn"
                  onClick={() => setSeverityFilter('ALL')}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.adminDashboard.resetSeverityFilter}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* ALL Severities Filter */}
              <button
                type="button"
                id="severity-filter-all"
                onClick={() => setSeverityFilter('ALL')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  severityFilter === 'ALL'
                    ? 'bg-purple-500/10 border-purple-500 shadow-md ring-2 ring-purple-500/30'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-purple-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>🌐</span>
                    <span>{t.adminDashboard.allSeverities}</span>
                  </span>
                  {severityFilter === 'ALL' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-600 text-white tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    {formatNumber(allSeverityCount)}
                  </span>
                  <span className="text-[11px] text-slate-400">cases</span>
                </div>
              </button>

              {/* HIGH Severity Filter */}
              <button
                type="button"
                id="severity-filter-high"
                onClick={() => setSeverityFilter('HIGH')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  severityFilter === 'HIGH'
                    ? 'bg-red-500/10 border-red-500 shadow-md ring-2 ring-red-500/30'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-red-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>{t.severities.HIGH}</span>
                  </span>
                  {severityFilter === 'HIGH' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-600 text-white tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
                    {formatNumber(highSeverityCount)}
                  </span>
                  <span className="text-[11px] text-red-500/80 font-medium">Urgent</span>
                </div>
              </button>

              {/* MEDIUM Severity Filter */}
              <button
                type="button"
                id="severity-filter-medium"
                onClick={() => setSeverityFilter('MEDIUM')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  severityFilter === 'MEDIUM'
                    ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{t.severities.MEDIUM}</span>
                  </span>
                  {severityFilter === 'MEDIUM' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-600 text-white tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {formatNumber(mediumSeverityCount)}
                  </span>
                  <span className="text-[11px] text-amber-500/80 font-medium">Standard</span>
                </div>
              </button>

              {/* LOW Severity Filter */}
              <button
                type="button"
                id="severity-filter-low"
                onClick={() => setSeverityFilter('LOW')}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  severityFilter === 'LOW'
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{t.severities.LOW}</span>
                  </span>
                  {severityFilter === 'LOW' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatNumber(lowSeverityCount)}
                  </span>
                  <span className="text-[11px] text-emerald-500/80 font-medium">Routine</span>
                </div>
              </button>
            </div>
          </div>

          {/* UNIFIED FILTER & FAST SEARCH TOOLBAR */}
          <div className="w-full mb-6 p-4 sm:p-5 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints by ID, title, address, AI keyword..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={masterDeptFilter}
                onChange={(e) => setMasterDeptFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-purple-300/80 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              >
                <option value="ALL">{t.departments.ALL}</option>
                <option value="ROAD">{t.departments.ROAD}</option>
                <option value="SANITATION">{t.departments.SANITATION}</option>
                <option value="WATER_SUPPLY">{t.departments.WATER_SUPPLY}</option>
                <option value="ELECTRICAL">{t.departments.ELECTRICAL}</option>
                <option value="DRAINAGE">{t.departments.DRAINAGE}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              >
                <option value="ALL">{t.statuses.ALL}</option>
                <option value="ROUTED">{t.statuses.ROUTED}</option>
                <option value="IN_PROGRESS">{t.statuses.IN_PROGRESS}</option>
                <option value="RESOLVED">{t.statuses.RESOLVED}</option>
                <option value="NEEDS_REVIEW">Needs Review / Ambiguous</option>
                <option value="REJECTED">Rejected Non-Civic Media</option>
              </select>

              {(masterDeptFilter !== 'ALL' || statusFilter !== 'ALL' || severityFilter !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setMasterDeptFilter('ALL');
                    setStatusFilter('ALL');
                    setSeverityFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Clear all active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* COMPLAINTS TRIAGE GRID */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
              <span>{t.loading}</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="w-full py-20 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 mb-8 p-6">
              <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {t.adminDashboard.noReportsFound}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                No incidents match your active filters or search criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMasterDeptFilter('ALL');
                  setStatusFilter('ALL');
                  setSeverityFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {filteredComplaints.map((complaint) => {
                const isIrrelevant = complaint.civicRelevance === 'IRRELEVANT' || complaint.severity === 'REJECTED_AS_IRRELEVANT';
                const isRejected = complaint.status === 'REJECTED' || isIrrelevant;
                const isMismatch = complaint.departmentMatch === 'MISMATCH';
                const isUncertain = complaint.civicRelevance === 'UNCERTAIN' || complaint.verificationStatus === 'NEEDS_REVIEW';

                // Visual confidence: format as calibrated percentage
                const confidencePct = Math.round((complaint.confidence !== undefined && complaint.confidence !== null ? complaint.confidence : (complaint.evidenceScore / 100)) * 100);

                return (
                  <div 
                    key={complaint.id} 
                    className={`bg-white dark:bg-slate-900/70 backdrop-blur-md border ${
                      isRejected 
                        ? 'border-red-300 dark:border-red-800/80 bg-red-50/10' 
                        : isMismatch
                        ? 'border-amber-300 dark:border-amber-800/80'
                        : isUncertain
                        ? 'border-blue-300 dark:border-blue-800/80'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50'
                    } rounded-3xl p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between`}
                  >
                    <div>
                      {/* Card Top Strip: ID, Department, Status & Severity */}
                      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{complaint.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 px-2 py-0.5 rounded-md">
                            {t.departments[complaint.department as keyof typeof t.departments] || complaint.department}
                          </span>
                          {(complaint.department === 'TRAFFIC' || complaint.department === 'OTHER' || complaint.department === 'GENERAL') && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-1.5 py-0.5 rounded">
                              Legacy
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2.5 py-0.5 border rounded-full font-bold ${
                            complaint.status === 'RESOLVED' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300'
                              : complaint.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-300'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-300'
                          }`}>
                            {complaint.status}
                          </span>

                          <span className={`text-[10px] px-2.5 py-0.5 border rounded-full font-bold whitespace-nowrap ${getSeverityStyle(complaint.severity, complaint.priority)}`}>
                            {complaint.severity === 'HIGH' && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                            {isRejected ? 'NON-CIVIC' : (t.severities[complaint.severity as keyof typeof t.severities] || complaint.severity || complaint.priority)}
                          </span>
                        </div>
                      </div>

                      {/* Photo Evidence with Lightbox */}
                      {complaint.imageUrl && (
                        <div 
                          onClick={() => setPreviewImage(complaint.imageUrl || null)}
                          className="w-full h-48 mb-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative group cursor-pointer shadow-xs"
                          title="Click to view full photo evidence"
                        >
                          <img 
                            src={complaint.imageUrl} 
                            alt="Attachment" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-6 h-6 drop-shadow-md" />
                          </div>
                          {isRejected && (
                            <div className="absolute top-2.5 right-2.5 bg-red-600/90 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-md flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Non-Civic Media
                            </div>
                          )}
                          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-white font-bold border border-slate-700/80">
                            Confidence: {confidencePct}%
                          </div>
                        </div>
                      )}

                      {/* Relevance & Mismatch Banners */}
                      {isRejected && (
                        <div className="w-full bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-3 py-2 rounded-xl mb-3 flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                            REJECTED: Irrelevant Non-Civic Media
                          </span>
                          <span className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            {complaint.verificationStatus || 'REJECTED'}
                          </span>
                        </div>
                      )}

                      {isMismatch && !isRejected && (
                        <div className="w-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-xl mb-3 flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            Dept Mismatch: Selected {complaint.department} ≠ Visual {complaint.aiPredictedDept || 'Other'}
                          </span>
                          <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            Mismatch
                          </span>
                        </div>
                      )}

                      {isUncertain && !isRejected && (
                        <div className="w-full bg-blue-100/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-xl mb-3 flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                            Ambiguous Photo: Manual Review Required
                          </span>
                          <span className="bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            Review
                          </span>
                        </div>
                      )}

                      {/* Title & Description */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
                        {complaint.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
                        {complaint.description}
                      </p>

                      {/* Location Landmark & Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 truncate max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="truncate">{complaint.address || t.complaintForm.gpsLocked}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* AI Diagnostics & Telemetry Card */}
                      <div className="p-4 bg-slate-50/80 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800/90 mb-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                            <BrainCircuit className="w-4 h-4" />
                            <span>AI Vision Telemetry</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            complaint.civicRelevance === 'IRRELEVANT'
                              ? 'text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800'
                              : complaint.civicRelevance === 'UNCERTAIN'
                              ? 'text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800'
                              : 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800'
                          }`}>
                            Relevance: {complaint.civicRelevance || 'RELEVANT'}
                          </span>
                        </div>

                        {/* Explanation in quotes */}
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          "{complaint.aiSummary || complaint.description}"
                        </p>

                        {/* Evidence & Severity Reasons */}
                        {complaint.severityReasons && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                            <strong className="text-purple-700 dark:text-purple-400 block mb-0.5">Evidence Reasons:</strong>
                            <p className="font-mono text-[10.5px] text-slate-800 dark:text-slate-300">
                              {complaint.severityReasons}
                            </p>
                          </div>
                        )}

                        {/* Telemetry Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-slate-400">Confidence: </span>
                            <strong className="text-slate-900 dark:text-white font-mono">{confidencePct}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Severity: </span>
                            <strong className="text-slate-900 dark:text-white font-mono">{complaint.severity || complaint.priority}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Dept Match: </span>
                            <strong className={`font-mono ${complaint.departmentMatch === 'MATCH' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {complaint.departmentMatch || 'MATCH'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Human Review: </span>
                            <strong className="text-slate-900 dark:text-white font-mono">
                              {complaint.humanVerified ? 'VERIFIED' : 'PENDING'}
                            </strong>
                          </div>
                        </div>

                        {/* Assigned Personnel Info */}
                        {complaint.assignedOfficer && (
                          <div className="p-2 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Assigned Officer:</span>
                            <span className="font-bold text-purple-700 dark:text-purple-300">
                              {complaint.assignedOfficer.name} ({complaint.assignedOfficer.departmentRole || 'OFFICER'})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 3-Level Severity Management Control */}
                      {!isRejected ? (
                        <div className="mb-4 p-3 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                              <Gauge className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>{t.adminDashboard.changeSeverityLabel}</span>
                            </div>
                            {updatingSeverityId === complaint.id && (
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {t.loading}
                              </span>
                            )}
                          </div>

                          {/* Segmented 3-Level Selector: HIGH, MEDIUM, LOW */}
                          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            {(['HIGH', 'MEDIUM', 'LOW'] as const).map((sevLevel) => {
                              const isCurrent = (complaint.severity || complaint.priority) === sevLevel;
                              const isUpdating = updatingSeverityId === complaint.id;

                              return (
                                <button
                                  key={sevLevel}
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleSeverityUpdate(complaint.id, sevLevel)}
                                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                                    isCurrent
                                      ? sevLevel === 'HIGH'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : sevLevel === 'MEDIUM'
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${
                                    sevLevel === 'HIGH' ? 'bg-red-400' : sevLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                                  } ${isCurrent ? 'bg-white' : ''}`} />
                                  <span>{t.severities[sevLevel]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-2.5 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-[11px] text-red-600 dark:text-red-400 font-medium">
                          <Ban className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.adminDashboard.cannotAssignRejected}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                      <div className="flex gap-2">
                        {complaint.status === 'ROUTED' && (
                          <button 
                            type="button"
                            onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                            className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t.statuses.IN_PROGRESS}</span>
                          </button>
                        )}
                        {(complaint.status === 'ROUTED' || complaint.status === 'IN_PROGRESS') && (
                          <button 
                            type="button"
                            onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                            className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.statuses.RESOLVED}</span>
                          </button>
                        )}
                        {isRejected && (
                          <button 
                            type="button"
                            onClick={() => handleStatusUpdate(complaint.id, 'ROUTED')}
                            className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Override & Accept</span>
                          </button>
                        )}
                      </div>

                      {/* Department Override Reassignment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReassigningComplaint(complaint);
                          setNewDepartment(complaint.department || 'ROAD');
                          setReassignReason('');
                        }}
                        className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                        <span>{t.deptUserManagement.reassignDeptBtn}</span>
                      </button>

                      {/* Decommission / Delete Button */}
                      <button 
                        type="button"
                        onClick={() => setConfirmDeleteComplaintId(complaint.id)}
                        disabled={deletingId === complaint.id}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.adminDashboard.decommissionBtn}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* DEPARTMENT REASSIGNMENT OVERRIDE MODAL */}
      {reassigningComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transition-all space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <span>{t.deptUserManagement.reassignDeptTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setReassigningComplaint(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignDepartment} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {reassigningComplaint.title}
                </div>
                <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                  <span>Current Department:</span>
                  <strong className="text-purple-600 font-bold">
                    {t.departments[reassigningComplaint.department as keyof typeof t.departments] || reassigningComplaint.department}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t.deptUserManagement.selectNewDept} *
                </label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="ROAD">{t.departments.ROAD}</option>
                  <option value="SANITATION">{t.departments.SANITATION}</option>
                  <option value="WATER_SUPPLY">{t.departments.WATER_SUPPLY}</option>
                  <option value="ELECTRICAL">{t.departments.ELECTRICAL}</option>
                  <option value="DRAINAGE">{t.departments.DRAINAGE}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  {t.deptUserManagement.reassignReasonLabel} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder={t.deptUserManagement.reassignReasonPlaceholder}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReassigningComplaint(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isReassigning}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isReassigning ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{t.save}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Complaint Deletion */}
      <ConfirmationModal
        isOpen={Boolean(confirmDeleteComplaintId)}
        title="Remove Complaint Record"
        message="Are you sure you want to remove this civic incident report from the system? This action will permanently remove the record from municipal records."
        confirmLabel="Remove Report"
        cancelLabel={t.cancel}
        isDestructive={true}
        isLoading={Boolean(deletingId)}
        onConfirm={executeDeleteComplaint}
        onCancel={() => setConfirmDeleteComplaintId(null)}
      />

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <img src={previewImage} alt="Enlarged Evidence" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
