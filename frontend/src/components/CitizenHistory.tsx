import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  BrainCircuit, 
  MapPin, 
  ArrowLeft, 
  LogOut, 
  CheckCheck, 
  X,
  PlusCircle,
  Eye
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface FeedbackData {
  id: string;
  rating: number;
  comments?: string | null;
  createdAt: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  department: string;
  status: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  severity?: string;
  severityScore?: number;
  evidenceScore?: number;
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
  feedback?: FeedbackData | null;
}

export default function CitizenHistory() {
  const { language, t, formatDate } = useLanguage();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Image lightbox preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Feedback form state
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [successFeedbackId, setSuccessFeedbackId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const fetchMyHistory = async () => {
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
    } catch (err) {
      setError(t.complaintForm.submitNetworkError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartCityToken');
    localStorage.removeItem('smartCityUser');
    navigate('/login');
  };

  const openFeedbackForm = (complaintId: string) => {
    setActiveFeedbackId(complaintId);
    setRating(0);
    setHoverRating(0);
    setComment('');
    setFeedbackError('');
    setSuccessFeedbackId(null);
  };

  const closeFeedbackForm = () => {
    setActiveFeedbackId(null);
    setRating(0);
    setHoverRating(0);
    setComment('');
    setFeedbackError('');
  };

  const handleSubmitFeedback = async (complaintId: string) => {
    if (!rating || rating < 1 || rating > 5) {
      setFeedbackError(t.citizenHistory.starRatingPrompt);
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError('');

    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.post(
        `/complaints/${complaintId}/feedback`,
        {
          rating,
          comment: comment.trim() || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            feedback: response.data.feedback
          };
        }
        return c;
      }));

      setSuccessFeedbackId(complaintId);
      showToast(t.citizenHistory.feedbackSubmitted, 'success');
      closeFeedbackForm();

    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to submit feedback.';
      setFeedbackError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusDisplay = (status: string, relevance?: string) => {
    if (status === 'REJECTED' || relevance === 'IRRELEVANT') {
      return {
        text: 'Non-Civic Media — Rejected',
        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        icon: <AlertCircle className="w-3.5 h-3.5" />
      };
    }
    switch (status) {
      case 'SUBMITTED':
      case 'ROUTED':
        return {
          text: t.statuses.ROUTED,
          color: 'bg-cyan-500/10 text-cyan-600 dark:text-neonCyan border-cyan-500/30',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'IN_PROGRESS':
        return {
          text: t.statuses.IN_PROGRESS,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
        };
      case 'RESOLVED':
      case 'COMPLETED':
      case 'CLOSED':
        return {
          text: t.statuses.RESOLVED,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case 'DUPLICATE':
        return {
          text: t.statuses.DUPLICATE,
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      default:
        return {
          text: status,
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
          icon: <Clock className="w-3.5 h-3.5" />
        };
    }
  };

  const getSeverityBadge = (severity?: string, relevance?: string) => {
    if (relevance === 'IRRELEVANT' || severity === 'REJECTED_AS_IRRELEVANT') {
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-bold';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium';
    }
  };

  const getLocalizedAiExplanation = (complaint: Complaint) => {
    if (language === 'hi' && complaint.aiExplanationHi) {
      return complaint.aiExplanationHi;
    }
    if (language === 'mr' && complaint.aiExplanationMr) {
      return complaint.aiExplanationMr;
    }
    return complaint.aiExplanation || complaint.description;
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'COMPLETED' || c.status === 'CLOSED';
    if (filterStatus === 'ACTIVE') return c.status === 'IN_PROGRESS' || c.status === 'ROUTED' || c.status === 'SUBMITTED';
    if (filterStatus === 'REJECTED') return c.status === 'REJECTED' || c.civicRelevance === 'IRRELEVANT';
    return c.status === filterStatus;
  });

  return (
    <div className="w-full max-w-4xl p-4 sm:p-6 transition-colors">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link 
          to="/citizen" 
          className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-neonCyan hover:underline transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.citizenHistory.backBtn}</span>
        </Link>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            to="/citizen/report"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.citizenHistory.reportNewBtn}</span>
          </Link>
          <button 
            type="button"
            onClick={handleLogout} 
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logOut}</span>
          </button>
        </div>
      </div>

      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.citizenHistory.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            {t.citizenHistory.subtitle}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'ACTIVE'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'RESOLVED'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400 text-sm">
          {t.loading}
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          {error}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400">
          <p className="font-bold text-base mb-1 text-slate-800 dark:text-slate-200">{t.citizenHistory.emptyTitle}</p>
          <p className="text-xs mb-5 max-w-sm mx-auto">{t.citizenHistory.emptySubtitle}</p>
          <Link
            to="/citizen/report"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.citizenHistory.reportNewBtn}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => {
            const statusStyle = getStatusDisplay(complaint.status, complaint.civicRelevance);
            const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'COMPLETED';
            const isRejected = complaint.status === 'REJECTED' || complaint.civicRelevance === 'IRRELEVANT';
            const hasFeedback = Boolean(complaint.feedback);
            const isFormOpen = activeFeedbackId === complaint.id;
            const isJustSubmitted = successFeedbackId === complaint.id;
            const severity = complaint.severity || 'MEDIUM';
            const severityText = t.severities[severity as keyof typeof t.severities] || severity;
            const deptText = t.departments[complaint.department as keyof typeof t.departments] || complaint.department;
            const aiText = getLocalizedAiExplanation(complaint);

            return (
              <div 
                key={complaint.id} 
                className="p-5 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  
                  {/* Photo Evidence Thumbnail (if present) */}
                  {complaint.imageUrl && (
                    <div 
                      onClick={() => setPreviewImage(complaint.imageUrl || null)}
                      className="relative w-full sm:w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shrink-0 group cursor-pointer shadow-xs"
                      title="Click to view full photo evidence"
                    >
                      <img 
                        src={complaint.imageUrl} 
                        alt="Complaint evidence" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Complaint Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-neonCyan uppercase tracking-wider">
                        #{complaint.id.slice(0, 8).toUpperCase()}
                      </span>

                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {deptText}
                      </span>

                      {!isRejected && (
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getSeverityBadge(severity, complaint.civicRelevance)}`}>
                          {t.citizenHistory.severityLabel} {severityText}
                        </span>
                      )}

                      {complaint.humanVerified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          <span>{t.verification.HUMAN_VERIFIED}</span>
                        </span>
                      )}

                      <div className={`ml-auto px-2.5 py-1 rounded-full border flex items-center gap-1 text-[11px] font-bold ${statusStyle.color}`}>
                        {statusStyle.icon}
                        <span>{statusStyle.text}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {complaint.title || deptText}
                    </h3>

                    {complaint.address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-neonCyan shrink-0" />
                        <span className="truncate">{complaint.address}</span>
                      </p>
                    )}

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-3">
                      {t.citizenDashboard.reportedOn}: {formatDate(complaint.createdAt)}
                    </span>

                    {/* AI Visual Diagnostics Block */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-cyan-400">
                        <span className="flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>{t.citizenHistory.aiDiagnosisTitle}</span>
                        </span>
                        {complaint.confidence !== undefined && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {(complaint.confidence * 100).toFixed(0)}% Confidence
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {aiText}
                      </p>

                      {complaint.humanRemarks && (
                        <div className="pt-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                          <strong>{t.citizenHistory.officerRemarksTitle}</strong> {complaint.humanRemarks}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Just Submitted Feedback Success Banner */}
                {isJustSubmitted && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t.citizenHistory.feedbackSubmitted}</span>
                  </div>
                )}

                {/* Read-Only Feedback Display if already submitted */}
                {isResolved && hasFeedback && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Your Feedback:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (complaint.feedback?.rating || 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="font-bold text-amber-500 ml-1">
                          {complaint.feedback?.rating} / 5
                        </span>
                      </div>
                    </div>
                    {complaint.feedback?.comments && (
                      <span className="text-slate-500 italic truncate max-w-md">
                        "{complaint.feedback.comments}"
                      </span>
                    )}
                  </div>
                )}

                {/* Interactive Feedback Form if Resolved & Not yet rated */}
                {isResolved && !hasFeedback && !isJustSubmitted && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {!isFormOpen ? (
                      <button
                        type="button"
                        onClick={() => openFeedbackForm(complaint.id)}
                        className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{t.citizenHistory.rateResolutionTitle}</span>
                      </button>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {t.citizenHistory.rateResolutionTitle}
                          </span>
                          <button
                            type="button"
                            onClick={closeFeedbackForm}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {t.cancel}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 focus:outline-none cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 transition-all ${
                                  star <= (hoverRating || rating)
                                    ? 'text-amber-400 fill-amber-400 scale-110'
                                    : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          ))}
                          {rating > 0 && (
                            <span className="text-xs font-bold text-amber-500 ml-2">
                              {rating} / 5
                            </span>
                          )}
                        </div>

                        <textarea
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={t.citizenHistory.commentsPlaceholder}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                        />

                        {feedbackError && (
                          <p className="text-xs text-red-500 font-semibold">⚠️ {feedbackError}</p>
                        )}

                        <button
                          type="button"
                          disabled={submittingFeedback}
                          onClick={() => handleSubmitFeedback(complaint.id)}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 disabled:opacity-50 text-white dark:text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          {submittingFeedback ? t.citizenHistory.submittingFeedback : t.citizenHistory.submitFeedbackBtn}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <img src={previewImage} alt="Enlarged Evidence" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}