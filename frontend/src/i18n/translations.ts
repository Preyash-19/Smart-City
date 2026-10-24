export type Language = 'en' | 'hi' | 'mr';

export interface TranslationDictionary {
  // Common & Branding
  brandName: string;
  brandTagline: string;
  online: string;
  offline: string;
  logOut: string;
  languageLabel: string;
  languages: {
    en: string;
    hi: string;
    mr: string;
  };
  backToDashboard: string;
  loading: string;
  refresh: string;
  close: string;
  save: string;
  cancel: string;

  // Roles
  roles: {
    CITIZEN: string;
    OFFICER: string;
    ADMIN: string;
    CONTRACTOR: string;
  };

  // Departments
  selectDepartmentLabel: string;
  selectDepartmentPlaceholder: string;
  departments: {
    ALL: string;
    ROAD: string;
    SANITATION: string;
    WATER_SUPPLY: string;
    ELECTRICAL: string;
    DRAINAGE: string;
    TRAFFIC: string;
    OTHER: string;
    GENERAL: string;
  };

  // Statuses
  statuses: {
    ALL: string;
    SUBMITTED: string;
    ROUTED: string;
    IN_PROGRESS: string;
    RESOLVED: string;
    COMPLETED: string;
    CLOSED: string;
    REJECTED: string;
    DUPLICATE: string;
  };

  // Severities
  severities: {
    LOW: string;
    MEDIUM: string;
    HIGH: string;
    CRITICAL: string;
  };

  // Verification
  verification: {
    PENDING: string;
    VERIFIED: string;
    NEEDS_REVIEW: string;
    REJECTED: string;
    HUMAN_VERIFIED: string;
    AI_ASSESSED: string;
  };

  // Auth & Login
  auth: {
    portalTitle: string;
    portalSubtitle: string;
    signInTab: string;
    registerTab: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    roleLabel: string;
    signInButton: string;
    registerButton: string;
    noAccountPrompt: string;
    haveAccountPrompt: string;
    loggingIn: string;
    creatingAccount: string;
    authSuccess: string;
    regSuccess: string;
    authError: string;
  };

  // Citizen Dashboard
  citizenDashboard: {
    title: string;
    subtitle: string;
    reportIssueBtn: string;
    viewHistoryBtn: string;
    statsTotal: string;
    statsActive: string;
    statsResolved: string;
    statsRate: string;
    quickCategoriesTitle: string;
    recentIncidentsTitle: string;
    noIncidentsFound: string;
    reportFirstPrompt: string;
    incidentId: string;
    reportedOn: string;
    department: string;
    status: string;
  };

  // Complaint Reporting Form
  complaintForm: {
    pageTitle: string;
    heading: string;
    viewHistory: string;
    photoSectionTitle: string;
    photoInstruction: string;
    cameraButton: string;
    changeImage: string;
    removeImage: string;
    uploadingPhoto: string;
    imageSuccess: string;
    imageError: string;
    imageSizeError: string;
    imageTypeError: string;
    cloudinaryError: string;
    locationSectionTitle: string;
    useLocationBtn: string;
    fetchingLocation: string;
    gpsLocked: string;
    coordinatesLabel: string;
    detectedLocationLabel: string;
    geoNotSupported: string;
    locationDenied: string;
    locationUnavailable: string;
    locationTimeout: string;
    locationGenericError: string;
    submitButton: string;
    submittingButton: string;
    valDepartmentRequired: string;
    valLocationRequired: string;
    valWaitUpload: string;
    valOffline: string;
    valAuthRequired: string;
    submitSuccess: string;
    submitDuplicate: string;
    submitNetworkError: string;
    submitFailed: string;
    irrelevantNotice: string;
    mismatchNotice: string;
    suggestedDeptPrompt: string;
  };

  // Citizen History & Feedback
  citizenHistory: {
    title: string;
    subtitle: string;
    backBtn: string;
    allFilter: string;
    emptyTitle: string;
    emptySubtitle: string;
    reportNewBtn: string;
    aiDiagnosisTitle: string;
    severityLabel: string;
    confidenceLabel: string;
    evidenceScoreLabel: string;
    verificationLabel: string;
    rateResolutionTitle: string;
    feedbackSubmitted: string;
    starRatingPrompt: string;
    commentsPlaceholder: string;
    submitFeedbackBtn: string;
    submittingFeedback: string;
    officerRemarksTitle: string;
  };

  // Officer Dashboard
  officerDashboard: {
    title: string;
    subtitle: string;
    departmentQueue: string;
    assignedStats: string;
    pendingStats: string;
    inProgressStats: string;
    resolvedStats: string;
    filterDepartment: string;
    filterStatus: string;
    noComplaintsAssigned: string;
    cardReporter: string;
    cardLocation: string;
    cardCoordinates: string;
    cardEvidencePhoto: string;
    aiEvidenceCardTitle: string;
    aiPredictedIssue: string;
    aiConfidence: string;
    aiSeverityScore: string;
    aiReasons: string;
    updateStatusModalTitle: string;
    selectNewStatus: string;
    officerRemarksLabel: string;
    officerRemarksPlaceholder: string;
    humanVerificationCheckbox: string;
    severityOverrideLabel: string;
    applyUpdateBtn: string;
    updatingStatus: string;
    updateSuccess: string;
    highStats: string;
    changeSeverityLabel: string;
  };

  // Admin Dashboard
  adminDashboard: {
    title: string;
    subtitle: string;
    totalIncidents: string;
    criticalAlerts: string;
    highAlerts: string;
    resolvedIncidents: string;
    resolutionRate: string;
    departmentBreakdownTitle: string;
    cityReportsTitle: string;
    toggleHeatmap: string;
    hideHeatmap: string;
    filterReportsLabel: string;
    decommissionBtn: string;
    decommissionSuccess: string;
    confirmDeletePrompt: string;
    noReportsFound: string;
    severityLabel: string;
    changeSeverityLabel: string;
    severityUpdated: string;
    severityUpdateError: string;
    aiAssessedSeverity: string;
    assignedSeverity: string;
    cannotAssignRejected: string;
    verificationRequiredForSeverity: string;
    severityFilterTitle: string;
    allSeverities: string;
    resetSeverityFilter: string;
  };

  // Heatmap
  heatmap: {
    title: string;
    subtitle: string;
    legendTitle: string;
    highDensity: string;
    moderateDensity: string;
    lowDensity: string;
    filterLabel: string;
  };

  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    empty: string;
    newBadge: string;
  };

  // Department Roles
  departmentRoles: {
    HEAD: string;
    OFFICER: string;
    STAFF: string;
  };

  // Department User Management
  deptUserManagement: {
    tabTelemetry: string;
    tabUsers: string;
    tabAuditLogs: string;
    createUserBtn: string;
    searchPlaceholder: string;
    filterDept: string;
    filterRole: string;
    filterStatus: string;
    thName: string;
    thEmail: string;
    thDept: string;
    thRole: string;
    thAccountStatus: string;
    thInvitationStatus: string;
    thCreated: string;
    thLastLogin: string;
    thActions: string;
    statusActive: string;
    statusInactive: string;
    statusInvited: string;
    invitationPending: string;
    invitationExpired: string;
    neverLoggedIn: string;
    resendInvitation: string;
    resetAccess: string;
    editUser: string;
    deactivateUser: string;
    activateUser: string;
    confirmDeactivate: string;
    createModalTitle: string;
    editModalTitle: string;
    fullNameLabel: string;
    emailLabel: string;
    deptLabel: string;
    roleLabel: string;
    statusLabel: string;
    tempPasswordLabel: string;
    tempPasswordPlaceholder: string;
    cancelBtn: string;
    saveBtn: string;
    creating: string;
    reassignDeptTitle: string;
    reassignDeptBtn: string;
    selectNewDept: string;
    reassignReasonLabel: string;
    reassignReasonPlaceholder: string;
    assignPersonnelTitle: string;
    assignPersonnelBtn: string;
    selectOfficerPlaceholder: string;
    unassigned: string;
    auditLogsTitle: string;
    noUsersFound: string;
    noLogsFound: string;
    smtpNotice: string;
    copyLink: string;
    linkCopied: string;
  };

  // Account Activation
  accountActivation: {
    pageTitle: string;
    subtitle: string;
    welcomeMessage: string;
    departmentLabel: string;
    roleLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    activateButton: string;
    activating: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    invalidOrExpiredToken: string;
    successMessage: string;
    goToDashboard: string;
  };

  // Landing Page & Role Cards
  landing: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    getStartedBtn: string;
    exploreProcessBtn: string;
    liveExampleTitle: string;
    liveExampleStatus: string;
    howItWorksBadge: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    categoriesBadge: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
    rolesBadge: string;
    rolesTitle: string;
    rolesSubtitle: string;
    stayInformedTitle: string;
    stayInformedDesc: string;
    viewPortalBtn: string;
    finalCtaTitle: string;
    finalCtaSubtitle: string;
    roleCards: {
      citizenBadge: string;
      citizenTitle: string;
      citizenDesc: string;
      citizenFeature: string;
      citizenAction: string;
      officerBadge: string;
      officerTitle: string;
      officerDesc: string;
      officerFeature: string;
      officerAction: string;
      adminBadge: string;
      adminTitle: string;
      adminDesc: string;
      adminFeature: string;
      adminAction: string;
    };
  };

  // Administrative Location Selector Modal
  locationSelector: {
    modalTitle: string;
    modalSubtitle: string;
    selectionOrderNotice: string;
    stateLabel: string;
    statePlaceholder: string;
    districtLabel: string;
    districtPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    divisionLabel: string;
    divisionPlaceholder: string;
    continueBtn: string;
    cancelBtn: string;
    backBtn: string;
    stepIndicator: string;
    allSelectedBadge: string;
    missingSelectionWarning: string;
    demoDataNotice: string;
  };

  // Role-Specific Login Pages
  roleLogin: {
    citizenHeading: string;
    citizenSubtitle: string;
    officerHeading: string;
    officerSubtitle: string;
    adminHeading: string;
    adminSubtitle: string;
    jurisdictionHeader: string;
    jurisdictionDesc: string;
    changeLocationBtn: string;
    missingLocationAlert: string;
    selectLocationBtn: string;
    unauthorizedOfficer: string;
    unauthorizedAdmin: string;
    unauthorizedCitizen: string;
    officerRoleRequired: string;
    adminRoleRequired: string;
  };

  // Network & PWA Statuses
  networkStatus: {
    online: string;
    offline: string;
    syncingDrafts: string;
    draftSaved: string;
    submissionFailed: string;
    submissionSuccess: string;
    offlineNotice: string;
    offlineFallbackPrompt: string;
    installApp: string;
    installAppPrompt: string;
    appInstalled: string;
    offlineDraftsTitle: string;
    saveAsDraft: string;
    draftConsentLabel: string;
    draftConsentRequired: string;
    submitDraft: string;
    deleteDraft: string;
    editDraft: string;
    noDrafts: string;
    draftNotSynced: string;
    aiOfflineNote: string;
    confirmDeleteDraft: string;
    draftSubmitSuccess: string;
    draftSubmitError: string;
    openDraftsBtn: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    brandName: "Smart City AI",
    brandTagline: "Civic Governance Platform",
    online: "Online",
    offline: "Offline",
    logOut: "Log Out",
    languageLabel: "Language",
    languages: {
      en: "English",
      hi: "हिन्दी",
      mr: "मराठी",
    },
    backToDashboard: "← Back to Dashboard",
    loading: "Loading telemetry data...",
    refresh: "Refresh",
    close: "Close",
    save: "Save",
    cancel: "Cancel",

    roles: {
      CITIZEN: "Citizen",
      OFFICER: "Department Officer",
      ADMIN: "Administrator",
      CONTRACTOR: "Field Contractor",
    },

    selectDepartmentLabel: "Select Department",
    selectDepartmentPlaceholder: "-- Select a Department --",
    departments: {
      ALL: "All Departments",
      ROAD: "Roads & Potholes",
      SANITATION: "Sanitation & Garbage",
      WATER_SUPPLY: "Water Supply",
      ELECTRICAL: "Electricity & Streetlights",
      DRAINAGE: "Drainage & Sewage",
      TRAFFIC: "Traffic & Transport",
      OTHER: "Other",
      GENERAL: "General Civic",
    },

    statuses: {
      ALL: "All Statuses",
      SUBMITTED: "Submitted",
      ROUTED: "Routed to Department",
      IN_PROGRESS: "In Progress",
      RESOLVED: "Resolved",
      COMPLETED: "Completed",
      CLOSED: "Closed",
      REJECTED: "Rejected",
      DUPLICATE: "Duplicate",
    },

    severities: {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical",
    },

    verification: {
      PENDING: "Pending Review",
      VERIFIED: "Officer Verified",
      NEEDS_REVIEW: "Needs Review",
      REJECTED: "Invalid / Rejected",
      HUMAN_VERIFIED: "Verified by Officer",
      AI_ASSESSED: "AI Assessed",
    },

    auth: {
      portalTitle: "Smart City Portal",
      portalSubtitle: "Secure Civic AI Telemetry & Public Governance System",
      signInTab: "Sign In",
      registerTab: "Register",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "e.g. John Doe",
      emailLabel: "Email Address",
      emailPlaceholder: "citizen@city.gov",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your secure password",
      roleLabel: "Account Role",
      signInButton: "Authenticate to Portal",
      registerButton: "Create Account",
      noAccountPrompt: "Don't have an account?",
      haveAccountPrompt: "Already registered?",
      loggingIn: "Authenticating...",
      creatingAccount: "Creating Account...",
      authSuccess: "Authentication successful!",
      regSuccess: "User registered successfully!",
      authError: "Authentication failed. Check your credentials.",
    },

    citizenDashboard: {
      title: "Citizen Governance Portal",
      subtitle: "Report local infrastructure incidents and track municipal resolution in real time.",
      reportIssueBtn: "+ Report an Issue",
      viewHistoryBtn: "View My Reports →",
      statsTotal: "Total Reports",
      statsActive: "Active Incidents",
      statsResolved: "Resolved Incidents",
      statsRate: "Resolution Rate",
      quickCategoriesTitle: "Municipal Services",
      recentIncidentsTitle: "My Recent Submissions",
      noIncidentsFound: "No infrastructure reports found.",
      reportFirstPrompt: "Notice a pothole, leak, or street hazard? Submit your first report above.",
      incidentId: "Incident ID",
      reportedOn: "Reported On",
      department: "Department",
      status: "Status",
    },

    complaintForm: {
      pageTitle: "Smart City Portal — Report an Issue",
      heading: "Report an Issue",
      viewHistory: "View My Previous Reports →",
      photoSectionTitle: "Incident Photograph (Required Evidence)",
      photoInstruction: "Take a Photo or Upload Image",
      cameraButton: "Capture Photo",
      changeImage: "Change Image",
      removeImage: "Remove Photo",
      uploadingPhoto: "Uploading Photo to Cloud...",
      imageSuccess: "Photograph uploaded successfully!",
      imageError: "Image upload failed.",
      imageSizeError: "File size exceeds 10MB limit.",
      imageTypeError: "Only image files (JPG, PNG, WebP) are allowed.",
      cloudinaryError: "Unable to connect to Cloudinary storage.",
      locationSectionTitle: "Report Location",
      useLocationBtn: "Use My Current Location",
      fetchingLocation: "Fetching GPS location...",
      gpsLocked: "GPS Locked",
      coordinatesLabel: "GPS Coordinates:",
      detectedLocationLabel: "Detected Location:",
      geoNotSupported: "Geolocation is not supported by your browser.",
      locationDenied: "Location access denied. Please enable GPS permissions.",
      locationUnavailable: "Location information is currently unavailable.",
      locationTimeout: "Location request timed out. Please try again.",
      locationGenericError: "Unable to retrieve your location coordinates.",
      submitButton: "Submit to Smart City AI",
      submittingButton: "AI Vision is Analyzing...",
      valDepartmentRequired: "Please select a department.",
      valLocationRequired: "Please provide your GPS location coordinates first.",
      valWaitUpload: "Please wait for the image upload to complete.",
      valOffline: "You are offline. An internet connection is required to submit complaints.",
      valAuthRequired: "Authentication expired. Please log in again.",
      submitSuccess: "Incident successfully logged and routed to the proper department.",
      submitDuplicate: "Duplicate Detected: Our AI confirms this infrastructure issue has already been reported and is currently active.",
      submitNetworkError: "Network unavailable. Please check your internet connection.",
      submitFailed: "Failed to submit. Check if backend and AI services are running.",
      irrelevantNotice: "Notice: The uploaded photo does not appear to show a civic issue. Please upload a suitable photograph of the physical problem.",
      mismatchNotice: "AI Notice: The visual evidence suggests this issue may belong to",
      suggestedDeptPrompt: "rather than the selected department.",
    },

    citizenHistory: {
      title: "My Incident Reports",
      subtitle: "Track live status updates, AI severity diagnostics, and submit resolution feedback.",
      backBtn: "← Back to Dashboard",
      allFilter: "All Incidents",
      emptyTitle: "No complaints found",
      emptySubtitle: "You have not submitted any infrastructure complaints yet.",
      reportNewBtn: "Report an Issue",
      aiDiagnosisTitle: "AI Vision Telemetry",
      severityLabel: "Severity:",
      confidenceLabel: "Confidence:",
      evidenceScoreLabel: "Visual Evidence Score:",
      verificationLabel: "Verification Status:",
      rateResolutionTitle: "Rate Municipal Resolution",
      feedbackSubmitted: "Feedback submitted successfully. Thank you!",
      starRatingPrompt: "Select a rating (1 to 5 stars):",
      commentsPlaceholder: "Share details on the quality of work (optional)...",
      submitFeedbackBtn: "Submit Feedback",
      submittingFeedback: "Submitting...",
      officerRemarksTitle: "Officer Verification Remarks:",
    },

    officerDashboard: {
      title: "Department Operations Mainframe",
      subtitle: "Review assigned infrastructure reports, inspect AI visual evidence, and update field resolution status.",
      departmentQueue: "Department Queue",
      assignedStats: "Total Assigned",
      pendingStats: "Pending Review",
      inProgressStats: "In Progress",
      resolvedStats: "Resolved",
      filterDepartment: "Filter Department",
      filterStatus: "Filter Status",
      noComplaintsAssigned: "No complaints currently assigned to this queue.",
      cardReporter: "Citizen Reporter:",
      cardLocation: "Location Address:",
      cardCoordinates: "GPS Coordinates:",
      cardEvidencePhoto: "Photographic Visual Evidence:",
      aiEvidenceCardTitle: "AI Visual Evidence & Diagnostics",
      aiPredictedIssue: "Predicted Issue:",
      aiConfidence: "AI Confidence:",
      aiSeverityScore: "Severity Score:",
      aiReasons: "Evidence Rationale:",
      updateStatusModalTitle: "Update Incident Status & Verification",
      selectNewStatus: "Select Status:",
      officerRemarksLabel: "Official Remarks / Resolution Notes:",
      officerRemarksPlaceholder: "Provide field crew inspection details or resolution remarks...",
      humanVerificationCheckbox: "Mark AI diagnosis as Human Verified by Officer",
      severityOverrideLabel: "Severity Override (Optional):",
      applyUpdateBtn: "Apply Status Update",
      updatingStatus: "Saving...",
      updateSuccess: "Incident status and verification updated successfully!",
      highStats: "High Severity",
      changeSeverityLabel: "Set Severity:",
    },

    adminDashboard: {
      title: "City-Wide Administrative Console",
      subtitle: "Comprehensive civic operations oversight, severity distribution analytics, and department telemetry.",
      totalIncidents: "Total Reports",
      criticalAlerts: "Critical Severity Alerts",
      highAlerts: "High Priority Incidents",
      resolvedIncidents: "Resolved Incidents",
      resolutionRate: "City-Wide Resolution Rate",
      departmentBreakdownTitle: "Department Breakdown",
      cityReportsTitle: "All Municipal Reports",
      toggleHeatmap: "Show Heatmap Visualizer",
      hideHeatmap: "Hide Heatmap Visualizer",
      filterReportsLabel: "Filter City Reports:",
      decommissionBtn: "Decommission Record",
      decommissionSuccess: "Signal decommissioned and purged from database.",
      confirmDeletePrompt: "Are you sure you want to permanently delete this complaint?",
      noReportsFound: "No reports match the selected department or status filters.",
      severityLabel: "Severity",
      changeSeverityLabel: "Change Severity:",
      severityUpdated: "Severity updated successfully!",
      severityUpdateError: "Failed to update complaint severity.",
      aiAssessedSeverity: "AI Assessed",
      assignedSeverity: "Admin Assigned",
      cannotAssignRejected: "Cannot assign severity to rejected non-civic upload.",
      verificationRequiredForSeverity: "Verification required before adjusting severity.",
      severityFilterTitle: "Severity Filter",
      allSeverities: "All Severities",
      resetSeverityFilter: "Reset Filter",
    },

    heatmap: {
      title: "Geographic Incident Heatmap",
      subtitle: "Live spatial cluster visualization of reported civic infrastructure issues across the municipal area.",
      legendTitle: "Department Legend",
      highDensity: "High Density Area",
      moderateDensity: "Moderate Density",
      lowDensity: "Low Density",
      filterLabel: "Filter Layer:",
    },

    notifications: {
      title: "Notifications",
      markAllRead: "Mark all as read",
      empty: "No new notifications",
      newBadge: "New",
    },

    departmentRoles: {
      HEAD: "Department Head",
      OFFICER: "Department Officer",
      STAFF: "Department Staff",
    },

    deptUserManagement: {
      tabTelemetry: "City Complaints Telemetry",
      tabUsers: "Department User Management",
      tabAuditLogs: "Administrative Audit Trail",
      createUserBtn: "Create Department User",
      searchPlaceholder: "Search by name or email...",
      filterDept: "All Departments",
      filterRole: "All Roles",
      filterStatus: "All Statuses",
      thName: "Full Name",
      thEmail: "Official Email",
      thDept: "Department",
      thRole: "Role",
      thAccountStatus: "Account Status",
      thInvitationStatus: "Activation Status",
      thCreated: "Created Date",
      thLastLogin: "Last Login",
      thActions: "Actions",
      statusActive: "Active",
      statusInactive: "Deactivated",
      statusInvited: "Invited",
      invitationPending: "Invitation Pending",
      invitationExpired: "Expired",
      neverLoggedIn: "Never",
      resendInvitation: "Resend Invitation",
      resetAccess: "Reset Access",
      editUser: "Edit User",
      deactivateUser: "Deactivate",
      activateUser: "Activate",
      confirmDeactivate: "Are you sure you want to deactivate this account? The user will not be able to log in.",
      createModalTitle: "Create Department User Account",
      editModalTitle: "Edit Department User",
      fullNameLabel: "Full Name",
      emailLabel: "Official Email Address",
      deptLabel: "Assigned Department",
      roleLabel: "Department Role",
      statusLabel: "Account Status",
      tempPasswordLabel: "Temporary Password (Optional)",
      tempPasswordPlaceholder: "Leave blank to require activation link",
      cancelBtn: "Cancel",
      saveBtn: "Save User",
      creating: "Creating...",
      reassignDeptTitle: "Reassign Complaint Department",
      reassignDeptBtn: "Reassign Dept",
      selectNewDept: "Select New Department",
      reassignReasonLabel: "Reason for Reassignment",
      reassignReasonPlaceholder: "Explain reason for department override...",
      assignPersonnelTitle: "Assign Complaint to Personnel",
      assignPersonnelBtn: "Assign Officer",
      selectOfficerPlaceholder: "Select Department Officer / Staff...",
      unassigned: "Unassigned",
      auditLogsTitle: "Administrative Audit Trail",
      noUsersFound: "No department users match your search criteria.",
      noLogsFound: "No audit records found.",
      smtpNotice: "Note: SMTP email delivery not configured. You can copy the activation link below manually:",
      copyLink: "Copy Link",
      linkCopied: "Copied!",
    },

    accountActivation: {
      pageTitle: "Smart City AI — Account Activation",
      subtitle: "Set up your official department password",
      welcomeMessage: "Welcome to the municipal administration portal. Please establish your secure credentials below.",
      departmentLabel: "Assigned Department",
      roleLabel: "Department Role",
      passwordLabel: "New Password",
      passwordPlaceholder: "At least 8 characters...",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Re-enter new password...",
      activateButton: "Activate Account & Login",
      activating: "Activating...",
      passwordsDoNotMatch: "Passwords do not match.",
      passwordTooShort: "Password must be at least 8 characters long.",
      invalidOrExpiredToken: "This activation link is invalid, expired, or has already been used.",
      successMessage: "Account activated successfully! Redirecting to department dashboard...",
      goToDashboard: "Proceed to Dashboard",
    },

    landing: {
      heroBadge: "Civic Governance Platform",
      heroTitle: "Smart City",
      heroSubtitle: "Report civic problems. Track progress. Build a better city.",
      heroDescription: "Smart City makes it simple for citizens to report local problems, while helping departments and city administrators manage and resolve them efficiently.",
      getStartedBtn: "Get Started",
      exploreProcessBtn: "Explore How It Works",
      liveExampleTitle: "Live Complaint Example",
      liveExampleStatus: "IN PROGRESS",
      howItWorksBadge: "Simple 5-Step Process",
      howItWorksTitle: "How It Works",
      howItWorksSubtitle: "From reporting an issue to city verification, every step is clear and transparent.",
      categoriesBadge: "Supported Municipal Categories",
      categoriesTitle: "What can you report?",
      categoriesSubtitle: "Submit issues directly to any of the five major civic departments.",
      rolesBadge: "Platform Access",
      rolesTitle: "One platform. Three roles.",
      rolesSubtitle: "Tailored workspaces for citizens, department officers, and city leaders.",
      stayInformedTitle: "Stay informed",
      stayInformedDesc: "Once you report a problem, you can follow its progress from submission to resolution. Receive updates when your complaint status changes.",
      viewPortalBtn: "View Portal",
      finalCtaTitle: "Have a civic problem to report?",
      finalCtaSubtitle: "Help make your city cleaner, safer and better connected.",
      roleCards: {
        citizenBadge: "For Residents",
        citizenTitle: "Citizen",
        citizenDesc: "Report civic problems and track their progress in real time.",
        citizenFeature: "Direct access with GPS & photo submission",
        citizenAction: "Access Citizen Portal →",
        officerBadge: "For Departments",
        officerTitle: "Officer",
        officerDesc: "Manage complaints assigned to your department and update their status.",
        officerFeature: "Focused department workload queue",
        officerAction: "Select Jurisdiction & Login →",
        adminBadge: "For City Leadership",
        adminTitle: "City Admin",
        adminDesc: "Monitor city-wide complaints, manage officers, and analyze concentration.",
        adminFeature: "City-wide analytics & heatmap",
        adminAction: "Select Jurisdiction & Login →",
      },
    },

    locationSelector: {
      modalTitle: "Select Administrative Location",
      modalSubtitle: "Choose your jurisdiction to access official workspace",
      selectionOrderNotice: "Select administrative location in order: State → District → City → Division",
      stateLabel: "State",
      statePlaceholder: "Select State",
      districtLabel: "District",
      districtPlaceholder: "Select District",
      cityLabel: "City / Municipality",
      cityPlaceholder: "Select City / Municipality",
      divisionLabel: "Division / Ward",
      divisionPlaceholder: "Select Division / Ward",
      continueBtn: "Continue to Login",
      cancelBtn: "Cancel",
      backBtn: "Back",
      stepIndicator: "Step {step} of 4",
      allSelectedBadge: "All 4 administrative levels selected ✓",
      missingSelectionWarning: "Please complete all selections (State, District, City, and Division) to continue.",
      demoDataNotice: "Demo administrative location directory. Context will be carried to official login.",
    },

    roleLogin: {
      citizenHeading: "Citizen Login",
      citizenSubtitle: "Access your citizen complaints and municipal services",
      officerHeading: "Officer Login",
      officerSubtitle: "Department Officer workspace login",
      adminHeading: "City Admin Login",
      adminSubtitle: "City Administrator command center login",
      jurisdictionHeader: "Administrative Location Context",
      jurisdictionDesc: "Assigned official jurisdiction for this login session",
      changeLocationBtn: "Change Location",
      missingLocationAlert: "Missing administrative location context. Please select your official jurisdiction first.",
      selectLocationBtn: "Select Location Now",
      unauthorizedOfficer: "Unauthorized access: This portal is strictly for Department Officers. Your account is not authorized as an Officer.",
      unauthorizedAdmin: "Unauthorized access: This portal requires City Administrator permissions. Your account does not have Admin access.",
      unauthorizedCitizen: "Unauthorized access: Please use your citizen account credentials.",
      officerRoleRequired: "Department Officer privileges required.",
      adminRoleRequired: "City Administrator privileges required.",
    },

    networkStatus: {
      online: "Online",
      offline: "Offline",
      syncingDrafts: "Syncing drafts...",
      draftSaved: "Draft saved offline",
      submissionFailed: "Submission failed",
      submissionSuccess: "Submission successful",
      offlineNotice: "You are currently offline. Live AI vision and municipal routing require connectivity. You can save your complaint as an offline draft.",
      offlineFallbackPrompt: "Network unavailable. Would you like to save this complaint as an offline draft to submit later?",
      installApp: "Install App",
      installAppPrompt: "Install Smart City AI for fast offline access and quick complaint filing.",
      appInstalled: "App Installed",
      offlineDraftsTitle: "Offline Complaint Drafts",
      saveAsDraft: "Save as Offline Draft",
      draftConsentLabel: "I consent to saving this photo and GPS coordinates in browser offline storage until submitted.",
      draftConsentRequired: "Consent is required to store photo and location data locally.",
      submitDraft: "Submit to Server",
      deleteDraft: "Delete Draft",
      editDraft: "Edit / Resume",
      noDrafts: "No offline drafts saved.",
      draftNotSynced: "Offline Draft — Not Submitted to Server",
      aiOfflineNote: "AI image analysis and routing will be performed when reconnected and submitted.",
      confirmDeleteDraft: "Are you sure you want to permanently delete this offline draft?",
      draftSubmitSuccess: "Offline draft successfully submitted and routed to municipal department!",
      draftSubmitError: "Failed to submit draft. Please check your connection and try again.",
      openDraftsBtn: "View Offline Drafts",
    },
  },

  hi: {
    brandName: "स्मार्ट सिटी एआई",
    brandTagline: "नागरिक शासन प्रणाली",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    logOut: "लॉग आउट",
    languageLabel: "भाषा",
    languages: {
      en: "English",
      hi: "हिन्दी",
      mr: "मराठी",
    },
    backToDashboard: "← डैशबोर्ड पर वापस जाएं",
    loading: "टेलीमेट्री डेटा लोड हो रहा है...",
    refresh: "ताज़ा करें",
    close: "बंद करें",
    save: "सहेजें",
    cancel: "रद्द करें",

    roles: {
      CITIZEN: "नागरिक",
      OFFICER: "विभागीय अधिकारी",
      ADMIN: "प्रशासक",
      CONTRACTOR: "फील्ड ठेकेदार",
    },

    selectDepartmentLabel: "विभाग चुनें",
    selectDepartmentPlaceholder: "-- एक विभाग चुनें --",
    departments: {
      ALL: "सभी विभाग",
      ROAD: "सड़कें और गड्ढे",
      SANITATION: "स्वच्छता और कचरा",
      WATER_SUPPLY: "जल आपूर्ति",
      ELECTRICAL: "बिजली और स्ट्रीटलाइट",
      DRAINAGE: "जल निकासी और सीवरेज",
      TRAFFIC: "यातायात और परिवहन",
      OTHER: "अन्य",
      GENERAL: "सामान्य नागरिक",
    },

    statuses: {
      ALL: "सभी स्थितियां",
      SUBMITTED: "दर्ज की गई",
      ROUTED: "विभाग को भेजी गई",
      IN_PROGRESS: "प्रगति पर",
      RESOLVED: "समाधान हुआ",
      COMPLETED: "पूर्ण",
      CLOSED: "बंद",
      REJECTED: "अस्वीकृत",
      DUPLICATE: "डुप्लिकेट",
    },

    severities: {
      LOW: "कम",
      MEDIUM: "मध्यम",
      HIGH: "उच्च",
      CRITICAL: "अति-गंभीर",
    },

    verification: {
      PENDING: "समीक्षा लंबित",
      VERIFIED: "अधिकारी द्वारा सत्यापित",
      NEEDS_REVIEW: "समीक्षा आवश्यक",
      REJECTED: "अमान्य / अस्वीकृत",
      HUMAN_VERIFIED: "अधिकारी द्वारा सत्यापित",
      AI_ASSESSED: "एआई द्वारा मूल्यांकित",
    },

    auth: {
      portalTitle: "स्मार्ट सिटी पोर्टल",
      portalSubtitle: "सुरक्षित नागरिक एआई टेलीमेट्री और सार्वजनिक शासन प्रणाली",
      signInTab: "साइन इन करें",
      registerTab: "पंजीकरण करें",
      fullNameLabel: "पूरा नाम",
      fullNamePlaceholder: "उदा. राहुल शर्मा",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "citizen@city.gov",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "अपना सुरक्षित पासवर्ड दर्ज करें",
      roleLabel: "खाता भूमिका",
      signInButton: "पोर्टल में प्रवेश करें",
      registerButton: "खाता बनाएं",
      noAccountPrompt: "क्या आपके पास खाता नहीं है?",
      haveAccountPrompt: "पहले से पंजीकृत हैं?",
      loggingIn: "प्रमाणीकरण हो रहा है...",
      creatingAccount: "खाता बनाया जा रहा है...",
      authSuccess: "प्रमाणीकरण सफल रहा!",
      regSuccess: "उपयोगकर्ता सफलतापूर्वक पंजीकृत हुआ!",
      authError: "प्रमाणीकरण विफल रहा। अपने विवरण की जांच करें।",
    },

    citizenDashboard: {
      title: "नागरिक शासन पोर्टल",
      subtitle: "स्थानीय बुनियादी ढांचे की समस्याओं की रिपोर्ट करें और वास्तविक समय में समाधान ट्रैक करें।",
      reportIssueBtn: "+ समस्या दर्ज करें",
      viewHistoryBtn: "मेरी रिपोर्टें देखें →",
      statsTotal: "कुल रिपोर्टें",
      statsActive: "सक्रिय समस्याएं",
      statsResolved: "हल की गई समस्याएं",
      statsRate: "समाधान दर",
      quickCategoriesTitle: "नगरपालिका सेवाएं",
      recentIncidentsTitle: "मेरी हालिया सबमिशन",
      noIncidentsFound: "कोई बुनियादी ढांचा रिपोर्ट नहीं मिली।",
      reportFirstPrompt: "सड़क पर गड्ढा, रिसाव या खतरा दिखा? ऊपर अपनी पहली रिपोर्ट दर्ज करें।",
      incidentId: "समस्या आईडी",
      reportedOn: "रिपोर्ट तिथि",
      department: "विभाग",
      status: "स्थिति",
    },

    complaintForm: {
      pageTitle: "स्मार्ट सिटी पोर्टल — समस्या दर्ज करें",
      heading: "समस्या दर्ज करें",
      viewHistory: "मेरी पिछली रिपोर्टें देखें →",
      photoSectionTitle: "समस्या की तस्वीर (आवश्यक साक्ष्य)",
      photoInstruction: "फ़ोटो खींचें या छवि अपलोड करें",
      cameraButton: "फ़ोटो लें",
      changeImage: "छवि बदलें",
      removeImage: "हटाएं",
      uploadingPhoto: "क्लाउड पर तस्वीर अपलोड हो रही है...",
      imageSuccess: "तस्वीर सफलतापूर्वक अपलोड हो गई!",
      imageError: "छवि अपलोड विफल रही।",
      imageSizeError: "फ़ाइल का आकार 10MB की सीमा से अधिक है।",
      imageTypeError: "केवल छवि फाइलें (JPG, PNG, WebP) अनुमत हैं।",
      cloudinaryError: "क्लाउडिनरी स्टोरेज से जुड़ने में असमर्थ।",
      locationSectionTitle: "रिपोर्ट स्थान",
      useLocationBtn: "मेरे वर्तमान स्थान का उपयोग करें",
      fetchingLocation: "जीपीएस स्थान प्राप्त किया जा रहा है...",
      gpsLocked: "जीपीएस लॉक हुआ",
      coordinatesLabel: "जीपीएस निर्देशांक:",
      detectedLocationLabel: "पता लगाया गया स्थान:",
      geoNotSupported: "आपके ब्राउज़र द्वारा जियोलोकेशन समर्थित नहीं है।",
      locationDenied: "स्थान अनुमति अस्वीकार कर दी गई। कृपया जीपीएस अनुमति सक्षम करें।",
      locationUnavailable: "स्थान की जानकारी वर्तमान में अनुपलब्ध है।",
      locationTimeout: "स्थान अनुरोध का समय समाप्त हो गया। कृपया पुनः प्रयास करें।",
      locationGenericError: "स्थान निर्देशांक प्राप्त करने में असमर्थ।",
      submitButton: "स्मार्ट सिटी एआई को सबमिट करें",
      submittingButton: "एआई विज़न विश्लेषण कर रहा है...",
      valDepartmentRequired: "कृपया एक विभाग चुनें।",
      valLocationRequired: "कृपया पहले अपना जीपीएस स्थान निर्देशांक प्रदान करें।",
      valWaitUpload: "कृपया छवि अपलोड पूरी होने तक प्रतीक्षा करें।",
      valOffline: "आप ऑफ़लाइन हैं। शिकायत दर्ज करने के लिए इंटरनेट कनेक्शन आवश्यक है।",
      valAuthRequired: "प्रमाणीकरण समाप्त हो गया। कृपया पुनः लॉग इन करें।",
      submitSuccess: "घटना सफलतापूर्वक दर्ज की गई और संबंधित विभाग को भेज दी गई।",
      submitDuplicate: "डुप्लिकेट रिपोर्ट मिली: एआई पुष्टि करता है कि इस समस्या की पहले ही रिपोर्ट की जा चुकी है और यह सक्रिय है।",
      submitNetworkError: "नेटवर्क अनुपलब्ध है। कृपया अपना इंटरनेट कनेक्शन जांचें।",
      submitFailed: "सबमिट करने में विफल। जांचें कि बैकएंड और एआई सेवाएं चल रही हैं या नहीं।",
      irrelevantNotice: "सूचना: अपलोड की गई तस्वीर में कोई नागरिक समस्या नहीं दिख रही है। कृपया समस्या की उपयुक्त तस्वीर अपलोड करें।",
      mismatchNotice: "एआई सूचना: दृश्य साक्ष्यों से संकेत मिलता है कि यह समस्या संबंधित हो सकती है:",
      suggestedDeptPrompt: "चुने गए विभाग के बजाय।",
    },

    citizenHistory: {
      title: "मेरी दर्ज की गई समस्याएं",
      subtitle: "लाइव स्थिति अपडेट, एआई गंभीरता निदान देखें और समाधान पर प्रतिक्रिया दें।",
      backBtn: "← डैशबोर्ड पर वापस जाएं",
      allFilter: "सभी समस्याएं",
      emptyTitle: "कोई शिकायत नहीं मिली",
      emptySubtitle: "आपने अभी तक कोई बुनियादी ढांचा शिकायत दर्ज नहीं की है।",
      reportNewBtn: "समस्या दर्ज करें",
      aiDiagnosisTitle: "एआई विज़न टेलीमेट्री",
      severityLabel: "गंभीरता:",
      confidenceLabel: "विश्वास स्कोर:",
      evidenceScoreLabel: "दृश्य साक्ष्य स्कोर:",
      verificationLabel: "सत्यापन स्थिति:",
      rateResolutionTitle: "नगरपालिका समाधान का मूल्यांकन करें",
      feedbackSubmitted: "प्रतिक्रिया सफलतापूर्वक सबमिट की गई। धन्यवाद!",
      starRatingPrompt: "रेटिंग चुनें (1 से 5 सितारे):",
      commentsPlaceholder: "कार्य की गुणवत्ता पर विवरण साझा करें (वैकल्पिक)...",
      submitFeedbackBtn: "प्रतिक्रिया सबमिट करें",
      submittingFeedback: "सबमिट हो रहा है...",
      officerRemarksTitle: "अधिकारी सत्यापन टिप्पणी:",
    },

    officerDashboard: {
      title: "विभागीय संचालन केंद्र",
      subtitle: "आवंटित रिपोर्टों की समीक्षा करें, एआई दृश्य साक्ष्य का निरीक्षण करें और फील्ड समाधान स्थिति अपडेट करें।",
      departmentQueue: "विभागीय कतार",
      assignedStats: "कुल आवंटित",
      pendingStats: "समीक्षा लंबित",
      inProgressStats: "प्रगति पर",
      resolvedStats: "समाधान हुआ",
      filterDepartment: "विभाग फ़िल्टर करें",
      filterStatus: "स्थिति फ़िल्टर करें",
      noComplaintsAssigned: "इस कतार में वर्तमान में कोई शिकायत आवंटित नहीं है।",
      cardReporter: "नागरिक रिपोर्टर:",
      cardLocation: "स्थान का पता:",
      cardCoordinates: "जीपीएस निर्देशांक:",
      cardEvidencePhoto: "फ़ोटोग्राफ़िक दृश्य साक्ष्य:",
      aiEvidenceCardTitle: "एआई दृश्य साक्ष्य एवं निदान",
      aiPredictedIssue: "अनुमानित समस्या:",
      aiConfidence: "एआई विश्वास:",
      aiSeverityScore: "गंभीरता स्कोर:",
      aiReasons: "साक्ष्य का कारण:",
      updateStatusModalTitle: "स्थिति अपडेट और सत्यापन",
      selectNewStatus: "नई स्थिति चुनें:",
      officerRemarksLabel: "आधिकारिक टिप्पणी / समाधान नोट्स:",
      officerRemarksPlaceholder: "फील्ड टीम निरीक्षण विवरण या समाधान टिप्पणी प्रदान करें...",
      humanVerificationCheckbox: "एआई निदान को अधिकारी द्वारा मानव सत्यापित चिह्नित करें",
      severityOverrideLabel: "गंभीरता अधिरोहण (वैकल्पिक):",
      applyUpdateBtn: "स्थिति अपडेट लागू करें",
      updatingStatus: "सहेजा जा रहा है...",
      updateSuccess: "समस्या की स्थिति और सत्यापन सफलतापूर्वक अपडेट किया गया!",
      highStats: "उच्च गंभीरता",
      changeSeverityLabel: "गंभीरता निर्धारित करें:",
    },

    adminDashboard: {
      title: "शहर-व्यापी प्रशासनिक कंसोल",
      subtitle: "व्यापक नागरिक संचालन निगरानी, गंभीरता वितरण विश्लेषण और विभागीय टेलीमेट्री।",
      totalIncidents: "कुल रिपोर्टें",
      criticalAlerts: "अति-गंभीर चेतावनियां",
      highAlerts: "उच्च प्राथमिकता वाली समस्याएं",
      resolvedIncidents: "हल की गई समस्याएं",
      resolutionRate: "शहर-व्यापी समाधान दर",
      departmentBreakdownTitle: "विभागीय विवरण",
      cityReportsTitle: "सभी नगरपालिका रिपोर्टें",
      toggleHeatmap: "हीटमैप विज़ुअलाइज़र दिखाएं",
      hideHeatmap: "हीटमैप विज़ुअलाइज़र छुपाएं",
      filterReportsLabel: "शहर की रिपोर्टें फ़िल्टर करें:",
      decommissionBtn: "रिकॉर्ड हटा दें",
      decommissionSuccess: "सिग्नल डिकमीशन किया गया और डेटाबेस से हटा दिया गया।",
      confirmDeletePrompt: "क्या आप वाकई इस शिकायत को स्थायी रूप से हटाना चाहते हैं?",
      noReportsFound: "चुने गए विभाग या स्थिति फ़िल्टर से कोई रिपोर्ट मेल नहीं खाती।",
      severityLabel: "गंभीरता",
      changeSeverityLabel: "गंभीरता बदलें:",
      severityUpdated: "गंभीरता सफलतापूर्वक अपडेट की गई!",
      severityUpdateError: "गंभीरता अपडेट करने में विफल।",
      aiAssessedSeverity: "एआई मूल्यांकित",
      assignedSeverity: "प्रशासक निर्धारित",
      cannotAssignRejected: "अस्वीकृत गैर-नागरिक मीडिया को गंभीरता नहीं दी जा सकती।",
      verificationRequiredForSeverity: "गंभीरता निर्धारित करने से पहले सत्यापन आवश्यक है।",
      severityFilterTitle: "गंभीरता फ़िल्टर",
      allSeverities: "सभी गंभीरताएं",
      resetSeverityFilter: "फ़िल्टर रीसेट करें",
    },

    heatmap: {
      title: "भौगोलिक समस्या हीटमैप",
      subtitle: "नगरपालिका क्षेत्र में दर्ज नागरिक बुनियादी ढांचे की समस्याओं का लाइव स्थानिक दृश्य।",
      legendTitle: "विभाग सूची",
      highDensity: "उच्च घनत्व क्षेत्र",
      moderateDensity: "मध्यम घनत्व",
      lowDensity: "कम घनत्व",
      filterLabel: "परत फ़िल्टर करें:",
    },

    notifications: {
      title: "सूचनाएं",
      markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
      empty: "कोई नई सूचना नहीं",
      newBadge: "नया",
    },

    departmentRoles: {
      HEAD: "विभागीय प्रमुख",
      OFFICER: "विभागीय अधिकारी",
      STAFF: "विभागीय कर्मचारी",
    },

    deptUserManagement: {
      tabTelemetry: "नगर शिकायत टेलीमेट्री",
      tabUsers: "विभागीय उपयोगकर्ता प्रबंधन",
      tabAuditLogs: "प्रशासनिक ऑडिट लॉग",
      createUserBtn: "नया उपयोगकर्ता जोड़ें",
      searchPlaceholder: "नाम या ईमेल द्वारा खोजें...",
      filterDept: "सभी विभाग",
      filterRole: "सभी भूमिकाएं",
      filterStatus: "सभी स्थितियां",
      thName: "पूरा नाम",
      thEmail: "आधिकारिक ईमेल",
      thDept: "विभाग",
      thRole: "भूमिका",
      thAccountStatus: "खाता स्थिति",
      thInvitationStatus: "सक्रियण स्थिति",
      thCreated: "निर्माण तिथि",
      thLastLogin: "अंतिम लॉगिन",
      thActions: "कार्रवाई",
      statusActive: "सक्रिय",
      statusInactive: "निष्क्रिय",
      statusInvited: "आमंत्रित",
      invitationPending: "आमंत्रण प्रलंबित",
      invitationExpired: "समाप्त",
      neverLoggedIn: "कभी नहीं",
      resendInvitation: "पुनः आमंत्रण भेजें",
      resetAccess: "पासवर्ड रीसेट लिंक भेजें",
      editUser: "संपादित करें",
      deactivateUser: "निष्क्रिय करें",
      activateUser: "सक्रिय करें",
      confirmDeactivate: "क्या आप वाकई इस खाते को निष्क्रिय करना चाहते हैं? उपयोगकर्ता लॉगिन नहीं कर सकेगा।",
      createModalTitle: "नया विभागीय खाता बनाएं",
      editModalTitle: "उपयोगकर्ता विवरण संपादित करें",
      fullNameLabel: "पूरा नाम",
      emailLabel: "आधिकारिक ईमेल पता",
      deptLabel: "आवंटित विभाग",
      roleLabel: "विभागीय भूमिका",
      statusLabel: "खाता स्थिति",
      tempPasswordLabel: "अस्थायी पासवर्ड (वैकल्पिक)",
      tempPasswordPlaceholder: "खाली छोड़ें यदि ईमेल लिंक द्वारा सक्रिय करना हो",
      cancelBtn: "रद्द करें",
      saveBtn: "सहेजें",
      creating: "बनाया जा रहा है...",
      reassignDeptTitle: "शिकायत का विभाग बदलें",
      reassignDeptBtn: "विभाग बदलें",
      selectNewDept: "नया विभाग चुनें",
      reassignReasonLabel: "बदलाव का कारण",
      reassignReasonPlaceholder: "विभाग परिवर्तन का प्रशासनिक कारण दर्ज करें...",
      assignPersonnelTitle: "कर्मचारी को शिकायत सौंपें",
      assignPersonnelBtn: "अधिकारी सौंपें",
      selectOfficerPlaceholder: "विभागीय अधिकारी/कर्मचारी चुनें...",
      unassigned: "अनावंटित",
      auditLogsTitle: "प्रशासनिक ऑडिट ट्रेल",
      noUsersFound: "कोई विभागीय उपयोगकर्ता नहीं मिला।",
      noLogsFound: "कोई ऑडिट लॉग उपलब्ध नहीं है।",
      smtpNotice: "नोट: एसएमटीपी ईमेल सेवा कॉन्फ़िगर नहीं है। आप सक्रियण लिंक यहां से कॉपी कर सकते हैं:",
      copyLink: "लिंक कॉपी करें",
      linkCopied: "कॉपी हो गया!",
    },

    accountActivation: {
      pageTitle: "स्मार्ट सिटी एआई — खाता सक्रियण",
      subtitle: "अपना आधिकारिक विभागीय पासवर्ड सेट करें",
      welcomeMessage: "नगर प्रशासन पोर्टल में आपका स्वागत है। कृपया नीचे अपने सुरक्षित क्रेडेंशियल दर्ज करें।",
      departmentLabel: "आवंटित विभाग",
      roleLabel: "विभागीय भूमिका",
      passwordLabel: "नया पासवर्ड",
      passwordPlaceholder: "कम से कम 8 वर्ण...",
      confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
      confirmPasswordPlaceholder: "पासवर्ड दोबारा दर्ज करें...",
      activateButton: "खाता सक्रिय करें और लॉगिन करें",
      activating: "सक्रिय किया जा रहा है...",
      passwordsDoNotMatch: "पासवर्ड मेल नहीं खा रहे हैं।",
      passwordTooShort: "पासवर्ड कम से कम 8 वर्णों का होना चाहिए।",
      invalidOrExpiredToken: "यह आमंत्रण लिंक अमान्य, समाप्त या पहले से उपयोग में लाया जा चुका है।",
      successMessage: "खाता सफलतापूर्वक सक्रिय हो गया! विभागीय डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...",
      goToDashboard: "डैशबोर्ड पर आगे बढ़ें",
    },

    landing: {
      heroBadge: "नागरिक शासन प्रणाली",
      heroTitle: "स्मार्ट सिटी",
      heroSubtitle: "नागरिक समस्याओं की रिपोर्ट करें। प्रगति ट्रैक करें। बेहतर शहर बनाएं।",
      heroDescription: "स्मार्ट सिटी नागरिकों के लिए स्थानीय समस्याओं की रिपोर्ट करना आसान बनाता है, साथ ही विभागों और शहर प्रशासकों को कुशलतापूर्वक प्रबंधन में मदद करता है।",
      getStartedBtn: "आरंभ करें",
      exploreProcessBtn: "प्रक्रिया समझें",
      liveExampleTitle: "लाइव शिकायत उदाहरण",
      liveExampleStatus: "प्रगति में",
      howItWorksBadge: "सरल 5-चरणीय प्रक्रिया",
      howItWorksTitle: "यह कैसे काम करता है",
      howItWorksSubtitle: "समस्या की रिपोर्ट करने से लेकर सत्यापन तक, हर कदम पारदर्शी है।",
      categoriesBadge: "समर्थित नगरपालिका श्रेणियां",
      categoriesTitle: "आप क्या रिपोर्ट कर सकते हैं?",
      categoriesSubtitle: "पांच प्रमुख नागरिक विभागों में से किसी में भी सीधे समस्याएं दर्ज करें।",
      rolesBadge: "मंच तक पहुंच",
      rolesTitle: "एक मंच। तीन भूमिकाएं।",
      rolesSubtitle: "नागरिकों, विभागीय अधिकारियों और शहर के नेतृत्व के लिए अनुकूलित कार्यक्षेत्र।",
      stayInformedTitle: "सूचित रहें",
      stayInformedDesc: "एक बार जब आप समस्या दर्ज करते हैं, तो समाधान तक उसकी प्रगति देख सकते हैं। स्थिति बदलने पर अपडेट प्राप्त करें।",
      viewPortalBtn: "पोर्टल देखें",
      finalCtaTitle: "क्या आपके पास रिपोर्ट करने के लिए कोई नागरिक समस्या है?",
      finalCtaSubtitle: "अपने शहर को स्वच्छ, सुरक्षित और बेहतर बनाने में मदद करें।",
      roleCards: {
        citizenBadge: "नागरिकों के लिए",
        citizenTitle: "नागरिक",
        citizenDesc: "नागरिक समस्याओं की रिपोर्ट करें और वास्तविक समय में स्थिति ट्रैक करें।",
        citizenFeature: "जीपीएस और फोटो के साथ सीधा प्रवेश",
        citizenAction: "नागरिक पोर्टल में प्रवेश करें →",
        officerBadge: "विभागों के लिए",
        officerTitle: "अधिकारी",
        officerDesc: "अपने विभाग को सौंपी गई शिकायतों का प्रबंधन करें और स्थिति अपडेट करें।",
        officerFeature: "विभागीय कार्यभार कतार",
        officerAction: "क्षेत्राधिकार चुनें और लॉगिन करें →",
        adminBadge: "शहर नेतृत्व के लिए",
        adminTitle: "नगर प्रशासक",
        adminDesc: "शहर-व्यापी शिकायतों की निगरानी करें और विश्लेषण देखें।",
        adminFeature: "शहर-व्यापी विश्लेषण और हीटमैप",
        adminAction: "क्षेत्राधिकार चुनें और लॉगिन करें →",
      },
    },

    locationSelector: {
      modalTitle: "प्रशासनिक स्थान चुनें",
      modalSubtitle: "आधिकारिक कार्यक्षेत्र तक पहुंचने के लिए अपना क्षेत्राधिकार चुनें",
      selectionOrderNotice: "क्रम में प्रशासनिक स्थान चुनें: राज्य → ज़िला → शहर → प्रभाग",
      stateLabel: "राज्य",
      statePlaceholder: "राज्य चुनें",
      districtLabel: "ज़िला",
      districtPlaceholder: "ज़िला चुनें",
      cityLabel: "शहर / नगरपालिका",
      cityPlaceholder: "शहर / नगरपालिका चुनें",
      divisionLabel: "प्रभाग / वार्ड",
      divisionPlaceholder: "प्रभाग / वार्ड चुनें",
      continueBtn: "लॉगिन जारी रखें",
      cancelBtn: "रद्द करें",
      backBtn: "पीछे",
      stepIndicator: "चरण {step} / 4",
      allSelectedBadge: "सभी 4 प्रशासनिक स्तर चुने गए ✓",
      missingSelectionWarning: "जारी रखने के लिए कृपया सभी चयन (राज्य, ज़िला, शहर और प्रभाग) पूरे करें।",
      demoDataNotice: "डेमो प्रशासनिक स्थान निर्देशिका। यह संदर्भ आधिकारिक लॉगिन में भेजा जाएगा।",
    },

    roleLogin: {
      citizenHeading: "नागरिक लॉगिन",
      citizenSubtitle: "अपनी शिकायतों और नगरपालिका सेवाओं तक पहुंचें",
      officerHeading: "अधिकारी लॉगिन",
      officerSubtitle: "विभागीय अधिकारी कार्यक्षेत्र लॉगिन",
      adminHeading: "नगर प्रशासक लॉगिन",
      adminSubtitle: "नगर प्रशासक कमांड सेंटर लॉगिन",
      jurisdictionHeader: "प्रशासनिक स्थान संदर्भ",
      jurisdictionDesc: "इस लॉगिन सत्र के लिए आधिकारिक क्षेत्राधिकार",
      changeLocationBtn: "स्थान बदलें",
      missingLocationAlert: "प्रशासनिक स्थान संदर्भ अनुपलब्ध है। कृपया पहले अपना क्षेत्राधिकार चुनें।",
      selectLocationBtn: "स्थान अभी चुनें",
      unauthorizedOfficer: "अनधिकृत पहुंच: यह पोर्टल केवल विभागीय अधिकारियों के लिए है। आपका खाता अधिकारी के रूप में अधिकृत नहीं है।",
      unauthorizedAdmin: "अनधिकृत पहुंच: इस पोर्टल के लिए नगर प्रशासक अनुमति की आवश्यकता है। आपके खाते में व्यवस्थापक अधिकार नहीं हैं।",
      unauthorizedCitizen: "अनधिकृत पहुंच: कृपया अपने नागरिक खाते का उपयोग करें।",
      officerRoleRequired: "विभागीय अधिकारी विशेषाधिकार आवश्यक हैं।",
      adminRoleRequired: "नगर प्रशासक विशेषाधिकार आवश्यक हैं।",
    },

    networkStatus: {
      online: "ऑनलाइन",
      offline: "ऑफ़लाइन",
      syncingDrafts: "ड्राफ्ट सिंक हो रहे हैं...",
      draftSaved: "ड्राफ्ट ऑफ़लाइन सहेजा गया",
      submissionFailed: "सबमिशन विफल रहा",
      submissionSuccess: "सफलतापूर्वक सबमिट किया गया",
      offlineNotice: "आप वर्तमान में ऑफ़लाइन हैं। लाइव एआई विश्लेषण और नगरपालिका रूटिंग के लिए इंटरनेट आवश्यक है। आप अपनी शिकायत को ऑफ़लाइन ड्राफ्ट के रूप में सहेज सकते हैं।",
      offlineFallbackPrompt: "नेटवर्क अनुपलब्ध है। क्या आप बाद में सबमिट करने के लिए इस शिकायत को ऑफ़लाइन ड्राफ्ट के रूप में सहेजना चाहते हैं?",
      installApp: "ऐप इंस्टॉल करें",
      installAppPrompt: "तेज़ ऑफ़लाइन पहुंच और त्वरित शिकायत दर्ज करने के लिए स्मार्ट सिटी एआई इंस्टॉल करें।",
      appInstalled: "ऐप इंस्टॉल हो गया",
      offlineDraftsTitle: "ऑफ़लाइन शिकायत ड्राफ्ट",
      saveAsDraft: "ऑफ़लाइन ड्राफ्ट के रूप में सहेजें",
      draftConsentLabel: "मैं सबमिट होने तक इस फोटो और जीपीएस निर्देशांक को ब्राउज़र ऑफ़लाइन स्टोरेज में सहेजने की सहमति देता हूँ।",
      draftConsentRequired: "फोटो और स्थान डेटा स्थानीय रूप से सहेजने के लिए सहमति आवश्यक है।",
      submitDraft: "सर्वर पर सबमिट करें",
      deleteDraft: "ड्राफ्ट हटाएं",
      editDraft: "संपादित करें / पुनः शुरू करें",
      noDrafts: "कोई ऑफ़लाइन ड्राफ्ट सहेजा नहीं गया है।",
      draftNotSynced: "ऑफ़लाइन ड्राफ्ट — सर्वर पर सबमिट नहीं हुआ",
      aiOfflineNote: "पुनः कनेक्ट होने और सबमिट करने पर एआई छवि विश्लेषण और रूटिंग की जाएगी।",
      confirmDeleteDraft: "क्या आप वाकई इस ऑफ़लाइन ड्राफ्ट को स्थायी रूप से हटाना चाहते हैं?",
      draftSubmitSuccess: "ऑफ़लाइन ड्राफ्ट सफलतापूर्वक सबमिट किया गया और विभाग को रूट किया गया!",
      draftSubmitError: "ड्राफ्ट सबमिट करने में विफल। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।",
      openDraftsBtn: "ऑफ़लाइन ड्राफ्ट देखें",
    },
  },

  mr: {
    brandName: "स्मार्ट सिटी एआय",
    brandTagline: "नागरी प्रशासन व्यासपीठ",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    logOut: "लॉग आउट",
    languageLabel: "भाषा",
    languages: {
      en: "English",
      hi: "हिन्दी",
      mr: "मराठी",
    },
    backToDashboard: "← डॅशबोर्डवर परत जा",
    loading: "टेलीमेट्री डेटा लोड होत आहे...",
    refresh: "ताजे करा",
    close: "बंद करा",
    save: "जतन करा",
    cancel: "रद्द करा",

    roles: {
      CITIZEN: "नागरिक",
      OFFICER: "विभागीय अधिकारी",
      ADMIN: "प्रशासक",
      CONTRACTOR: "फील्ड कंत्राटदार",
    },

    selectDepartmentLabel: "विभाग निवडा",
    selectDepartmentPlaceholder: "-- एक विभाग निवडा --",
    departments: {
      ALL: "सर्व विभाग",
      ROAD: "रस्ते आणि खड्डे",
      SANITATION: "स्वच्छता आणि कचरा",
      WATER_SUPPLY: "पाणी पुरवठा",
      ELECTRICAL: "वीज आणि पथदिवे",
      DRAINAGE: "ड्रेनेज आणि सांडपाणी",
      TRAFFIC: "वाहतूक आणि परिवहन",
      OTHER: "इतर",
      GENERAL: "सामान्य नागरी",
    },

    statuses: {
      ALL: "सर्व स्थिती",
      SUBMITTED: "नोंदवली",
      ROUTED: "विभागाकडे पाठवली",
      IN_PROGRESS: "प्रगतीपथावर",
      RESOLVED: "निवारण झाले",
      COMPLETED: "पूर्ण",
      CLOSED: "बंद",
      REJECTED: "नाकारली",
      DUPLICATE: "डुप्लिकेट",
    },

    severities: {
      LOW: "कमी",
      MEDIUM: "मध्यम",
      HIGH: "उच्च",
      CRITICAL: "अति-गंभीर",
    },

    verification: {
      PENDING: "पुनरावलोकन प्रलंबित",
      VERIFIED: "अधिकाऱ्याने सत्यापित केले",
      NEEDS_REVIEW: "पुनरावलोकन आवश्यक",
      REJECTED: "अवैध / नाकारली",
      HUMAN_VERIFIED: "अधिकाऱ्याने पडताळणी केली",
      AI_ASSESSED: "एआय द्वारे मूल्यांकित",
    },

    auth: {
      portalTitle: "स्मार्ट सिटी पोर्टल",
      portalSubtitle: "सुरक्षित नागरी एआय टेलीमेट्री आणि सार्वजनिक प्रशासन प्रणाली",
      signInTab: "साइन इन करा",
      registerTab: "नोंदणी करा",
      fullNameLabel: "पूर्ण नाव",
      fullNamePlaceholder: "उदा. सचिन पवार",
      emailLabel: "ईमेल पत्ता",
      emailPlaceholder: "citizen@city.gov",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "तुमचा सुरक्षित पासवर्ड प्रविष्ट करा",
      roleLabel: "खाते भूमिका",
      signInButton: "पोर्टलमध्ये प्रवेश करा",
      registerButton: "खाते तयार करा",
      noAccountPrompt: "खाते नाही का?",
      haveAccountPrompt: "आधीच नोंदणीकृत आहात?",
      loggingIn: "प्रमाणीकरण होत आहे...",
      creatingAccount: "खाते तयार होत आहे...",
      authSuccess: "प्रमाणीकरण यशस्वी झाले!",
      regSuccess: "वापरकर्ता यशस्वीरित्या नोंदणीकृत झाला!",
      authError: "प्रमाणीकरण अयशस्वी. तुमची माहिती तपासा.",
    },

    citizenDashboard: {
      title: "नागरिक प्रशासन पोर्टल",
      subtitle: "स्थानिक पायाभूत समस्यांची नोंद करा आणि रिअल टाइममध्ये महापालिका निवारण ट्रॅक करा.",
      reportIssueBtn: "+ तक्रार नोंदवा",
      viewHistoryBtn: "माझे अहवाल पहा →",
      statsTotal: "एकूण तक्रारी",
      statsActive: "सक्रिय समस्या",
      statsResolved: "निवारण झालेल्या समस्या",
      statsRate: "निवारण दर",
      quickCategoriesTitle: "महापालिका सेवा",
      recentIncidentsTitle: "माझ्या अलीकडील तक्रारी",
      noIncidentsFound: "कोणतीही तक्रार आढळली नाही.",
      reportFirstPrompt: "रस्त्यावर खड्डा, पाण्याची गळती किंवा धोका दिसला का? वर तुमची पहिली तक्रार नोंदवा.",
      incidentId: "तक्रार आयडी",
      reportedOn: "नोंदणी तारीख",
      department: "विभाग",
      status: "स्थिती",
    },

    complaintForm: {
      pageTitle: "स्मार्ट सिटी पोर्टल — तक्रार नोंदवा",
      heading: "तक्रार नोंदवा",
      viewHistory: "माझे मागील अहवाल पहा →",
      photoSectionTitle: "घटनेचा फोटो (आवश्यक पुरावा)",
      photoInstruction: "फोटो काढा किंवा इमेज अपलोड करा",
      cameraButton: "फोटो काढा",
      changeImage: "इमेज बदला",
      removeImage: "काढून टाका",
      uploadingPhoto: "क्लाउडवर फोटो अपलोड होत आहे...",
      imageSuccess: "फोटो यशस्वीरित्या अपलोड झाला!",
      imageError: "इमेज अपलोड अयशस्वी झाली.",
      imageSizeError: "फाइल आकार 10MB मर्यादेपेक्षा जास्त आहे.",
      imageTypeError: "केवळ इमेज फाइल्स (JPG, PNG, WebP) अनुमत आहेत.",
      cloudinaryError: "क्लाउडिनरी स्टोरेजशी जोडणी करण्यात अक्षम.",
      locationSectionTitle: "तक्रारीचे स्थान",
      useLocationBtn: "माझे वर्तमान स्थान वापरा",
      fetchingLocation: "जीपीएस स्थान शोधत आहे...",
      gpsLocked: "जीपीएस लॉक झाले",
      coordinatesLabel: "जीपीएस निर्देशांक:",
      detectedLocationLabel: "शोधलेले स्थान:",
      geoNotSupported: "तुमच्या ब्राउझरद्वारे जिओलोकेशन समर्थित नाही.",
      locationDenied: "स्थान प्रवेश नाकारला गेला. कृपया जीपीएस परवानगी सुरू करा.",
      locationUnavailable: "स्थान माहिती सध्या अनुपलब्ध आहे.",
      locationTimeout: "स्थान विनंतीची वेळ संपली. कृपया पुन्हा प्रयत्न करा.",
      locationGenericError: "स्थान निर्देशांक शोधण्यात अक्षम.",
      submitButton: "स्मार्ट सिटी एआय कडे सबमिट करा",
      submittingButton: "एआय व्हिजन विश्लेषण करत आहे...",
      valDepartmentRequired: "कृपया एक विभाग निवडा.",
      valLocationRequired: "कृपया प्रथम तुमचे जीपीएस स्थान निर्देशांक द्या.",
      valWaitUpload: "कृपया इमेज अपलोड पूर्ण होण्याची प्रतीक्षा करा.",
      valOffline: "तुम्ही ऑफलाइन आहात. तक्रार नोंदवण्यासाठी इंटरनेट कनेक्शन आवश्यक आहे.",
      valAuthRequired: "प्रमाणीकरण संपले. कृपया पुन्हा लॉग इन करा.",
      submitSuccess: "तक्रार यशस्वीरित्या नोंदवली गेली आणि संबंधित विभागाकडे पाठवली गेली.",
      submitDuplicate: "डुप्लिकेट तक्रार आढळली: आमच्या एआयने पुष्टी केली आहे की ही समस्या आधीच नोंदवली गेली आहे आणि सक्रिय आहे.",
      submitNetworkError: "नेटवर्क अनुपलब्ध आहे. कृपया तुमचे इंटरनेट कनेक्शन तपासा.",
      submitFailed: "सबमिट करण्यात अयशस्वी. बॅकएंड आणि एआय सुरू आहे का ते तपासा.",
      irrelevantNotice: "सूचना: अपलोड केलेल्या फोटोमध्ये कोणतीही नागरी समस्या दिसत नाही. कृपया समस्येचा योग्य फोटो अपलोड करा.",
      mismatchNotice: "एआय सूचना: दृश्य पुराव्यांवरून ही समस्या संबंधित असल्याचे दिसून येते:",
      suggestedDeptPrompt: "निवडलेल्या विभागाऐवजी.",
    },

    citizenHistory: {
      title: "माझ्या नोंदवलेल्या तक्रारी",
      subtitle: "थेट स्थिती अद्यतने, एआय तीव्रता निदान तपासा आणि निवारणावर अभिप्राय द्या.",
      backBtn: "← डॅशबोर्डवर परत जा",
      allFilter: "सर्व समस्या",
      emptyTitle: "कोणतीही तक्रार आढळली नाही",
      emptySubtitle: "तुम्ही अजून कोणतीही पायाभूत सुविधा तक्रार नोंदवलेली नाही.",
      reportNewBtn: "तक्रार नोंदवा",
      aiDiagnosisTitle: "एआय व्हिजन टेलीमेट्री",
      severityLabel: "तीव्रता:",
      confidenceLabel: "विश्वास स्कोर:",
      evidenceScoreLabel: "दृश्य पुरावा स्कोर:",
      verificationLabel: "सत्यापन स्थिती:",
      rateResolutionTitle: "महापालिका निवारणाचे मूल्यांकन करा",
      feedbackSubmitted: "अभिप्राय यशस्वीरित्या सबमिट झाला. धन्यवाद!",
      starRatingPrompt: "रेटिंग निवडा (१ ते ५ तारे):",
      commentsPlaceholder: "कामाच्या गुणवत्तेवर तपशील सामायिक करा (पर्यायी)...",
      submitFeedbackBtn: "अभिप्राय सबमिट करा",
      submittingFeedback: "सबमिट होत आहे...",
      officerRemarksTitle: "अधिकारी पडताळणी टिप्पणी:",
    },

    officerDashboard: {
      title: "विभागीय नियंत्रण कक्ष",
      subtitle: "नियुक्त तक्रारींचे पुनरावलोकन करा, एआय दृश्य पुरावे तपासा आणि फील्ड निवारण स्थिती अपडेट करा.",
      departmentQueue: "विभागीय रांग",
      assignedStats: "एकूण नियुक्त",
      pendingStats: "पुनरावलोकन प्रलंबित",
      inProgressStats: "प्रगतीपथावर",
      resolvedStats: "निवारण झाले",
      filterDepartment: "विभाग फिल्टर करा",
      filterStatus: "स्थिती फिल्टर करा",
      noComplaintsAssigned: "या रांगेत सध्या कोणत्याही तक्रारी नियुक्त केलेल्या नाहीत.",
      cardReporter: "नागरिक तक्रारदार:",
      cardLocation: "स्थानाचा पत्ता:",
      cardCoordinates: "जीपीएस निर्देशांक:",
      cardEvidencePhoto: "छायाचित्र दृश्य पुरावा:",
      aiEvidenceCardTitle: "एआय दृश्य पुरावे आणि निदान",
      aiPredictedIssue: "अंदाजित समस्या:",
      aiConfidence: "एआय विश्वास:",
      aiSeverityScore: "तीव्रता स्कोर:",
      aiReasons: "पुराव्याचे कारण:",
      updateStatusModalTitle: "तक्रार स्थिती अद्यतन आणि पडताळणी",
      selectNewStatus: "नवीन स्थिती निवडा:",
      officerRemarksLabel: "अधिकृत टिप्पणी / निवारण नोंदी:",
      officerRemarksPlaceholder: "फील्ड टीम तपासणी तपशील किंवा निवारण टिप्पणी प्रदान करा...",
      humanVerificationCheckbox: "एआय निदान अधिकाऱ्याने मानवी पडताळणी केलेले म्हणून चिन्हांकित करा",
      severityOverrideLabel: "तीव्रता अधिलिखित करा (पर्यायी):",
      applyUpdateBtn: "स्थिती अद्यतन लागू करा",
      updatingStatus: "जतन करत आहे...",
      updateSuccess: "तक्रार स्थिती आणि पडताळणी यशस्वीरित्या अद्यतनित केली!",
      highStats: "उच्च तीव्रता",
      changeSeverityLabel: "तीव्रता निश्चित करा:",
    },

    adminDashboard: {
      title: "शहर-व्यापी प्रशासकीय कन्सोल",
      subtitle: "सर्वसमावेशक नागरी कामकाज देखरेख, तीव्रता वितरण विश्लेषण आणि विभागीय टेलीमेट्री.",
      totalIncidents: "एकूण तक्रारी",
      criticalAlerts: "अति-गंभीर धोके",
      highAlerts: "उच्च प्राधान्य तक्रारी",
      resolvedIncidents: "निवारण झालेल्या तक्रारी",
      resolutionRate: "शहर-व्यापी निवारण दर",
      departmentBreakdownTitle: "विभागीय तपशील",
      cityReportsTitle: "सर्व महापालिका अहवाल",
      toggleHeatmap: "हीटमॅप व्हिज्युअलायझर दाखवा",
      hideHeatmap: "हीटमॅप व्हिज्युअलायझर लपवा",
      filterReportsLabel: "शहर अहवाल फिल्टर करा:",
      decommissionBtn: "नोंद हटवा",
      decommissionSuccess: "नोंद डेटाबेसमधून कायमची हटवली गेली.",
      confirmDeletePrompt: "तुम्हाला ही तक्रार कायमची हटवायची आहे का?",
      noReportsFound: "निवडलेल्या विभाग किंवा स्थिती फिल्टरशी जुळणारे कोणतेही अहवाल आढळले नाहीत.",
      severityLabel: "तीव्रता",
      changeSeverityLabel: "तीव्रता बदला:",
      severityUpdated: "तीव्रता यशस्वीरित्या अपडेट केली!",
      severityUpdateError: "तीव्रता अपडेट करण्यात अयशस्वी.",
      aiAssessedSeverity: "एआय मूल्यांकित",
      assignedSeverity: "प्रशासक नियुक्त",
      cannotAssignRejected: "नाकारलेल्या गैर-नागरी मीडियाला तीव्रता देता येत नाही.",
      verificationRequiredForSeverity: "तीव्रता निश्चित करण्यापूर्वी पडताळणी आवश्यक आहे.",
      severityFilterTitle: "तीव्रता फिल्टर",
      allSeverities: "सर्व तीव्रता",
      resetSeverityFilter: "फिल्टर रीसेट करा",
    },

    heatmap: {
      title: "भौगोलिक समस्या हीटमॅप",
      subtitle: "महापालिका क्षेत्रातील नागरी समस्यांचे थेट भौगोलिक क्लस्टर व्हिज्युअलायझेशन.",
      legendTitle: "विभाग सूची",
      highDensity: "उच्च घनता क्षेत्र",
      moderateDensity: "मध्यम घनता",
      lowDensity: "कमी घनता",
      filterLabel: "थर फिल्टर करा:",
    },

    notifications: {
      title: "सूचना",
      markAllRead: "सर्व वाचलेले म्हणून चिन्हांकित करा",
      empty: "कोणतीही नवीन सूचना नाही",
      newBadge: "नवीन",
    },

    departmentRoles: {
      HEAD: "विभाग प्रमुख",
      OFFICER: "विभाग अधिकारी",
      STAFF: "विभाग कर्मचारी",
    },

    deptUserManagement: {
      tabTelemetry: "शहर तक्रार टेलिमेट्री",
      tabUsers: "विभाग वापरकर्ता व्यवस्थापन",
      tabAuditLogs: "प्रशासकीय ऑडिट नोंदी",
      createUserBtn: "नवीन वापरकर्ता जोडा",
      searchPlaceholder: "नाव किंवा ईमेलद्वारे शोधा...",
      filterDept: "सर्व विभाग",
      filterRole: "सर्व भूमिका",
      filterStatus: "सर्व स्थिती",
      thName: "पूर्ण नाव",
      thEmail: "अधिकृत ईमेल",
      thDept: "विभाग",
      thRole: "भूमिका",
      thAccountStatus: "खाते स्थिती",
      thInvitationStatus: "सक्रियीकरण स्थिती",
      thCreated: "तयार केल्याची तारीख",
      thLastLogin: "शेवटचे लॉगिन",
      thActions: "कृती",
      statusActive: "सक्रिय",
      statusInactive: "निष्क्रिय",
      statusInvited: "निमंत्रित",
      invitationPending: "निमंत्रण प्रलंबित",
      invitationExpired: "कालबाह्य",
      neverLoggedIn: "कधीही नाही",
      resendInvitation: "पुन्हा निमंत्रण पाठवा",
      resetAccess: "पासवर्ड रीसेट लिंक पाठवा",
      editUser: "संपादित करा",
      deactivateUser: "निष्क्रिय करा",
      activateUser: "सक्रिय करा",
      confirmDeactivate: "तुम्हाला खात्री आहे की तुम्ही हे खाते निष्क्रिय करू इच्छिता? वापरकर्ता लॉगिन करू शकणार नाही.",
      createModalTitle: "नवीन विभाग खाते तयार करा",
      editModalTitle: "वापरकर्ता तपशील संपादित करा",
      fullNameLabel: "पूर्ण नाव",
      emailLabel: "अधिकृत ईमेल पत्ता",
      deptLabel: "नियुक्त विभाग",
      roleLabel: "विभागीय भूमिका",
      statusLabel: "खाते स्थिती",
      tempPasswordLabel: "तात्पुरता पासवर्ड (पर्यायी)",
      tempPasswordPlaceholder: "ईमेल दुव्याद्वारे सक्रिय करायचे असल्यास रिक्त ठेवा",
      cancelBtn: "रद्द करा",
      saveBtn: "जतन करा",
      creating: "तयार होत आहे...",
      reassignDeptTitle: "तक्रारीचा विभाग बदला",
      reassignDeptBtn: "विभाग बदला",
      selectNewDept: "नवीन विभाग निवडा",
      reassignReasonLabel: "बदलाचे कारण",
      reassignReasonPlaceholder: "विभाग बदलाचे प्रशासकीय कारण प्रविष्ट करा...",
      assignPersonnelTitle: "कर्मचाऱ्याकडे तक्रार सोपवा",
      assignPersonnelBtn: "अधिकारी सोपवा",
      selectOfficerPlaceholder: "विभागीय अधिकारी/कर्मचारी निवडा...",
      unassigned: "अनियुक्त",
      auditLogsTitle: "प्रशासकीय ऑडिट ट्रेल",
      noUsersFound: "कोणताही विभाग वापरकर्ता आढळला नाही.",
      noLogsFound: "कोणत्याही ऑडिट नोंदी उपलब्ध नाहीत.",
      smtpNotice: "टीप: SMTP ईमेल सेवा कॉन्फिगर केलेली नाही. तुम्ही सक्रियीकरण दुवा मॅन्युअली कॉपी करू शकता:",
      copyLink: "दुवा कॉपी करा",
      linkCopied: "कॉपी केले!",
    },

    accountActivation: {
      pageTitle: "स्मार्ट सिटी एआय — खाते सक्रियीकरण",
      subtitle: "आपला अधिकृत विभागीय पासवर्ड सेट करा",
      welcomeMessage: "महानगरपालिका प्रशासन पोर्टलवर आपले स्वागत आहे. कृपया खाली आपली सुरक्षित क्रेडेन्शियल्स प्रविष्ट करा.",
      departmentLabel: "नियुक्त विभाग",
      roleLabel: "विभागीय भूमिका",
      passwordLabel: "नवीन पासवर्ड",
      passwordPlaceholder: "किमान 8 वर्ण...",
      confirmPasswordLabel: "पासवर्डची पुष्टी करा",
      confirmPasswordPlaceholder: "पासवर्ड पुन्हा प्रविष्ट करा...",
      activateButton: "खाते सक्रिय करा आणि लॉगिन करा",
      activating: "सक्रिय केले जात आहे...",
      passwordsDoNotMatch: "पासवर्ड जुळत नाहीत.",
      passwordTooShort: "पासवर्ड किमान 8 वर्णांचा असावा.",
      invalidOrExpiredToken: "हा निमंत्रण दुवा अवैध, कालबाह्य किंवा आधीच वापरलेला आहे.",
      successMessage: "खाते यशस्वीरित्या सक्रिय झाले! विभागीय डॅशबोर्डवर पुनर्निर्देशित केले जात आहे...",
      goToDashboard: "डॅशबोर्डवर पुढे जा",
    },

    landing: {
      heroBadge: "नागरी प्रशासन व्यासपीठ",
      heroTitle: "स्मार्ट सिटी",
      heroSubtitle: "नागरी समस्यांची तक्रार नोंदवा. प्रगतीचा मागोवा घ्या. एक उत्तम शहर घडवा.",
      heroDescription: "स्मार्ट सिटी नागरिकांना स्थानिक समस्यांची नोंद करणे सुलभ करते आणि विभागांना तसेच शहर प्रशासकांना कार्यक्षमतेने त्यांचे निवारण करण्यास मदत करते.",
      getStartedBtn: "सुरू करा",
      exploreProcessBtn: "प्रक्रिया समजून घ्या",
      liveExampleTitle: "थेट तक्रार उदाहरण",
      liveExampleStatus: "प्रगतीपथावर",
      howItWorksBadge: "सोपी 5-टप्प्यांची प्रक्रिया",
      howItWorksTitle: "हे कसे कार्य करते",
      howItWorksSubtitle: "तक्रार नोंदवण्यापासून ते पडताळणीपर्यंत प्रत्येक पायरी पारदर्शक आहे.",
      categoriesBadge: "समर्थित महापालिका श्रेणी",
      categoriesTitle: "तुम्ही काय तक्रार करू शकता?",
      categoriesSubtitle: "पाच मुख्य नागरी विभागांपैकी कोणत्याही विभागाकडे थेट तक्रार नोंदवा.",
      rolesBadge: "व्यासपीठ प्रवेश",
      rolesTitle: "एक व्यासपीठ. तीन भूमिका.",
      rolesSubtitle: "नागरिक, विभागीय अधिकारी आणि शहर नेतृत्वासाठी सानुकूलित कार्यक्षेत्र.",
      stayInformedTitle: "माहिती मिळवत रहा",
      stayInformedDesc: "एकदा तक्रार नोंदवल्यानंतर तुम्ही निवारणापर्यंत प्रगती पाहू शकता. स्थिती बदलल्यावर अपडेट मिळवा.",
      viewPortalBtn: "पोर्टल पहा",
      finalCtaTitle: "तक्रार नोंदवण्यासाठी कोणतीही नागरी समस्या आहे का?",
      finalCtaSubtitle: "आपले शहर स्वच्छ, सुरक्षित आणि अधिक जोडलेले बनवण्यासाठी मदत करा.",
      roleCards: {
        citizenBadge: "नागरिकांसाठी",
        citizenTitle: "नागरिक",
        citizenDesc: "नागरी समस्यांची तक्रार नोंदवा आणि रीअल-टाइममध्ये प्रगतीचा मागोवा घ्या.",
        citizenFeature: "जीपीएस आणि फोटोसह थेट प्रवेश",
        citizenAction: "नागरिक पोर्टलमध्ये प्रवेश करा →",
        officerBadge: "विभागांसाठी",
        officerTitle: "अधिकारी",
        officerDesc: "आपल्या विभागाला सोपवलेल्या तक्रारींचे व्यवस्थापन करा आणि स्थिती अद्ययावत करा.",
        officerFeature: "विभागीय कामाची समर्पित रांग",
        officerAction: "कार्यक्षेत्र निवडा आणि लॉगिन करा →",
        adminBadge: "शहर नेतृत्वासाठी",
        adminTitle: "नगर प्रशासक",
        adminDesc: "शहरभर तक्रारींचे निरीक्षण करा, अधिकारी व्यवस्थापित करा आणि विश्लेषण पहा.",
        adminFeature: "शहरव्यापी विश्लेषण आणि हीटमॅप",
        adminAction: "कार्यक्षेत्र निवडा आणि लॉगिन करा →",
      },
    },

    locationSelector: {
      modalTitle: "प्रशासकीय स्थान निवडा",
      modalSubtitle: "अधिकृत कार्यक्षेत्रात प्रवेश करण्यासाठी आपले कार्यक्षेत्र निवडा",
      selectionOrderNotice: "क्रमाने प्रशासकीय स्थान निवडा: राज्य → जिल्हा → शहर → विभाग",
      stateLabel: "राज्य",
      statePlaceholder: "राज्य निवडा",
      districtLabel: "जिल्हा",
      districtPlaceholder: "जिल्हा निवडा",
      cityLabel: "शहर / नगरपालिका",
      cityPlaceholder: "शहर / नगरपालिका निवडा",
      divisionLabel: "विभाग / प्रभाग",
      divisionPlaceholder: "विभाग / प्रभाग निवडा",
      continueBtn: "लॉगिन सुरू ठेवा",
      cancelBtn: "रद्द करा",
      backBtn: "मागे",
      stepIndicator: "टप्पा {step} / 4",
      allSelectedBadge: "सर्व 4 प्रशासकीय स्तर निवडले आहेत ✓",
      missingSelectionWarning: "पुढे जाण्यासाठी कृपया सर्व स्तर (राज्य, जिल्हा, शहर आणि विभाग) निवडा.",
      demoDataNotice: "डेमो प्रशासकीय स्थान निर्देशिका. हा संदर्भ अधिकृत लॉगिनमध्ये पाठवला जाईल.",
    },

    roleLogin: {
      citizenHeading: "नागरिक लॉगिन",
      citizenSubtitle: "आपल्या तक्रारी आणि महापालिका सेवांमध्ये प्रवेश करा",
      officerHeading: "अधिकारी लॉगिन",
      officerSubtitle: "विभागीय अधिकारी कार्यक्षेत्र लॉगिन",
      adminHeading: "नगर प्रशासक लॉगिन",
      adminSubtitle: "नगर प्रशासक कमांड सेंटर लॉगिन",
      jurisdictionHeader: "प्रशासकीय स्थान संदर्भ",
      jurisdictionDesc: "या लॉगिन सत्रासाठी नियुक्त केलेले अधिकृत कार्यक्षेत्र",
      changeLocationBtn: "स्थान बदला",
      missingLocationAlert: "प्रशासकीय स्थानाचा संदर्भ आवश्यक आहे. कृपया प्रथम आपले कार्यक्षेत्र निवडा.",
      selectLocationBtn: "आता स्थान निवडा",
      unauthorizedOfficer: "अनधिकृत प्रवेश: हे पोर्टल केवळ विभागीय अधिकाऱ्यांसाठी आहे. आपले खाते अधिकारी म्हणून अधिकृत नाही.",
      unauthorizedAdmin: "अनधिकृत प्रवेश: या पोर्टलसाठी नगर प्रशासक अधिकारांची आवश्यकता आहे. आपल्या खात्यात अॅडमिन अधिकार नाहीत.",
      unauthorizedCitizen: "अनधिकृत प्रवेश: कृपया आपले नागरिक खाते वापरा.",
      officerRoleRequired: "विभागीय अधिकारी अधिकार आवश्यक आहेत.",
      adminRoleRequired: "नगर प्रशासक अधिकार आवश्यक आहेत.",
    },

    networkStatus: {
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      syncingDrafts: "मसुदे सिंक होत आहेत...",
      draftSaved: "मसुदा ऑफलाइन सेव्ह केला",
      submissionFailed: "सबमिशन अयशस्वी झाले",
      submissionSuccess: "यशस्वीरित्या सबमिट केले",
      offlineNotice: "तुम्ही सध्या ऑफलाइन आहात. थेट एआय विश्लेषण आणि पालिका मार्गदर्शनासाठी इंटरनेट आवश्यक आहे. तुम्ही तुमची तक्रार ऑफलाइन मसुदा म्हणून सेव्ह करू शकता.",
      offlineFallbackPrompt: "नेटवर्क अनुपलब्ध आहे. नंतर सबमिट करण्यासाठी ही तक्रार ऑफलाइन मसुदा म्हणून सेव्ह करू इच्छिता?",
      installApp: "अॅप इन्स्टॉल करा",
      installAppPrompt: "जलद ऑफलाइन प्रवेश आणि जलद तक्रार नोंदणीसाठी स्मार्ट सिटी एआय इन्स्टॉल करा.",
      appInstalled: "अॅप इन्स्टॉल झाले",
      offlineDraftsTitle: "ऑफलाइन तक्रार मसुदे",
      saveAsDraft: "ऑफलाइन मसुदा म्हणून सेव्ह करा",
      draftConsentLabel: "मी सबमिट होईपर्यंत हा फोटो आणि जीपीएस निर्देशांक ब्राउझर ऑफलाइन स्टोरेजमध्ये सेव्ह करण्यास संमती देतो.",
      draftConsentRequired: "फोटो आणि स्थान डेटा स्थानिक पातळीवर सेव्ह करण्यासाठी संमती आवश्यक आहे.",
      submitDraft: "सर्व्हरवर सबमिट करा",
      deleteDraft: "मसुदा हटवा",
      editDraft: "संपादित करा / पुढे सुरू ठेवा",
      noDrafts: "कोणतेही ऑफलाइन मसुदे सेव्ह केलेले नाहीत.",
      draftNotSynced: "ऑफलाइन मसुदा — सर्व्हरवर सबमिट केलेले नाही",
      aiOfflineNote: "पुन्हा कनेक्ट झाल्यावर आणि सबमिट केल्यावर एआय प्रतिमा विश्लेषण आणि मार्गनिश्चिती केली जाईल.",
      confirmDeleteDraft: "तुम्हाला हा ऑफलाइन मसुदा कायमचा हटवायचा आहे का?",
      draftSubmitSuccess: "ऑफलाइन मसुदा यशस्वीरित्या सबमिट केला आणि संबंधित विभागाकडे पाठवला गेला!",
      draftSubmitError: "मसुदा सबमिट करण्यात अयशस्वी. कृपया कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
      openDraftsBtn: "ऑफलाइन मसुदे पहा",
    },
  },
};

export const DEPARTMENT_OPTIONS = [
  { code: 'ROAD', key: 'ROAD' },
  { code: 'SANITATION', key: 'SANITATION' },
  { code: 'WATER_SUPPLY', key: 'WATER_SUPPLY' },
  { code: 'ELECTRICAL', key: 'ELECTRICAL' },
  { code: 'DRAINAGE', key: 'DRAINAGE' },
] as const;
