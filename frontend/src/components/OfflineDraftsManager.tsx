import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { 
  CloudOff, 
  Send, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Clock
} from 'lucide-react';
import { draftStorage, type OfflineDraft } from '../services/draftStorage';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { useLanguage } from '../context/LanguageContext';
import ConfirmationModal from './ConfirmationModal';

interface OfflineDraftsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onEditDraft?: (draft: OfflineDraft) => void;
  onDraftSubmitted?: () => void;
}

export default function OfflineDraftsManager({
  isOpen,
  onClose,
  onEditDraft,
  onDraftSubmitted
}: OfflineDraftsManagerProps) {
  const { t } = useLanguage();
  const { isOnline, checkReachability, refreshDraftsCount, setStatus } = useNetworkStatus();
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const loadDrafts = async () => {
    try {
      const userString = localStorage.getItem('smartCityUser');
      const user = userString ? JSON.parse(userString) : null;
      const list = await draftStorage.getDrafts(user?.id);
      setDrafts(list);
    } catch (err) {
      console.error("Failed to load offline drafts:", err);
    }
  };

  const executeDeleteDraft = async () => {
    if (!confirmDeleteId) return;
    setIsDeletingDraft(true);
    try {
      await draftStorage.deleteDraft(confirmDeleteId);
      await refreshDraftsCount();
      await loadDrafts();
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Error deleting draft:", err);
    } finally {
      setIsDeletingDraft(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleSubmitDraft = async (draft: OfflineDraft) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Verify actual reachability first
    const reachable = await checkReachability();
    if (!reachable) {
      setErrorMsg(t.networkStatus?.offlineNotice || "Network unreachable. Internet connection is required to upload photo and run AI analysis.");
      return;
    }

    const token = localStorage.getItem('smartCityToken');
    if (!token) {
      setErrorMsg("Authentication expired. Please log in first to submit your draft.");
      return;
    }

    setSubmittingId(draft.id);
    setStatus('SYNCING_DRAFTS');

    try {
      let finalImageUrl = draft.imageDataUrl;

      // Upload local base64 photo to server upload storage if present
      if (draft.imageDataUrl && draft.imageDataUrl.startsWith('data:')) {
        try {
          const uploadRes = await apiClient.post(
            '/complaints/upload-image',
            { image: draft.imageDataUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (uploadRes.data?.imageUrl) {
            finalImageUrl = uploadRes.data.imageUrl;
          }
        } catch (uploadErr) {
          console.warn("Upload image endpoint failed, sending base64 directly to submission:", uploadErr);
        }
      }

      // Submit complaint with idempotency protection to prevent duplicates
      await apiClient.post(
        '/complaints/submit',
        {
          department: draft.department,
          title: draft.title,
          description: draft.description,
          imageUrl: finalImageUrl,
          latitude: draft.latitude,
          longitude: draft.longitude,
          address: draft.address,
          idempotencyKey: draft.idempotencyKey
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Successfully submitted to municipal server
      await draftStorage.deleteDraft(draft.id);
      await refreshDraftsCount();
      setStatus('SUBMISSION_SUCCESS');
      setSuccessMsg(t.networkStatus?.draftSubmitSuccess || 'Draft successfully submitted and routed!');

      await loadDrafts();
      if (onDraftSubmitted) {
        onDraftSubmitted();
      }
    } catch (err: any) {
      console.error("Draft submission error:", err);
      setStatus('SUBMISSION_FAILED');
      const msg = err.response?.data?.error || t.networkStatus?.draftSubmitError || "Failed to submit draft. Please try again.";
      setErrorMsg(msg);
      await draftStorage.updateStatus(draft.id, 'FAILED', msg);
    } finally {
      setSubmittingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <CloudOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.networkStatus?.offlineDraftsTitle || 'Offline Complaint Drafts'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {drafts.length} draft(s) stored locally in browser IndexedDB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="m-4 p-3 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Offline Advisory Notice */}
        <div className="px-5 py-2.5 bg-cyan-50/60 dark:bg-cyan-950/30 border-b border-cyan-100 dark:border-cyan-900/30 text-cyan-800 dark:text-cyan-300 text-[11px] flex items-center justify-between">
          <span>{t.networkStatus?.aiOfflineNote || "AI image analysis and routing will be performed when reconnected and submitted."}</span>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
            {isOnline ? '● Connected' : '○ Offline'}
          </span>
        </div>

        {/* Drafts List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {drafts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <CloudOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">{t.networkStatus?.noDrafts || 'No offline drafts saved.'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                When you are offline, you can save complaints as drafts to submit once reconnected.
              </p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div 
                key={draft.id}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
              >
                {/* Photo & Info */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  {draft.imageDataUrl ? (
                    <img 
                      src={draft.imageDataUrl} 
                      alt="Draft Preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0 text-xs font-semibold">
                      No Photo
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[11px] font-bold uppercase">
                        {t.departments[draft.department as keyof typeof t.departments] || draft.department}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                        {t.networkStatus?.draftNotSynced || 'Offline Draft'}
                      </span>
                    </div>

                    {draft.address && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate max-w-xs">{draft.address}</span>
                      </p>
                    )}

                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(draft.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                  {onEditDraft && (
                    <button
                      type="button"
                      onClick={() => {
                        onEditDraft(draft);
                        onClose();
                      }}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                      title={t.networkStatus?.editDraft || 'Edit Draft'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">{t.networkStatus?.editDraft || 'Edit'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(draft.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                    title={t.networkStatus?.deleteDraft || 'Delete Draft'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={submittingId === draft.id}
                    onClick={() => handleSubmitDraft(draft)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submittingId === draft.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.networkStatus?.submitDraft || 'Submit Now'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Storage: IndexedDB (Client Sandbox)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg cursor-pointer transition-colors"
          >
            {t.close}
          </button>
        </div>

        {/* Confirmation Modal for Draft Deletion */}
        <ConfirmationModal
          isOpen={Boolean(confirmDeleteId)}
          title="Delete Offline Draft"
          message="Are you sure you want to permanently delete this offline draft? This action cannot be undone."
          confirmLabel="Delete Draft"
          cancelLabel={t.cancel}
          isDestructive={true}
          isLoading={isDeletingDraft}
          onConfirm={executeDeleteDraft}
          onCancel={() => setConfirmDeleteId(null)}
        />

      </div>
    </div>
  );
}
