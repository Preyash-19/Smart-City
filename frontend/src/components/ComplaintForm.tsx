import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../services/api';
import { 
  Send, 
  Loader2, 
  Image as ImageIcon, 
  Camera, 
  X, 
  LogOut, 
  ChevronDown, 
  Info,
  CloudOff,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  PlusCircle,
  History
} from 'lucide-react';
import LocationSelector from './LocationSelector';
import { DEPARTMENT_OPTIONS } from '../i18n/translations';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../context/NetworkStatusContext';
import { useToast } from '../context/ToastContext';
import { draftStorage, type OfflineDraft } from '../services/draftStorage';
import OfflineDraftsManager from './OfflineDraftsManager';

export default function ComplaintForm() {
  const { language, setLanguage, t } = useLanguage();
  const { draftsCount, refreshDraftsCount, setStatus } = useNetworkStatus();
  const { showToast } = useToast();

  // Selected Department Code
  const [department, setDepartment] = useState('');

  // Location State
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Photo Upload States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cloudImageUrl, setCloudImageUrl] = useState<string | null>(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  // Offline Draft States
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [consentOfflineStorage, setConsentOfflineStorage] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('smartCityToken');
    localStorage.removeItem('smartCityUser');
    navigate('/login');
  };

  const handleLocationFound = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
    setErrorMessage('');
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setCloudImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    setErrorMessage('');
    setAiNotice(null);
  };

  // Image Upload with Local Backend Storage & Cloudinary Fallback
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    if (!file.type.startsWith('image/')) {
      setErrorMessage(t.complaintForm.imageTypeError);
      showToast(t.complaintForm.imageTypeError, 'error');
      return;
    }

    // File size validation (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(t.complaintForm.imageSizeError);
      showToast(t.complaintForm.imageSizeError, 'error');
      return;
    }

    // Show Preview immediately
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploadingImg(true);
    setErrorMessage('');
    setAiNotice(null);

    const secureToken = localStorage.getItem('smartCityToken');

    // Read file as base64 data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        // Direct backend storage upload
        const response = await apiClient.post(
          '/complaints/upload-image',
          { image: base64Data },
          { headers: { Authorization: `Bearer ${secureToken || ''}` } }
        );

        setCloudImageUrl(response.data.imageUrl);
        showToast(t.complaintForm.imageSuccess, 'success');
      } catch (backendErr: any) {
        console.warn("Backend local upload failed, trying Cloudinary fallback:", backendErr);
        // Cloudinary Fallback
        const CLOUD_NAME = "z8agz77l";
        const UPLOAD_PRESET = "smart_city_upload";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
          const cResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData
          );
          setCloudImageUrl(cResponse.data.secure_url);
          showToast(t.complaintForm.imageSuccess, 'success');
        } catch (cErr: any) {
          console.error("Image Upload Error:", cErr);
          // If offline or both fail, use the local data URL directly for inference
          setCloudImageUrl(base64Data);
          showToast("Photo attached and ready for analysis.", 'info');
        }
      } finally {
        setIsUploadingImg(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read photo file.");
      showToast("Failed to read photo file.", 'error');
      setIsUploadingImg(false);
    };

    reader.readAsDataURL(file);
  };

  // Save as Offline Draft in IndexedDB
  const handleSaveOfflineDraft = async () => {
    if (!department) {
      setErrorMessage(t.complaintForm.valDepartmentRequired);
      showToast(t.complaintForm.valDepartmentRequired, 'warning');
      return;
    }

    if (!consentOfflineStorage) {
      const consentText = t.networkStatus?.draftConsentRequired || 'Consent is required to store photo and location data locally.';
      setErrorMessage(consentText);
      showToast(consentText, 'warning');
      return;
    }

    setIsSavingDraft(true);
    try {
      const userString = localStorage.getItem('smartCityUser');
      const user = userString ? JSON.parse(userString) : null;

      await draftStorage.saveDraft({
        id: activeDraftId || undefined,
        citizenId: user?.id,
        department,
        imageDataUrl: cloudImageUrl || previewUrl || undefined,
        latitude: location?.lat,
        longitude: location?.lng,
        address: location?.address,
        hasLocationPermission: Boolean(location?.lat),
        consentGiven: true,
        syncStatus: 'DRAFT'
      });

      setStatus('DRAFT_SAVED');
      await refreshDraftsCount();
      const savedMsg = t.networkStatus?.draftSaved || 'Draft saved offline';
      showToast(savedMsg, 'success');
      setActiveDraftId(null);
      setErrorMessage('');
    } catch (err: any) {
      console.error("Failed to save offline draft:", err);
      showToast("Failed to save draft locally in browser storage.", 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleEditDraft = (draft: OfflineDraft) => {
    setDepartment(draft.department);
    if (draft.imageDataUrl) {
      setPreviewUrl(draft.imageDataUrl);
      setCloudImageUrl(draft.imageDataUrl);
    }
    if (draft.latitude !== undefined && draft.longitude !== undefined) {
      setLocation({
        lat: draft.latitude,
        lng: draft.longitude,
        address: draft.address || ''
      });
    }
    setActiveDraftId(draft.id);
    const draftDept = t.departments[draft.department as keyof typeof t.departments] || draft.department;
    showToast(`${t.networkStatus?.editDraft || 'Editing Draft'}: ${draftDept}`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      const offlineMsg = t.networkStatus?.offlineNotice || t.complaintForm.valOffline;
      setErrorMessage(offlineMsg);
      showToast(offlineMsg, 'warning');
      return;
    }

    // Validate Department Selection
    if (!department) {
      setErrorMessage(t.complaintForm.valDepartmentRequired);
      showToast(t.complaintForm.valDepartmentRequired, 'warning');
      return;
    }

    // Validate GPS Coordinates
    if (!location || location.lat === undefined || location.lng === undefined) {
      setErrorMessage(t.complaintForm.valLocationRequired);
      showToast(t.complaintForm.valLocationRequired, 'warning');
      return;
    }

    // Validate Photo Attached
    if (!cloudImageUrl) {
      const photoReqMsg = 'Please attach a clear photograph of the civic problem.';
      setErrorMessage(photoReqMsg);
      showToast(photoReqMsg, 'warning');
      return;
    }

    // Ensure image upload is completed
    if (isUploadingImg) {
      setErrorMessage(t.complaintForm.valWaitUpload);
      showToast(t.complaintForm.valWaitUpload, 'info');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setAiNotice(null);

    try {
      const secureToken = localStorage.getItem('smartCityToken');
      if (!secureToken) {
        setErrorMessage(t.complaintForm.valAuthRequired);
        showToast(t.complaintForm.valAuthRequired, 'error');
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.post(
        '/complaints/submit',
        {
          department,
          imageUrl: cloudImageUrl,
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          idempotencyKey: activeDraftId || undefined
        },
        { headers: { Authorization: `Bearer ${secureToken}` } }
      );

      const data = response.data;

      if (data.isDuplicate) {
        setErrorMessage(t.complaintForm.submitDuplicate);
        showToast(t.complaintForm.submitDuplicate, 'warning');
      } else if (data.isIrrelevant || data.complaint?.civicRelevance === 'IRRELEVANT' || data.complaint?.status === 'REJECTED') {
        setErrorMessage('Notice: The uploaded photo could not be verified as a civic problem (such as road defects, garbage, water leaks, drainage, or streetlights). Complaint rejected.');
        showToast('Photo rejected: Non-civic media detected.', 'error');
      } else {
        // Clean up draft if this was an edited draft submission
        if (activeDraftId) {
          await draftStorage.deleteDraft(activeDraftId);
          await refreshDraftsCount();
          setActiveDraftId(null);
        }

        if (data.departmentMismatch) {
          const suggestedDeptName = t.departments[data.suggestedDepartment as keyof typeof t.departments] || data.suggestedDepartment;
          setAiNotice(`${t.complaintForm.mismatchNotice} ${suggestedDeptName} ${t.complaintForm.suggestedDeptPrompt}`);
        }

        setSubmittedComplaint(data.complaint || {
          id: data.id || 'INC-' + Math.floor(100000 + Math.random() * 900000),
          department,
          address: location.address
        });

        showToast(t.complaintForm.submitSuccess, 'success');

        // Reset inputs
        setDepartment('');
        setPreviewUrl(null);
        setCloudImageUrl(null);
        setLocation(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Complaint Submission Error:", error);
      if (!navigator.onLine || error.code === 'ERR_NETWORK') {
        setErrorMessage(t.complaintForm.submitNetworkError);
        showToast(t.complaintForm.submitNetworkError, 'error');
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
        showToast(error.response.data.error, 'error');
      } else {
        setErrorMessage(t.complaintForm.submitFailed);
        showToast(t.complaintForm.submitFailed, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewReport = () => {
    setSubmittedComplaint(null);
    setDepartment('');
    setPreviewUrl(null);
    setCloudImageUrl(null);
    setLocation(null);
    setErrorMessage('');
    setAiNotice(null);
  };

  return (
    <div className="w-full max-w-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-xl dark:shadow-2xl transition-colors">
      
      {/* 1. Header with Title & Quick Links */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-neonCyan">
            Civic Reporting
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.complaintForm.heading}
          </h2>
        </div>

        <button 
          type="button"
          onClick={handleLogout} 
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors font-semibold p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title={t.logOut}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t.logOut}</span>
        </button>
      </div>

      {/* Subheader: History, Drafts count, Language */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Link 
            to="/citizen/history" 
            className="text-xs font-bold text-cyan-600 dark:text-neonCyan hover:underline transition-colors flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.complaintForm.viewHistory}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDraftsModalOpen(true)}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer transition-colors"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span>{t.networkStatus?.offlineDraftsTitle || 'Drafts'} ({draftsCount})</span>
          </button>
        </div>

        {/* Compact Language Selector */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
              language === 'mr'
                ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* SUCCESS STATE CONFIRMATION CARD */}
      {submittedComplaint ? (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t.complaintForm.submitSuccess}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Your report has been analyzed by AI and dispatched to the responsible municipal department.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="font-semibold text-slate-500">Incident Reference:</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                #{String(submittedComplaint.id).slice(0, 10).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-500">Assigned Department:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {t.departments[submittedComplaint.department as keyof typeof t.departments] || submittedComplaint.department}
              </span>
            </div>
            {submittedComplaint.address && (
              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <span className="font-semibold">Location:</span> {submittedComplaint.address}
              </div>
            )}
          </div>

          {aiNotice && (
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 text-xs font-medium text-left flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{aiNotice}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              to="/citizen/history"
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t.complaintForm.viewHistory}</span>
            </Link>

            <button
              type="button"
              onClick={handleResetForNewReport}
              className="px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Another Issue</span>
            </button>
          </div>
        </div>
      ) : (
        /* REPORTING WORKFLOW FORM */
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Step 1: Select Department */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1. {t.selectDepartmentLabel} <span className="text-red-500">*</span>
              </label>
              {department && (
                <span className="text-[11px] font-bold text-cyan-600 dark:text-neonCyan flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected
                </span>
              )}
            </div>

            <div className="relative">
              <select
                required
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer pr-10 shadow-xs"
              >
                <option value="" disabled>
                  {t.selectDepartmentPlaceholder}
                </option>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept.code} value={dept.code} className="bg-white dark:bg-slate-900 py-2">
                    {t.departments[dept.key as keyof typeof t.departments]}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 dark:text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Step 2: Photo Capture and Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. {t.complaintForm.photoSectionTitle} <span className="text-red-500">*</span>
              </label>
              {cloudImageUrl && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready
                </span>
              )}
            </div>

            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={cameraInputRef}
              onChange={handleImageSelect}
              className="hidden" 
            />
            
            {previewUrl ? (
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 group shadow-inner">
                <img src={previewUrl} alt="Complaint Evidence Preview" className="w-full h-full object-cover" />
                {isUploadingImg && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-cyan-400 dark:text-neonCyan animate-spin mb-2" />
                    <span className="text-xs font-bold text-white">{t.complaintForm.uploadingPhoto}</span>
                  </div>
                )}
                {!isUploadingImg && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-900/90 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-600 hover:border-cyan-400 transition-all backdrop-blur-md font-semibold cursor-pointer shadow-sm"
                    >
                      {t.complaintForm.changeImage}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="bg-red-950/80 hover:bg-red-900 text-red-200 text-xs px-2.5 py-1.5 rounded-xl border border-red-700/60 transition-all backdrop-blur-md flex items-center gap-1 font-semibold cursor-pointer shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t.complaintForm.removeImage}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2.5">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-4 px-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-neonCyan hover:border-cyan-500 dark:hover:border-neonCyan hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-slate-950/50 group cursor-pointer"
                >
                  <div className="p-2.5 bg-slate-200/70 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-neonCyan" />
                  </div>
                  <span className="text-xs font-bold text-center">{t.complaintForm.photoInstruction}</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => cameraInputRef.current?.click()}
                  title={t.complaintForm.cameraButton}
                  className="w-28 py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-neonCyan hover:border-cyan-500 dark:hover:border-neonCyan hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-slate-950/50 group cursor-pointer"
                >
                  <div className="p-2.5 bg-slate-200/70 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-cyan-600 dark:text-neonCyan" />
                  </div>
                  <span className="text-xs font-bold">{t.complaintForm.cameraButton}</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Location Section with GPS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              3. {t.complaintForm.locationSectionTitle} <span className="text-red-500">*</span>
            </label>
            <LocationSelector 
              onLocationFound={handleLocationFound} 
              currentLocation={location}
              t={t}
            />
          </div>

          {/* Offline Draft Consent */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              id="draftConsent"
              checked={consentOfflineStorage}
              onChange={(e) => setConsentOfflineStorage(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-cyan-600 rounded border-slate-300 dark:border-slate-700 focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="draftConsent" className="cursor-pointer leading-relaxed select-none">
              {t.networkStatus?.draftConsentLabel || "I consent to saving this photo and GPS coordinates in browser offline storage until submitted."}
            </label>
          </div>

          {/* Action Buttons: Submit & Save Offline Draft */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button 
              type="submit" 
              disabled={isSubmitting || isUploadingImg}
              className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-neonCyan dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white dark:text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.complaintForm.submittingButton}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t.complaintForm.submitButton}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSavingDraft}
              onClick={handleSaveOfflineDraft}
              className="px-4 py-3.5 border border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500/50 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Save draft locally in browser IndexedDB"
            >
              {isSavingDraft ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              ) : (
                <Save className="w-4 h-4 text-amber-500" />
              )}
              <span>{t.networkStatus?.saveAsDraft || 'Save Draft'}</span>
            </button>
          </div>

          {/* Error Message Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

        </form>
      )}

      {/* Offline Drafts Modal */}
      <OfflineDraftsManager
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        onEditDraft={handleEditDraft}
        onDraftSubmitted={() => refreshDraftsCount()}
      />
    </div>
  );
}