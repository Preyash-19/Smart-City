import React, { useEffect, useState, useMemo } from 'react';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  BrainCircuit, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  RefreshCw, 
  CheckCheck, 
  ShieldCheck, 
  FileCheck, 
  UserCheck, 
  UserPlus, 
  Eye, 
  X,
  Search,
  Clock,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import SignalWaveform from '../../components/SignalWaveform';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface Complaint {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  department: string;
  priority: string;
  severity?: string;
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
  status: string;
  evidenceScore: number;
  aiSummary?: string;
  isFake?: boolean;
  isDuplicate?: boolean;
  address: string;
  createdAt: string;
  assignedOfficer?: {
    id: string;
    name: string;
    email: string;
    departmentRole?: string;
  } | null;
}

export default function OfficerDashboard() {
  const { language, t, formatNumber } = useLanguage();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Verification modal state
  const [verifyingComplaint, setVerifyingComplaint] = useState<Complaint | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('IN_PROGRESS');
  const [humanVerified, setHumanVerified] = useState<boolean>(true);
  const [severityOverride, setSeverityOverride] = useState<string>('');
  const [officerRemarks, setOfficerRemarks] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Department Head Assignment state
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [deptOfficers, setDeptOfficers] = useState<any[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  const navigate = useNavigate();
  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;
  const isDepartmentHead = user?.departmentRole === 'HEAD' || user?.role === 'ADMIN';
  const isStaff = user?.departmentRole === 'STAFF';

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

      const response = await apiClient.get('/complaints/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(t.complaintForm.valAuthRequired);
      } else {
        setError(t.complaintForm.submitNetworkError);
      }
    } finally {
      setLoading(false);
    }
  };

  const openVerificationModal = (complaint: Complaint) => {
    setVerifyingComplaint(complaint);
    setSelectedStatus(complaint.status === 'ROUTED' ? 'IN_PROGRESS' : complaint.status);
    setHumanVerified(complaint.humanVerified ?? true);
    setSeverityOverride(complaint.severity || complaint.priority || 'MEDIUM');
    setOfficerRemarks(complaint.humanRemarks || '');
  };

  const handleApplyUpdate = async () => {
    if (!verifyingComplaint) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem('smartCityToken');
      const response = await apiClient.put(
        `/complaints/${verifyingComplaint.id}/status`, 
        { 
          status: selectedStatus, 
          remark: officerRemarks || `Status updated to ${selectedStatus} by ${user?.name || 'Department Officer'}.`,
          humanVerified: humanVerified,
          humanRemarks: officerRemarks,
          severityOverride: severityOverride || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response.data.complaint;
      setComplaints(prev => 
        prev.map(item => item.id === verifyingComplaint.id ? { ...item, ...updated } : item)
      );
      setVerifyingComplaint(null);
      showToast("Complaint status updated successfully.", "success");

    } catch (err: any) {
      console.error("Status Update Error:", err);
      showToast(err.response?.data?.error || "Could not update complaint status. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openAssignModal = async (complaint: Complaint) => {
    setAssigningComplaint(complaint);
    setSelectedOfficerId(complaint.assignedOfficer?.id || '');
    try {
      const token = localStorage.getItem('smartCityToken');
      const res = await apiClient.get(`/complaints/department-officers/${complaint.department}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptOfficers(res.data.officers || []);
    } catch (err) {
      console.error("Error fetching department personnel:", err);
    }
  };

  const handleAssignPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint) return;
    setIsAssigning(true);

    try {
      const token = localStorage.getItem('smartCityToken');
      const res = await apiClient.put(
        `/complaints/${assigningComplaint.id}/assign`,
        { officerId: selectedOfficerId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.complaint;
      setComplaints(prev => prev.map(c => c.id === assigningComplaint.id ? { ...c, ...updated } : c));
      setAssigningComplaint(null);
      showToast("Personnel assigned successfully.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to assign personnel.', "error");
    } finally {
      setIsAssigning(false);
    }
  };

  // Operational metrics
  const totalIncidents = complaints.length;
  const highCount = complaints.filter(c => {
    const sev = c.severity || c.priority;
    return sev === 'HIGH' || sev === 'CRITICAL';
  }).length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED').length;
  const routedCount = complaints.filter(c => c.status === 'ROUTED' || c.status === 'SUBMITTED').length;

  // Filtered complaints based on status, priority, and search
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Status match
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

      // Priority / Severity match
      const currentSeverity = c.severity || c.priority;
      const matchesPriority =
        priorityFilter === 'ALL'
          ? true
          : priorityFilter === 'HIGH'
          ? (currentSeverity === 'HIGH' || currentSeverity === 'CRITICAL')
          : currentSeverity === priorityFilter;

      // Search match (id, title, address, description)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        c.id.toLowerCase().includes(q) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.aiPredictedIssue && c.aiPredictedIssue.toLowerCase().includes(q))
      );

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [complaints, statusFilter, priorityFilter, searchQuery]);

  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': 
        return 'text-rose-700 bg-rose-100 border-rose-300 dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800 font-black';
      case 'HIGH': 
        return 'text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-950/60 dark:border-red-800 font-bold';
      case 'MEDIUM': 
        return 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800 font-semibold';
      case 'REJECTED_AS_IRRELEVANT':
        return 'text-slate-700 bg-slate-200 border-slate-300 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700 font-medium';
      case 'LOW': 
      default:
        return 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800 font-medium';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-300 dark:border-amber-500/30',
          icon: Clock,
          label: t.statuses.IN_PROGRESS
        };
      case 'RESOLVED':
      case 'COMPLETED':
      case 'CLOSED':
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30',
          icon: CheckCircle2,
          label: t.statuses.RESOLVED
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-300 dark:border-red-500/30',
          icon: X,
          label: t.statuses.REJECTED
        };
      case 'ROUTED':
      case 'SUBMITTED':
      default:
        return {
          bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30',
          icon: ArrowRight,
          label: t.statuses.ROUTED
        };
    }
  };

  const getLocalizedExplanation = (complaint: Complaint) => {
    if (language === 'hi' && complaint.aiExplanationHi) return complaint.aiExplanationHi;
    if (language === 'mr' && complaint.aiExplanationMr) return complaint.aiExplanationMr;
    return complaint.aiExplanation || complaint.aiSummary || complaint.description;
  };

  const userDeptName = t.departments[user?.department as keyof typeof t.departments] || user?.department || 'Department';

  return (
    <div className="w-full max-w-6xl flex flex-col items-center transition-colors">
      <Navbar />

      {/* COMMAND CENTER HEADER */}
      <div className="w-full relative overflow-hidden bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 transition-colors duration-200">
        <SignalWaveform />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>{userDeptName}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-xs font-semibold">
                <UserCheck className="w-3 h-3 text-cyan-600 dark:text-neonCyan" />
                <span>{user?.name} ({user?.departmentRole ? (t.departmentRoles[user.departmentRole as keyof typeof t.departmentRoles] || user.departmentRole) : t.roles.OFFICER})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Queue</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Activity className="text-cyan-600 dark:text-neonCyan w-7 h-7" />
              {t.officerDashboard.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {t.officerDashboard.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOfficerTelemetry}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
            <span>{t.refresh}</span>
          </button>
        </div>

        {/* Operational Metrics Cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Total Assigned */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>{t.officerDashboard.assignedStats}</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {formatNumber(totalIncidents)}
              </span>
              <span className="text-[11px] text-slate-500">cases</span>
            </div>
          </div>

          {/* High Priority Alerts */}
          <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>{t.officerDashboard.highStats || t.severities.HIGH}</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-600 dark:text-red-400">
                {formatNumber(highCount)}
              </span>
              <span className="text-[11px] text-red-500/80 font-medium">Urgent</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>{t.officerDashboard.inProgressStats}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {formatNumber(inProgressCount)}
              </span>
              <span className="text-[11px] text-amber-500/80 font-medium">Active</span>
            </div>
          </div>

          {/* Resolved */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>{t.officerDashboard.resolvedStats}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatNumber(resolvedCount)}
              </span>
              <span className="text-[11px] text-emerald-500/80 font-medium">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRIAGE TOOLBAR & FAST FILTERS */}
      <div className="w-full mb-6 p-4 sm:p-5 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Fast Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, landmark address..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
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

          {/* Severity Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Severity:
            </span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
              const isActive = priorityFilter === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setPriorityFilter(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? sev === 'HIGH'
                        ? 'bg-red-600 text-white shadow-xs'
                        : sev === 'MEDIUM'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : sev === 'LOW'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sev === 'HIGH' && <span className="w-1.5 h-1.5 rounded-full bg-red-300" />}
                  {sev === 'MEDIUM' && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                  {sev === 'LOW' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
                  <span>{sev === 'ALL' ? 'All' : t.severities[sev]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Tab Strip */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Status:
          </span>
          {[
            { id: 'ALL', label: t.statuses.ALL, count: totalIncidents },
            { id: 'IN_PROGRESS', label: t.statuses.IN_PROGRESS, count: inProgressCount },
            { id: 'ROUTED', label: t.statuses.ROUTED, count: routedCount },
            { id: 'RESOLVED', label: t.statuses.RESOLVED, count: resolvedCount },
            { id: 'REJECTED', label: t.statuses.REJECTED, count: complaints.filter(c => c.status === 'REJECTED').length },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950 font-bold'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* COMPLAINTS QUEUE GRID */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 dark:text-neonCyan" />
          <span>{t.loading}</span>
        </div>
      ) : error ? (
        <div className="w-full p-4 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-2xl text-center text-sm mb-8">
          {error}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="w-full py-20 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 mb-8 p-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {t.officerDashboard.noComplaintsAssigned}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No incidents currently match your active filters or department queue.
          </p>
          {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filteredComplaints.map((complaint) => {
            const severity = complaint.severity || complaint.priority || 'MEDIUM';
            const severityText = t.severities[severity as keyof typeof t.severities] || (severity === 'REJECTED_AS_IRRELEVANT' ? 'Non-Civic' : severity);
            const deptText = t.departments[complaint.department as keyof typeof t.departments] || complaint.department;
            const aiText = getLocalizedExplanation(complaint);
            const statusConfig = getStatusBadge(complaint.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={complaint.id} 
                className="bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Strip: ID, Department, Status & Severity */}
                  <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{complaint.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 px-2 py-0.5 rounded-md">
                        {deptText}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-bold ${statusConfig.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className={`text-[10px] px-2.5 py-0.5 border rounded-full flex items-center gap-1 whitespace-nowrap ${getSeverityStyle(severity)}`}>
                        {severity === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                        {severityText}
                      </span>
                    </div>
                  </div>

                  {/* Visual Photo Evidence with Lightbox Trigger */}
                  {complaint.imageUrl && (
                    <div 
                      onClick={() => setPreviewImage(complaint.imageUrl || null)}
                      className="w-full h-48 mb-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative group cursor-pointer shadow-xs"
                      title="Click to view full photo evidence"
                    >
                      <img 
                        src={complaint.imageUrl} 
                        alt="Visual Evidence" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-white font-bold border border-slate-700/80">
                        Confidence: {Math.round((complaint.confidence !== undefined && complaint.confidence !== null ? complaint.confidence : (complaint.evidenceScore / 100)) * 100)}%
                      </div>
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
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-neonCyan shrink-0" />
                      <span className="truncate">{complaint.address || 'Reported municipal sector'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* AI Visual Diagnostics Card */}
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800/90 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400">
                        <BrainCircuit className="w-4 h-4" />
                        <span>{t.officerDashboard.aiEvidenceCardTitle}</span>
                      </div>
                      {complaint.humanVerified ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          <span>{t.verification.HUMAN_VERIFIED}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 border border-slate-300 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700 px-2 py-0.5 rounded-full">
                          {t.verification.AI_ASSESSED}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{aiText}"
                    </p>

                    {complaint.severityReasons && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        <strong className="text-slate-700 dark:text-slate-300">{t.officerDashboard.aiReasons}:</strong> {complaint.severityReasons}
                      </p>
                    )}

                    {complaint.humanRemarks && (
                      <div className="mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                        <strong>{t.citizenHistory.officerRemarksTitle}</strong> {complaint.humanRemarks}
                      </div>
                    )}

                    {/* Assigned Personnel Info */}
                    {complaint.assignedOfficer ? (
                      <div className="mt-2 text-[11px] text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20 flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assigned:</span>
                        </span>
                        <span className="font-bold">{complaint.assignedOfficer.name} ({t.departmentRoles[complaint.assignedOfficer.departmentRole as keyof typeof t.departmentRoles] || complaint.assignedOfficer.departmentRole})</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-slate-400 italic">
                        {t.deptUserManagement.unassigned}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                  <button 
                    type="button"
                    onClick={() => openVerificationModal(complaint)}
                    className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{t.officerDashboard.updateStatusModalTitle}</span>
                  </button>

                  {isDepartmentHead && (
                    <button
                      type="button"
                      onClick={() => openAssignModal(complaint)}
                      className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Assign personnel to this report"
                    >
                      <UserPlus className="w-4 h-4 text-purple-600" />
                      <span>{t.deptUserManagement.assignPersonnelBtn}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VERIFICATION & STATUS UPDATE MODAL */}
      {verifyingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-neonCyan" />
                <span>{t.officerDashboard.updateStatusModalTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setVerifyingComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {verifyingComplaint.title}
              </div>
              <div className="text-slate-500 text-[11px] font-mono">
                Tracking Ref: #{verifyingComplaint.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

            {isStaff && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                Notice: As Department Staff, you can record progress notes and set status to In Progress. Approving final Resolution or Rejection requires a Department Head or Officer.
              </div>
            )}

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {t.officerDashboard.selectNewStatus}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'IN_PROGRESS', label: t.statuses.IN_PROGRESS, disabled: false },
                  { id: 'RESOLVED', label: t.statuses.RESOLVED, disabled: isStaff },
                  { id: 'ROUTED', label: t.statuses.ROUTED, disabled: false },
                  { id: 'REJECTED', label: t.statuses.REJECTED, disabled: isStaff }
                ].map(stat => (
                  <button
                    key={stat.id}
                    type="button"
                    disabled={stat.disabled}
                    onClick={() => setSelectedStatus(stat.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedStatus === stat.id
                        ? stat.id === 'RESOLVED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : stat.id === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : stat.id === 'REJECTED'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Override */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {t.officerDashboard.severityOverrideLabel}
              </label>
              <select
                value={severityOverride}
                onChange={(e) => setSeverityOverride(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="LOW">{t.severities.LOW}</option>
                <option value="MEDIUM">{t.severities.MEDIUM}</option>
                <option value="HIGH">{t.severities.HIGH}</option>
              </select>
            </div>

            {/* Human Verification Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.officerDashboard.humanVerificationCheckbox}
                </span>
                <span className="text-[11px] text-slate-400">
                  Officer has reviewed evidence and confirms civic legitimacy
                </span>
              </div>
              <input
                type="checkbox"
                id="humanVerifyCheckbox"
                checked={humanVerified}
                onChange={(e) => setHumanVerified(e.target.checked)}
                className="w-5 h-5 text-cyan-600 rounded cursor-pointer accent-cyan-600"
              />
            </div>

            {/* Officer Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {t.officerDashboard.officerRemarksLabel}
              </label>
              <textarea
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder={t.officerDashboard.officerRemarksPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingComplaint(null)}
                className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleApplyUpdate}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? t.officerDashboard.updatingStatus : t.officerDashboard.applyUpdateBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT HEAD PERSONNEL ASSIGNMENT MODAL */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transition-all space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>{t.deptUserManagement.assignPersonnelTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setAssigningComplaint(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPersonnel} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {assigningComplaint.title}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Department: <strong className="text-purple-600">{assigningComplaint.department}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Assign to Department Personnel
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="">— {t.deptUserManagement.unassigned} —</option>
                  {deptOfficers.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({t.departmentRoles[off.departmentRole as keyof typeof t.departmentRoles] || off.departmentRole}) — {off.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isAssigning ? <span>Assigning...</span> : <span>Save Assignment</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
