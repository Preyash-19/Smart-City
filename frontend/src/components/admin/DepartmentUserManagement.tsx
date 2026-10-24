import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Key, 
  Send, 
  Edit3, 
  Power, 
  History, 
  Copy, 
  Check, 
  AlertTriangle, 
  Loader2, 
  X,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface DepartmentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  departmentRole: 'HEAD' | 'OFFICER' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED';
  hasPendingInvitation: boolean;
  invitationExpired: boolean;
  invitationExpires?: string;
  lastLogin?: string;
  createdAt: string;
  assignedComplaintsCount?: number;
}

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function DepartmentUserManagement() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const currentAdmin = (() => {
    try {
      const u = localStorage.getItem('smartCityUser');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [users, setUsers] = useState<DepartmentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createDept, setCreateDept] = useState('ROAD');
  const [createRole, setCreateRole] = useState<'HEAD' | 'OFFICER' | 'STAFF'>('OFFICER');
  const [createStatus, setCreateStatus] = useState<'INVITED' | 'ACTIVE'>('INVITED');
  const [createTempPass, setCreateTempPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createResult, setCreateResult] = useState<{
    success: boolean;
    message: string;
    activationUrl?: string | null;
    emailSent?: boolean;
  } | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<DepartmentUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState<'HEAD' | 'OFFICER' | 'STAFF'>('OFFICER');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'INVITED'>('ACTIVE');

  // Deactivate Confirmation Modal
  const [confirmDeactivateUser, setConfirmDeactivateUser] = useState<DepartmentUser | null>(null);

  // Audit Log Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Copy Link State
  const [copiedTokenUrl, setCopiedTokenUrl] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedDept, selectedRole, selectedStatus]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('smartCityToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedRole !== 'ALL') params.role = selectedRole;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/admin/users', {
        ...getAuthHeader(),
        params
      });
      setUsers(res.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch department users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setCreateResult(null);

    try {
      const payload: any = {
        name: createName,
        email: createEmail,
        department: createDept,
        departmentRole: createRole,
        status: createStatus
      };
      if (createStatus === 'ACTIVE' && createTempPass) {
        payload.temporaryPassword = createTempPass;
      }

      const res = await apiClient.post('/admin/users', payload, getAuthHeader());

      setCreateResult({
        success: true,
        message: res.data.message || 'Department user created successfully.',
        activationUrl: res.data.emailDelivery?.activationUrl,
        emailSent: res.data.emailDelivery?.sent
      });

      // Refresh table
      fetchUsers();

      // Reset form
      setCreateName('');
      setCreateEmail('');
      setCreateDept('ROAD');
      setCreateRole('OFFICER');
      setCreateStatus('INVITED');
      setCreateTempPass('');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create department user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: DepartmentUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditDept(user.department);
    setEditRole(user.departmentRole);
    setEditStatus(user.status);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.put(
        `/admin/users/${editingUser.id}`,
        {
          name: editName,
          department: editDept,
          departmentRole: editRole,
          status: editStatus
        },
        getAuthHeader()
      );

      setSuccessMsg(`User ${editName} updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update department user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: DepartmentUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.put(
        `/admin/users/${user.id}`,
        { status: newStatus },
        getAuthHeader()
      );
      showToast(`User ${user.name} marked as ${newStatus}.`, 'success');
      setConfirmDeactivateUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update status.', 'error');
    }
  };

  const handleResendInvitation = async (user: DepartmentUser) => {
    try {
      const res = await apiClient.post(
        `/admin/users/${user.id}/resend-invitation`,
        {},
        getAuthHeader()
      );
      const delivery = res.data.emailDelivery;
      if (delivery?.activationUrl) {
        navigator.clipboard.writeText(delivery.activationUrl);
        showToast(`${res.data.message} — Activation URL copied to clipboard.`, 'success');
      } else {
        showToast(res.data.message || 'Invitation resent successfully.', 'success');
      }
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to resend invitation.', 'error');
    }
  };

  const handleResetPassword = async (user: DepartmentUser) => {
    try {
      const res = await apiClient.post(
        `/admin/users/${user.id}/reset-password`,
        {},
        getAuthHeader()
      );
      const delivery = res.data.emailDelivery;
      if (delivery?.resetUrl) {
        navigator.clipboard.writeText(delivery.resetUrl);
        showToast(`${res.data.message} — Password reset URL copied to clipboard.`, 'success');
      } else {
        showToast(res.data.message || 'Password reset triggered successfully.', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to trigger password reset.', 'error');
    }
  };

  const fetchAuditLogs = async () => {
    setIsAuditModalOpen(true);
    setLoadingAudit(true);
    try {
      const res = await apiClient.get('/admin/users/audit-logs', getAuthHeader());
      setAuditLogs(res.data.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenUrl(true);
    setTimeout(() => setCopiedTokenUrl(false), 3000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return t.deptUserManagement.neverLoggedIn;
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getDeptBadgeClass = (dept: string) => {
    switch (dept) {
      case 'ROAD': return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'SANITATION': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'WATER_SUPPLY': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'ELECTRICAL': return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';
      case 'DRAINAGE': return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'TRAFFIC': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'HEAD': return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-bold';
      case 'OFFICER': return 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 font-semibold';
      case 'STAFF': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-medium';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {t.deptUserManagement.tabUsers}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, assign department roles, configure accounts, and inspect access logs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchAuditLogs}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>{t.deptUserManagement.tabAuditLogs}</span>
          </button>

          <button
            onClick={() => {
              setCreateResult(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.deptUserManagement.createUserBtn}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.deptUserManagement.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              {t.deptUserManagement.thDept}
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">{t.deptUserManagement.filterDept}</option>
              <option value="ROAD">{t.departments.ROAD}</option>
              <option value="SANITATION">{t.departments.SANITATION}</option>
              <option value="WATER_SUPPLY">{t.departments.WATER_SUPPLY}</option>
              <option value="ELECTRICAL">{t.departments.ELECTRICAL}</option>
              <option value="DRAINAGE">{t.departments.DRAINAGE}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              {t.deptUserManagement.thRole}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">{t.deptUserManagement.filterRole}</option>
              <option value="HEAD">{t.departmentRoles.HEAD}</option>
              <option value="OFFICER">{t.departmentRoles.OFFICER}</option>
              <option value="STAFF">{t.departmentRoles.STAFF}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              {t.deptUserManagement.thAccountStatus}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">{t.deptUserManagement.filterStatus}</option>
              <option value="ACTIVE">{t.deptUserManagement.statusActive}</option>
              <option value="INVITED">{t.deptUserManagement.statusInvited}</option>
              <option value="INACTIVE">{t.deptUserManagement.statusInactive}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">{t.deptUserManagement.thName}</th>
                <th className="px-4 py-3.5">{t.deptUserManagement.thEmail}</th>
                <th className="px-4 py-3.5">{t.deptUserManagement.thDept}</th>
                <th className="px-4 py-3.5">{t.deptUserManagement.thRole}</th>
                <th className="px-4 py-3.5">{t.deptUserManagement.thAccountStatus}</th>
                <th className="px-4 py-3.5">{t.deptUserManagement.thInvitationStatus}</th>
                <th className="px-4 py-3.5">{t.deptUserManagement.thLastLogin}</th>
                <th className="px-4 py-3.5 text-right">{t.deptUserManagement.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                    <span>{t.loading}</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p>{t.deptUserManagement.noUsersFound}</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.id === currentAdmin?.id;
                  const deptLabel = t.departments[u.department as keyof typeof t.departments] || u.department;
                  const roleLabel = t.departmentRoles[u.departmentRole] || u.departmentRole;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            {isCurrentAdmin && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                                (You - Admin)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {u.email}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${getDeptBadgeClass(u.department)}`}>
                          <Building2 className="w-3 h-3" />
                          {deptLabel}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] border ${getRoleBadgeClass(u.departmentRole)}`}>
                          <ShieldCheck className="w-3 h-3" />
                          {roleLabel}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3.5">
                        {u.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t.deptUserManagement.statusActive}
                          </span>
                        )}
                        {u.status === 'INVITED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            {t.deptUserManagement.statusInvited}
                          </span>
                        )}
                        {u.status === 'INACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            <Power className="w-3 h-3 text-red-500" />
                            {t.deptUserManagement.statusInactive}
                          </span>
                        )}
                      </td>

                      {/* Invitation Status */}
                      <td className="px-4 py-3.5 text-[11px]">
                        {u.status === 'ACTIVE' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activated
                          </span>
                        ) : u.hasPendingInvitation ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending Link
                          </span>
                        ) : u.invitationExpired ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Expired
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {formatDate(u.lastLogin)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title={t.deptUserManagement.editUser}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {u.status === 'INVITED' && (
                            <button
                              onClick={() => handleResendInvitation(u)}
                              title={t.deptUserManagement.resendInvitation}
                              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-lg transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleResetPassword(u)}
                            title={t.deptUserManagement.resetAccess}
                            className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Inactive */}
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => {
                                if (u.status === 'ACTIVE') {
                                  setConfirmDeactivateUser(u);
                                } else {
                                  handleToggleStatus(u);
                                }
                              }}
                              title={u.status === 'ACTIVE' ? t.deptUserManagement.deactivateUser : t.deptUserManagement.activateUser}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                u.status === 'ACTIVE'
                                  ? 'hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400'
                                  : 'hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 transition-all">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                {t.deptUserManagement.createModalTitle}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createResult ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{createResult.message}</span>
                  </div>
                  {createResult.emailSent ? (
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                      Official invitation dispatched to email address.
                    </p>
                  ) : (
                    <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                      {t.deptUserManagement.smtpNotice}
                    </p>
                  )}
                </div>

                {createResult.activationUrl && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Activation / Password Setup Link:
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-mono text-[11px] break-all text-purple-700 dark:text-purple-300">
                      {createResult.activationUrl}
                    </div>
                    <button
                      onClick={() => copyToClipboard(createResult.activationUrl!)}
                      className="w-full py-2 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedTokenUrl ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>{t.deptUserManagement.linkCopied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{t.deptUserManagement.copyLink}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.deptUserManagement.fullNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Officer Rajesh Verma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.deptUserManagement.emailLabel} *
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="e.g. rajesh.verma@city.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.deptUserManagement.deptLabel} *
                    </label>
                    <select
                      value={createDept}
                      onChange={(e) => setCreateDept(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      <option value="ROAD">{t.departments.ROAD}</option>
                      <option value="SANITATION">{t.departments.SANITATION}</option>
                      <option value="WATER_SUPPLY">{t.departments.WATER_SUPPLY}</option>
                      <option value="ELECTRICAL">{t.departments.ELECTRICAL}</option>
                      <option value="DRAINAGE">{t.departments.DRAINAGE}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.deptUserManagement.roleLabel} *
                    </label>
                    <select
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      <option value="HEAD">{t.departmentRoles.HEAD}</option>
                      <option value="OFFICER">{t.departmentRoles.OFFICER}</option>
                      <option value="STAFF">{t.departmentRoles.STAFF}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.deptUserManagement.statusLabel}
                  </label>
                  <div className="flex gap-4 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="createStatus"
                        checked={createStatus === 'INVITED'}
                        onChange={() => setCreateStatus('INVITED')}
                        className="text-purple-600"
                      />
                      <span>{t.deptUserManagement.statusInvited} (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="createStatus"
                        checked={createStatus === 'ACTIVE'}
                        onChange={() => setCreateStatus('ACTIVE')}
                        className="text-purple-600"
                      />
                      <span>{t.deptUserManagement.statusActive}</span>
                    </label>
                  </div>
                </div>

                {createStatus === 'ACTIVE' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.deptUserManagement.tempPasswordLabel}
                    </label>
                    <input
                      type="password"
                      minLength={8}
                      value={createTempPass}
                      onChange={(e) => setCreateTempPass(e.target.value)}
                      placeholder={t.deptUserManagement.tempPasswordPlaceholder}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    {t.deptUserManagement.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.deptUserManagement.creating}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>{t.deptUserManagement.saveBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                {t.deptUserManagement.editModalTitle}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.deptUserManagement.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.deptUserManagement.deptLabel}
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="ROAD">{t.departments.ROAD}</option>
                  <option value="SANITATION">{t.departments.SANITATION}</option>
                  <option value="WATER_SUPPLY">{t.departments.WATER_SUPPLY}</option>
                  <option value="ELECTRICAL">{t.departments.ELECTRICAL}</option>
                  <option value="DRAINAGE">{t.departments.DRAINAGE}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.deptUserManagement.roleLabel}
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="HEAD">{t.departmentRoles.HEAD}</option>
                  <option value="OFFICER">{t.departmentRoles.OFFICER}</option>
                  <option value="STAFF">{t.departmentRoles.STAFF}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.deptUserManagement.statusLabel}
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="ACTIVE">{t.deptUserManagement.statusActive}</option>
                  <option value="INVITED">{t.deptUserManagement.statusInvited}</option>
                  <option value="INACTIVE">{t.deptUserManagement.statusInactive}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  {t.deptUserManagement.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition-all"
                >
                  {isSubmitting ? t.deptUserManagement.creating : t.deptUserManagement.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DEACTIVATE MODAL */}
      {confirmDeactivateUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.deptUserManagement.deactivateUser}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t.deptUserManagement.confirmDeactivate} ({confirmDeactivateUser.name})
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeactivateUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleToggleStatus(confirmDeactivateUser)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {t.deptUserManagement.deactivateUser}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 transition-all max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                {t.deptUserManagement.auditLogsTitle}
              </h3>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
              {loadingAudit ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                  <span>Loading audit logs...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p>{t.deptUserManagement.noLogsFound}</p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-700 dark:text-purple-400 text-[11px] font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-[11px]">
                      By: <span className="font-semibold">{log.user?.name || 'Administrator'}</span> ({log.user?.email || 'System'})
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all border border-slate-100 dark:border-slate-800">
                      {log.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
