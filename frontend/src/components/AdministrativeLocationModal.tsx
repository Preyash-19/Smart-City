import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ChevronRight, 
  AlertCircle, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MOCK_ADMINISTRATIVE_LOCATIONS, 
  type StateItem, 
  type DistrictItem, 
  type CityItem, 
  type DivisionItem, 
  type LocationSelection 
} from '../data/mockLocationData';

interface AdministrativeLocationModalProps {
  isOpen: boolean;
  targetRole: 'OFFICER' | 'ADMIN' | null;
  initialSelection?: Partial<LocationSelection> | null;
  onClose: () => void;
  onConfirm: (location: LocationSelection, role: 'OFFICER' | 'ADMIN') => void;
}

export default function AdministrativeLocationModal({
  isOpen,
  targetRole,
  initialSelection,
  onClose,
  onConfirm
}: AdministrativeLocationModalProps) {
  const { language, t } = useLanguage();

  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  // Initialize or reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSelection) {
        setSelectedStateId(initialSelection.state || '');
        setSelectedDistrictId(initialSelection.district || '');
        setSelectedCityId(initialSelection.city || '');
        setSelectedDivisionId(initialSelection.division || '');
      } else {
        setSelectedStateId('');
        setSelectedDistrictId('');
        setSelectedCityId('');
        setSelectedDivisionId('');
      }
      setTouched(false);
    }
  }, [isOpen, initialSelection]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Active items in hierarchy
  const currentState: StateItem | undefined = MOCK_ADMINISTRATIVE_LOCATIONS.find(
    (s) => s.id === selectedStateId
  );
  const districtList: DistrictItem[] = currentState ? currentState.districts : [];

  const currentDistrict: DistrictItem | undefined = districtList.find(
    (d) => d.id === selectedDistrictId
  );
  const cityList: CityItem[] = currentDistrict ? currentDistrict.cities : [];

  const currentCity: CityItem | undefined = cityList.find(
    (c) => c.id === selectedCityId
  );
  const divisionList: DivisionItem[] = currentCity ? currentCity.divisions : [];

  const currentDivision: DivisionItem | undefined = divisionList.find(
    (div) => div.id === selectedDivisionId
  );

  // Cascading Selection Handlers
  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedDistrictId('');
    setSelectedCityId('');
    setSelectedDivisionId('');
    setTouched(true);
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    setSelectedCityId('');
    setSelectedDivisionId('');
    setTouched(true);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedDivisionId('');
    setTouched(true);
  };

  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    setTouched(true);
  };

  const handleReset = () => {
    setSelectedStateId('');
    setSelectedDistrictId('');
    setSelectedCityId('');
    setSelectedDivisionId('');
    setTouched(false);
  };

  // Helper to get localized name
  const getLocalizedName = (item?: { nameEn: string; nameHi: string; nameMr: string }) => {
    if (!item) return '';
    if (language === 'hi') return item.nameHi;
    if (language === 'mr') return item.nameMr;
    return item.nameEn;
  };

  // Back action: steps back one level in the hierarchy, or closes if at top
  const handleBackAction = () => {
    if (selectedDivisionId) {
      setSelectedDivisionId('');
    } else if (selectedCityId) {
      setSelectedCityId('');
    } else if (selectedDistrictId) {
      setSelectedDistrictId('');
    } else if (selectedStateId) {
      setSelectedStateId('');
    } else {
      onClose();
    }
  };

  // Check completion
  const isComplete = Boolean(
    selectedStateId && selectedDistrictId && selectedCityId && selectedDivisionId
  );

  // Compute completed steps
  let completedSteps = 0;
  if (selectedStateId) completedSteps++;
  if (selectedDistrictId) completedSteps++;
  if (selectedCityId) completedSteps++;
  if (selectedDivisionId) completedSteps++;

  const handleConfirm = () => {
    if (!isComplete || !targetRole) return;

    const payload: LocationSelection = {
      state: selectedStateId,
      district: selectedDistrictId,
      city: selectedCityId,
      division: selectedDivisionId,
      stateName: getLocalizedName(currentState),
      districtName: getLocalizedName(currentDistrict),
      cityName: getLocalizedName(currentCity),
      divisionName: getLocalizedName(currentDivision),
    };

    onConfirm(payload, targetRole);
  };

  const roleAccent = targetRole === 'ADMIN' ? 'purple' : 'amber';
  const roleName = targetRole === 'ADMIN' ? t.roles.ADMIN : t.roles.OFFICER;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${
              roleAccent === 'purple' 
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  roleAccent === 'purple'
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {roleName}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  {completedSteps}/4 Levels
                </span>
              </div>
              <h2 id="location-modal-title" className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.locationSelector.modalTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t.locationSelector.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Progress / Step tracker banner */}
          <div className="p-3 bg-cyan-500/5 dark:bg-slate-800/40 border border-cyan-500/20 dark:border-slate-700/60 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-neonCyan shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {t.locationSelector.selectionOrderNotice}
              </span>
            </div>
            {completedSteps > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-neonCyan flex items-center gap-1 transition-colors ml-2"
                title="Reset selections"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Cascading Dropdowns Form */}
          <div className="space-y-4">
            {/* 1. STATE DROPDOWN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-mono flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                    1
                  </span>
                  <span>{t.locationSelector.stateLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                {selectedStateId && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <select
                id="location-state-select"
                value={selectedStateId}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-neonCyan rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white transition-all outline-none"
              >
                <option value="">
                  -- {t.locationSelector.statePlaceholder} ({MOCK_ADMINISTRATIVE_LOCATIONS.length} {language === 'hi' ? 'राज्य' : language === 'mr' ? 'राज्ये' : 'States'}) --
                </option>
                {MOCK_ADMINISTRATIVE_LOCATIONS.map((state) => (
                  <option key={state.id} value={state.id}>
                    {getLocalizedName(state)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. DISTRICT DROPDOWN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  !selectedStateId ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center font-bold ${
                    !selectedStateId 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    2
                  </span>
                  <span>{t.locationSelector.districtLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                {selectedDistrictId && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <select
                id="location-district-select"
                value={selectedDistrictId}
                disabled={!selectedStateId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-900/50 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 focus:border-cyan-500 dark:focus:border-neonCyan rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white transition-all outline-none"
              >
                <option value="">
                  {!selectedStateId 
                    ? `(${t.locationSelector.statePlaceholder} first)` 
                    : `-- ${t.locationSelector.districtPlaceholder} (${districtList.length} ${language === 'hi' ? 'ज़िले' : language === 'mr' ? 'जिल्हे' : 'Districts'}) --`}
                </option>
                {districtList.map((district) => (
                  <option key={district.id} value={district.id}>
                    {getLocalizedName(district)}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. CITY / MUNICIPALITY DROPDOWN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  !selectedDistrictId ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center font-bold ${
                    !selectedDistrictId 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    3
                  </span>
                  <span>{t.locationSelector.cityLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                {selectedCityId && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <select
                id="location-city-select"
                value={selectedCityId}
                disabled={!selectedDistrictId}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-900/50 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 focus:border-cyan-500 dark:focus:border-neonCyan rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white transition-all outline-none"
              >
                <option value="">
                  {!selectedDistrictId 
                    ? `(${t.locationSelector.districtPlaceholder} first)` 
                    : `-- ${t.locationSelector.cityPlaceholder} (${cityList.length} ${language === 'hi' ? 'शहर / निगम' : language === 'mr' ? 'शहरे / मनपा' : 'Cities / Corporations'}) --`}
                </option>
                {cityList.map((city) => (
                  <option key={city.id} value={city.id}>
                    {getLocalizedName(city)}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. DIVISION / WARD DROPDOWN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  !selectedCityId ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center font-bold ${
                    !selectedCityId 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    4
                  </span>
                  <span>{t.locationSelector.divisionLabel}</span>
                  <span className="text-red-500">*</span>
                </label>
                {selectedDivisionId && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <select
                id="location-division-select"
                value={selectedDivisionId}
                disabled={!selectedCityId}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-900/50 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 focus:border-cyan-500 dark:focus:border-neonCyan rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white transition-all outline-none"
              >
                <option value="">
                  {!selectedCityId 
                    ? `(${t.locationSelector.cityPlaceholder} first)` 
                    : `-- ${t.locationSelector.divisionPlaceholder} (${divisionList.length} ${language === 'hi' ? 'प्रभाग / क्षेत्र' : language === 'mr' ? 'विभाग / प्रभाग' : 'Divisions / Wards'}) --`}
                </option>
                {divisionList.map((div) => (
                  <option key={div.id} value={div.id}>
                    {getLocalizedName(div)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selection Summary Breadcrumb Card */}
          {completedSteps > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-600 dark:text-neonCyan" />
                <span>Selected Administrative Path:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className={selectedStateId ? 'text-cyan-600 dark:text-neonCyan font-bold' : 'text-slate-400'}>
                  {getLocalizedName(currentState) || 'State'}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className={selectedDistrictId ? 'text-cyan-600 dark:text-neonCyan font-bold' : 'text-slate-400'}>
                  {getLocalizedName(currentDistrict) || 'District'}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className={selectedCityId ? 'text-cyan-600 dark:text-neonCyan font-bold' : 'text-slate-400'}>
                  {getLocalizedName(currentCity) || 'City'}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className={selectedDivisionId ? 'text-cyan-600 dark:text-neonCyan font-bold' : 'text-slate-400'}>
                  {getLocalizedName(currentDivision) || 'Division'}
                </span>
              </div>
            </div>
          )}

          {/* Validation Notice */}
          {!isComplete && touched && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.locationSelector.missingSelectionWarning}</span>
            </div>
          )}

          {isComplete && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{t.locationSelector.allSelectedBadge}</span>
            </div>
          )}

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            {t.locationSelector.demoDataNotice}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="location-modal-back-btn"
              onClick={handleBackAction}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.locationSelector.backBtn}
            </button>
            <button
              type="button"
              id="location-modal-cancel-btn"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.locationSelector.cancelBtn}
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              disabled={!isComplete}
              onClick={handleConfirm}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                isComplete
                  ? roleAccent === 'purple'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>{t.locationSelector.continueBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
