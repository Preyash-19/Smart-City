import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  MapPin, 
  Camera, 
  BrainCircuit, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  User, 
  Users, 
  Bell, 
  ChevronRight,
  Menu,
  X,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import AdministrativeLocationModal from '../components/AdministrativeLocationModal';
import { useLanguage } from '../context/LanguageContext';
import type { LocationSelection } from '../data/mockLocationData';

export default function IntroductionPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Administrative location modal state for Officer and City Admin flows
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [modalTargetRole, setModalTargetRole] = useState<'OFFICER' | 'ADMIN' | null>(null);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCitizenCardClick = () => {
    // Citizen card navigates directly to Citizen Login without location selector modal
    navigate('/login/citizen');
  };

  const handleOfficerCardClick = () => {
    // Officer card opens location selection modal
    setModalTargetRole('OFFICER');
    setIsLocationModalOpen(true);
  };

  const handleAdminCardClick = () => {
    // City Admin card opens location selection modal
    setModalTargetRole('ADMIN');
    setIsLocationModalOpen(true);
  };

  const handleLocationConfirmed = (location: LocationSelection, role: 'OFFICER' | 'ADMIN') => {
    setIsLocationModalOpen(false);
    if (role === 'OFFICER') {
      navigate('/login/officer', { state: { location, role: 'OFFICER' } });
    } else {
      navigate('/login/city-admin', { state: { location, role: 'ADMIN' } });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center px-4 sm:px-6 py-4 transition-colors">
      
      {/* ── 1. Navigation Header ── */}
      <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl px-4 sm:px-6 py-3.5 mb-8 sm:mb-12 shadow-sm dark:shadow-xl flex justify-between items-center sticky top-4 z-40 transition-colors">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="p-2 bg-cyan-50 dark:bg-slate-800 border border-cyan-200 dark:border-slate-700 rounded-xl text-cyan-600 dark:text-neonCyan">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart<span className="text-cyan-600 dark:text-neonCyan">City</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {t.brandTagline}
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="hover:text-cyan-600 dark:hover:text-neonCyan transition-colors cursor-pointer"
          >
            {t.landing.howItWorksTitle}
          </button>
          <button 
            onClick={() => scrollToSection('categories')} 
            className="hover:text-cyan-600 dark:hover:text-neonCyan transition-colors cursor-pointer"
          >
            {t.landing.categoriesTitle}
          </button>
          <button 
            onClick={() => scrollToSection('roles')} 
            className="hover:text-cyan-600 dark:hover:text-neonCyan transition-colors cursor-pointer"
          >
            {t.landing.rolesTitle}
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'hi'
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'mr'
                  ? 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>

          <ThemeToggle />

          <button
            onClick={() => scrollToSection('roles')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span>{t.landing.getStartedBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="w-full md:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xl flex flex-col gap-3">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-left text-sm font-semibold p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {t.landing.howItWorksTitle}
          </button>
          <button 
            onClick={() => scrollToSection('categories')}
            className="text-left text-sm font-semibold p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {t.landing.categoriesTitle}
          </button>
          <button 
            onClick={() => scrollToSection('roles')}
            className="text-left text-sm font-semibold p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {t.landing.rolesTitle}
          </button>
          <button
            onClick={() => scrollToSection('roles')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm rounded-xl shadow-md"
          >
            <span>{t.landing.getStartedBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 2. Hero Section ── */}
      <section className="w-full py-6 sm:py-12 mb-12 sm:mb-16 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-700 dark:text-neonCyan text-xs font-bold uppercase tracking-wider mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.landing.heroBadge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            {t.landing.heroTitle}
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 leading-snug">
            {t.landing.heroSubtitle}
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mb-8 leading-relaxed">
            {t.landing.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => scrollToSection('roles')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.landing.getStartedBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.landing.exploreProcessBtn}</span>
              <span className="text-cyan-600 dark:text-neonCyan">↓</span>
            </button>
          </div>
        </div>

        {/* Hero Card Preview */}
        <div className="w-full max-w-md lg:max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.landing.liveExampleTitle}
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {t.landing.liveExampleStatus}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-neonCyan">
                {t.departments.ROAD}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Dangerous pothole on 5th Cross Road</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Deep pothole near the bus stop causing traffic slowdown and vehicle hazard during rains.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">5th Cross Road, Ward 12, Metro Area</span>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-600 dark:text-neonCyan" />
                Reported today
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Assigned to Officer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. How It Works Section ── */}
      <section id="how-it-works" className="w-full py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-neonCyan">
            {t.landing.howItWorksBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.landing.howItWorksTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t.landing.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Step 01 */}
          <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-cyan-600 dark:text-neonCyan font-mono bg-cyan-500/10 px-2.5 py-1 rounded-lg">01</span>
                <FileText className="w-5 h-5 text-cyan-600 dark:text-neonCyan" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Report</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tell us about the civic problem in your area.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono bg-blue-500/10 px-2.5 py-1 rounded-lg">02</span>
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Locate</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add the location and, if available, a photo or other evidence.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono bg-purple-500/10 px-2.5 py-1 rounded-lg">03</span>
                <BrainCircuit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Analysis</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The system analyzes the complaint and identifies the relevant department and priority.
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg">04</span>
                <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Department Action</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The responsible officer receives the complaint and works on it.
              </p>
            </div>
          </div>

          {/* Step 05 */}
          <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg">05</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Track</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Citizens can follow the complaint status until it is resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Supported Municipal Categories (5 Departments Only) ── */}
      <section id="categories" className="w-full py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-neonCyan">
            {t.landing.categoriesBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.landing.categoriesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t.landing.categoriesSubtitle}
          </p>
        </div>

        {/* Five Supported Municipal Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {/* Category 1: ROAD */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-cyan-500/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">🛣️</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t.departments.ROAD}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Report potholes, damaged asphalt, and road surface hazards.
            </p>
          </div>

          {/* Category 2: SANITATION */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t.departments.SANITATION}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Report garbage overflow, dump sites, and waste accumulation.
            </p>
          </div>

          {/* Category 3: WATER_SUPPLY */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">💧</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t.departments.WATER_SUPPLY}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Report pipe bursts, clean water leakages, and supply shortages.
            </p>
          </div>

          {/* Category 4: ELECTRICAL */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-yellow-500/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t.departments.ELECTRICAL}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Report broken streetlights, dangling wires, and open junction boxes.
            </p>
          </div>

          {/* Category 5: DRAINAGE */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">🚰</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {t.departments.DRAINAGE}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Report blocked storm drains, sewage overflows, and open gutters.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. AI Analysis Section ── */}
      <section className="w-full py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="p-6 sm:p-10 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 dark:from-slate-900/80 dark:to-slate-900/40 border border-cyan-200/60 dark:border-slate-800 rounded-3xl">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-600 dark:text-neonCyan text-xs font-bold uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Smart analysis behind every complaint
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              When you submit a complaint, Smart City automatically analyzes the information to identify the relevant department and priority.
            </p>
          </div>

          {/* Simple Flow Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm">
              <FileText className="w-6 h-6 text-cyan-600 dark:text-neonCyan mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Your Complaint</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Submitted with photo & GPS</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-500/40 rounded-2xl text-center shadow-sm">
              <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Vision Analysis</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Real pixel defect recognition</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Department + Severity</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Calibrated municipal triage</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl text-center shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Officer Action</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Prompt jurisdictional dispatch</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Three-Role Section (All Three Cards Fully Interactive) ── */}
      <section id="roles" className="w-full py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-neonCyan">
            {t.landing.rolesBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.landing.rolesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t.landing.rolesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ────────────────────────────────────────────────────────── */}
          {/* Role 1: Citizen Card (Direct Click to Citizen Login)      */}
          {/* ────────────────────────────────────────────────────────── */}
          <div 
            id="role-card-citizen"
            tabIndex={0}
            role="button"
            aria-label="Citizen Portal Login"
            onClick={handleCitizenCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCitizenCardClick(); } }}
            className="group relative p-6 bg-white dark:bg-slate-900/60 border border-cyan-200 dark:border-cyan-500/20 rounded-3xl shadow-sm hover:border-cyan-500 hover:shadow-cyan-500/15 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-neonCyan group-hover:scale-110 transition-transform duration-200">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-neonCyan border border-cyan-200 dark:border-cyan-800">
                  {t.landing.roleCards.citizenBadge}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-neonCyan transition-colors">
                {t.landing.roleCards.citizenTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t.landing.roleCards.citizenDesc}
              </p>
            </div>

            <div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-neonCyan shrink-0" />
                <span>{t.landing.roleCards.citizenFeature}</span>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-neonCyan group-hover:translate-x-0.5 transition-transform">
                <span>{t.landing.roleCards.citizenAction}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* Role 2: Officer Card (Opens Location Selector Modal)       */}
          {/* ────────────────────────────────────────────────────────── */}
          <div 
            id="role-card-officer"
            tabIndex={0}
            role="button"
            aria-label="Department Officer Portal Login"
            onClick={handleOfficerCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOfficerCardClick(); } }}
            className="group relative p-6 bg-white dark:bg-slate-900/60 border border-amber-200 dark:border-amber-500/20 rounded-3xl shadow-sm hover:border-amber-500 hover:shadow-amber-500/15 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {t.landing.roleCards.officerBadge}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {t.landing.roleCards.officerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t.landing.roleCards.officerDesc}
              </p>
            </div>

            <div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t.landing.roleCards.officerFeature}</span>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                <span>{t.landing.roleCards.officerAction}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* Role 3: City Admin Card (Opens Location Selector Modal)   */}
          {/* ────────────────────────────────────────────────────────── */}
          <div 
            id="role-card-admin"
            tabIndex={0}
            role="button"
            aria-label="City Administrator Command Portal Login"
            onClick={handleAdminCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdminCardClick(); } }}
            className="group relative p-6 bg-white dark:bg-slate-900/60 border border-purple-200 dark:border-purple-500/20 rounded-3xl shadow-sm hover:border-purple-500 hover:shadow-purple-500/15 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {t.landing.roleCards.adminBadge}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {t.landing.roleCards.adminTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t.landing.roleCards.adminDesc}
              </p>
            </div>

            <div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{t.landing.roleCards.adminFeature}</span>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                <span>{t.landing.roleCards.adminAction}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Simple Transparency / Notifications Section ── */}
      <section className="w-full py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-slate-800 border border-cyan-200 dark:border-slate-700 text-cyan-600 dark:text-neonCyan shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {t.landing.stayInformedTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                {t.landing.stayInformedDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => scrollToSection('roles')}
            className="w-full md:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>{t.landing.viewPortalBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 8. Final Call to Action ── */}
      <section className="w-full py-12 sm:py-16 my-6 text-center bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-indigo-600/10 dark:from-slate-900 dark:to-slate-950 border border-cyan-500/20 dark:border-slate-800 rounded-3xl p-8 sm:p-12">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.landing.finalCtaTitle}
        </h2>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 mt-3 max-w-lg mx-auto">
          {t.landing.finalCtaSubtitle}
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => scrollToSection('roles')}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t.landing.getStartedBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 9. Minimal Footer ── */}
      <footer className="w-full py-8 border-t border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-bold text-slate-700 dark:text-slate-300">
          Smart City Governance Platform
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Report • Track • Resolve
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          © Smart City AI
        </p>
      </footer>

      {/* Administrative Location Modal */}
      <AdministrativeLocationModal
        isOpen={isLocationModalOpen}
        targetRole={modalTargetRole}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirmed}
      />
    </div>
  );
}
