import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { uploadImageBuffer, formatImageUrl } from '../services/storageService.js';
// --- NEW: Haversine Formula for GPS Distance ---
// Calculates the distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Specific Problem Type Classifier for Smart Duplicate Resolution
const getProblemType = (text) => {
  if (!text) return 'GENERAL_DEFECT';
  const lower = text.toLowerCase();
  if (lower.includes('pothole') || lower.includes('hole')) return 'POTHOLE';
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('litter') || lower.includes('filth')) return 'GARBAGE';
  if (lower.includes('leak') || lower.includes('pipe') || lower.includes('burst') || lower.includes('water')) return 'WATER_LEAK';
  if (lower.includes('light') || lower.includes('lamp') || lower.includes('wire') || lower.includes('transformer') || lower.includes('electrical') || lower.includes('spark')) return 'ELECTRICAL';
  if (lower.includes('drain') || lower.includes('clog') || lower.includes('gutter') || lower.includes('flooding')) return 'DRAINAGE';
  if (lower.includes('divider') || lower.includes('rail') || lower.includes('crack') || lower.includes('sidewalk') || lower.includes('road')) return 'ROAD_DAMAGE';
  return 'GENERAL_DEFECT';
};

// Normalized Token Text Similarity Calculator (Jaccard Index)
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'by', 'for', 
    'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'out', 'of', 'off', 
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 
    'now', 'this', 'that', 'near', 'causing', 'issue', 'problem', 'please', 'help',
    'road', 'city', 'area'
  ]);

  const tokenize = (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  };

  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  tokens1.forEach(token => {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  });

  const unionSize = new Set([...tokens1, ...tokens2]).size;
  return intersectionCount / unionSize;
};

// Configurable Geo-Spatial Duplicate Radius by Department (in meters)
export const DUPLICATE_RADIUS_BY_DEPARTMENT = {
  ROAD: 50,
  SANITATION: 100,
  WATER_SUPPLY: 100,
  DRAINAGE: 100,
  ELECTRICAL: 75,
  TRAFFIC: 100,
  OTHER: 75,
  GENERAL: 50
};
const DEFAULT_DUPLICATE_RADIUS_METERS = 50;

const DEPARTMENT_NAMES = {
  ROAD: "Roads & Potholes",
  SANITATION: "Sanitation & Garbage",
  WATER_SUPPLY: "Water Supply",
  ELECTRICAL: "Electricity & Streetlights",
  DRAINAGE: "Drainage & Sewage",
  TRAFFIC: "Traffic & Transport",
  OTHER: "Other Infrastructure",
  GENERAL: "General Civic"
};

const prisma = new PrismaClient();

// 0. UPLOAD IMAGE (Citizen Action)
export const uploadImage = async (req, res) => {
  try {
    const { image, imageBase64 } = req.body;
    const rawData = image || imageBase64;
    if (!rawData) {
      return res.status(400).json({ error: "No image payload provided." });
    }

    const matches = String(rawData).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const base64Data = matches && matches.length === 3 ? matches[2] : rawData;
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await uploadImageBuffer({ buffer });

    return res.status(200).json({
      message: "Image uploaded and stored successfully.",
      imageUrl: result.imageUrl,
      filename: result.filename,
      provider: result.provider
    });
  } catch (err) {
    console.error("Upload Error:", err.message);
    return res.status(400).json({ error: err.message || "Failed to save image." });
  }
};

// 1. SUBMIT A NEW COMPLAINT (Citizen Action)
export const submitComplaint = async (req, res) => {
  try {
    const { department, title, description, imageUrl, latitude, longitude, address, idempotencyKey } = req.body;
    const citizenId = req.user.userId || req.user.id;

    // Idempotency check for offline drafts / network retries
    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      const existing = await prisma.complaint.findUnique({
        where: { idempotencyKey: idempotencyKey.trim() }
      });
      if (existing) {
        return res.status(200).json({
          message: "Complaint already received and recorded.",
          complaint: existing,
          isDuplicate: false,
          idempotentReplay: true
        });
      }
    }

    // Validate and enforce strictly the 5 supported municipal departments
    const SUPPORTED_DEPARTMENTS = ['ROAD', 'SANITATION', 'WATER_SUPPLY', 'ELECTRICAL', 'DRAINAGE'];
    const selectedDepartment = department;

    if (!selectedDepartment || !SUPPORTED_DEPARTMENTS.includes(selectedDepartment)) {
      return res.status(400).json({ 
        error: `Department '${department}' is deprecated or not supported. Supported departments: ${SUPPORTED_DEPARTMENTS.join(', ')}` 
      });
    }

    const deptLabel = DEPARTMENT_NAMES[selectedDepartment] || selectedDepartment;
    const effectiveImageUrl = imageUrl || "";

    // Default telemetry if AI service is offline or image-only
    let aiData = {
      analysis_status: "PENDING",
      civic_relevance: "UNCERTAIN",
      issue_category: `${deptLabel} Issue`,
      predicted_department: selectedDepartment,
      classification_confidence: 0.35,
      department_match: "MATCH",
      severity: "LOW",
      severity_score: 15,
      severity_reasons: ["Visual inspection required; automated analysis service pending."],
      verification_status: "NEEDS_REVIEW",
      model_version: "v3.0-clip-vit-spatial",
      department: selectedDepartment,
      priority: 'LOW',
      evidenceScore: (effectiveImageUrl && !effectiveImageUrl.includes('placeholder')) ? 30 : 15,
      aiSummary: `Visual inspection required; automated analysis service pending.`,
      aiExplanation: `Visual analysis pending site inspection.`,
      isFake: false
    };

    // Image-based and telemetry AI analysis
    try {
      const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${aiEngineUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title || `${deptLabel} Issue`, 
          description: description || `Reported under ${deptLabel} department.`, 
          imageUrl: effectiveImageUrl,
          department: selectedDepartment 
        }) 
      });

      if (aiResponse.ok) {
        const fetchedAiData = await aiResponse.json();
        aiData = {
          ...aiData,
          ...fetchedAiData,
          department: selectedDepartment
        };
      } else {
        console.warn(`AI Engine returned status ${aiResponse.status}`);
      }
    } catch (aiErr) {
      console.warn("AI Engine service not available, proceeding with cautious review telemetry:", aiErr.message);
    }

    const isIrrelevant = (aiData.civic_relevance === 'IRRELEVANT' || aiData.civicRelevance === 'IRRELEVANT');
    const isUncertain = (aiData.civic_relevance === 'UNCERTAIN' || aiData.civicRelevance === 'UNCERTAIN');
    const isMismatch = (aiData.department_match === 'MISMATCH' || aiData.departmentMatch === 'MISMATCH');

    const predictedDept = isIrrelevant ? 'UNSUPPORTED' : (aiData.predicted_department || aiData.predictedDepartment || selectedDepartment);
    const rawCategory = aiData.issue_category || aiData.predictedIssue || `${deptLabel} Issue`;
    const predictedIssue = isIrrelevant 
      ? 'Non-Civic Media (Selfie / Unrelated)' 
      : rawCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const confidence = aiData.classification_confidence !== undefined 
      ? aiData.classification_confidence 
      : (aiData.confidence || 0.50);

    const finalSeverity = isIrrelevant ? 'REJECTED_AS_IRRELEVANT' : (aiData.severity || 'MEDIUM');
    const finalPriority = (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(aiData.priority || aiData.severity) && !isIrrelevant) 
      ? (aiData.priority || aiData.severity) 
      : 'LOW';
    const finalStatus = isIrrelevant ? 'REJECTED' : 'ROUTED';
    const finalVerificationStatus = isIrrelevant 
      ? 'REJECTED' 
      : (aiData.verification_status || aiData.verificationStatus || (isUncertain ? 'NEEDS_REVIEW' : 'PENDING'));
    
    const finalSeverityScore = isIrrelevant ? 0 : (aiData.severity_score ?? aiData.severityScore ?? 45);
    const finalEvidenceScore = isIrrelevant ? 0 : (aiData.evidenceScore ?? (isUncertain ? 25 : 85));

    let reasonsString = "";
    if (Array.isArray(aiData.severity_reasons)) {
      reasonsString = aiData.severity_reasons.join('; ');
    } else if (typeof aiData.severityReasons === 'string') {
      reasonsString = aiData.severityReasons;
    } else {
      reasonsString = isIrrelevant ? "Rejected: Non-civic content detected." : "Visual telemetry analyzed.";
    }

    const effectiveTitle = (title && typeof title === 'string' && title.trim().length > 0) 
      ? title.trim() 
      : (isIrrelevant ? "Non-Civic Media Upload" : `${predictedIssue}`);

    const effectiveDescription = (description && typeof description === 'string' && description.trim().length > 0)
      ? description.trim()
      : (aiData.aiExplanation || `Reported under ${deptLabel} department${address ? ` at ${address}` : ''}.`);

    // --- SMART DUPLICATE DETECTION (Geographic Candidate Radius + Department Match + Problem Type) ---
    // Only perform duplicate checking on valid/relevant reports
    if (!isIrrelevant && latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      const radiusMeters = DUPLICATE_RADIUS_BY_DEPARTMENT[selectedDepartment] || DEFAULT_DUPLICATE_RADIUS_METERS;
      const radiusKm = radiusMeters / 1000;

      // Query Candidate Complaints in the SAME Department
      const candidateComplaints = await prisma.complaint.findMany({
        where: {
          department: selectedDepartment,
          status: {
            in: ['ROUTED', 'IN_PROGRESS', 'SUBMITTED']
          }
        }
      });

      const newCombinedText = `${effectiveTitle} ${effectiveDescription}`;
      const newProblemType = getProblemType(newCombinedText);

      for (const existing of candidateComplaints) {
        if (existing.latitude === null || existing.latitude === undefined || 
            existing.longitude === null || existing.longitude === undefined) {
          continue;
        }

        const distanceKm = calculateDistance(latitude, longitude, existing.latitude, existing.longitude);
        
        if (distanceKm <= radiusKm) {
          const existingCombinedText = `${existing.title} ${existing.description}`;
          const existingProblemType = getProblemType(existingCombinedText);

          // Different sub-types under same department -> NOT a duplicate
          if (newProblemType !== 'GENERAL_DEFECT' && existingProblemType !== 'GENERAL_DEFECT' && newProblemType !== existingProblemType) {
            continue;
          }

          const similarityScore = calculateTextSimilarity(newCombinedText, existingCombinedText);
          const isVeryClose = distanceKm <= 0.035; // Within 35 meters

          if (similarityScore >= 0.15 || (newProblemType !== 'GENERAL_DEFECT' && newProblemType === existingProblemType) || isVeryClose) {
            await prisma.complaint.update({
              where: { id: existing.id },
              data: { reportCount: { increment: 1 } }
            });

            return res.status(200).json({ 
              message: "Duplicate Detected: Our AI confirms this infrastructure issue has already been reported and is currently active.",
              isDuplicate: true,
              existingId: existing.id
            });
          }
        }
      }
    }

    // Save to Database
    const newComplaint = await prisma.complaint.create({
      data: {
        title: effectiveTitle,
        description: effectiveDescription,
        imageUrl: effectiveImageUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || "Location coordinates provided",
        department: selectedDepartment,
        priority: finalPriority,
        severity: finalSeverity,
        aiPredictedSeverity: finalSeverity,
        severityScore: finalSeverityScore,
        confidence: confidence,
        civicRelevance: aiData.civic_relevance || aiData.civicRelevance || 'RELEVANT',
        departmentMatch: isIrrelevant ? 'NOT_APPLICABLE' : (aiData.department_match || aiData.departmentMatch || 'MATCH'),
        verificationStatus: finalVerificationStatus,
        aiPredictedDept: predictedDept,
        aiPredictedIssue: predictedIssue,
        aiExplanation: aiData.aiExplanation || (isIrrelevant ? "Photo appears to show non-civic content." : `Telemetry logged for ${deptLabel}.`),
        aiExplanationHi: aiData.aiExplanationHi || null,
        aiExplanationMr: aiData.aiExplanationMr || null,
        severityReasons: reasonsString,
        modelVersion: aiData.model_version || aiData.modelVersion || "v3.0-clip-vit-spatial",
        evidenceScore: finalEvidenceScore,
        aiSummary: aiData.aiExplanation || (isIrrelevant ? "Photo appears to show non-civic content." : `Telemetry logged for ${deptLabel}.`),
        isFake: isIrrelevant || Boolean(aiData.isFake),
        status: finalStatus,
        idempotencyKey: (idempotencyKey && typeof idempotencyKey === 'string') ? idempotencyKey.trim() : null,
        citizen: { connect: { id: citizenId } }
      }
    });

    // Create In-App Notifications for Citizen
    if (isIrrelevant) {
      await prisma.notification.create({
        data: {
          userId: citizenId,
          title: "Upload Rejected: Non-Civic Media",
          message: `The photograph attached to "${newComplaint.title}" does not appear to show a civic problem. Please upload a clear photo of the physical issue.`,
          type: "REJECTED",
          complaintId: newComplaint.id
        }
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: citizenId,
          title: "Complaint Submitted",
          message: `Your complaint "${newComplaint.title}" has been successfully registered.`,
          type: "SUBMITTED",
          complaintId: newComplaint.id
        }
      });

      await prisma.notification.create({
        data: {
          userId: citizenId,
          title: "Complaint Assigned",
          message: `Your complaint has been assigned to the ${selectedDepartment} Department. Severity: ${newComplaint.severity}.`,
          type: "ASSIGNED",
          complaintId: newComplaint.id
        }
      });

      // Notify active department officers/head about incoming complaint
      try {
        const deptOfficers = await prisma.user.findMany({
          where: {
            role: 'OFFICER',
            department: selectedDepartment,
            status: 'ACTIVE'
          },
          select: { id: true }
        });
        for (const off of deptOfficers) {
          await prisma.notification.create({
            data: {
              userId: off.id,
              title: `New ${selectedDepartment} Incident`,
              message: `New complaint logged: "${newComplaint.title}" (Severity: ${newComplaint.severity}).`,
              type: "NEW_COMPLAINT",
              complaintId: newComplaint.id
            }
          });
        }
      } catch (notifErr) {
        console.error("Error notifying department officers:", notifErr);
      }
    }

    res.status(201).json({ 
      message: isIrrelevant
        ? "Notice: The uploaded photo does not appear to show a civic issue. Please upload a suitable photograph of the problem."
        : "Incident successfully logged and routed to the proper department.", 
      complaint: newComplaint,
      aiAnalysis: aiData,
      isIrrelevant: isIrrelevant,
      departmentMismatch: isMismatch,
      suggestedDepartment: aiData.suggestedDepartment
    });

  } catch (error) {
    console.error("Submission Error Stack:", error);
    res.status(500).json({ error: "Failed to process telemetry data." });
  }
};
// 2. GET DASHBOARD DATA (Officer / Admin Action)
export const getDashboardData = async (req, res) => {
  try {
    const { role, department } = req.user;
    
    // Build the query object
    let query = {};

    // If the user is an OFFICER, strictly lock them to their department
    if (role === 'OFFICER') {
      const activeDept = department || 'ROAD';
      query.department = activeDept;
    }

    const complaints = await prisma.complaint.findMany({
      where: query,
      include: {
        assignedOfficer: {
          select: { id: true, name: true, email: true, departmentRole: true }
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' }
        },
        feedback: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ 
      message: "Telemetry fetched successfully",
      complaints 
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to load mainframe data." });
  }
};

// 3. UPDATE COMPLAINT STATUS (Officer Action)
export const updateStatus = async (req, res) => {
  try {
    // Extract the complaint ID from the URL (e.g., /api/complaints/123/status)
    const { id } = req.params;
    const { status, remark, humanVerified, humanRemarks, severityOverride } = req.body;

    // Ensure only Officers or Admins are doing this
    if (req.user.role === 'CITIZEN') {
      return res.status(403).json({ error: "Citizens cannot update official status." });
    }

    // Check existing complaint to record previous status and citizenId
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: id }
    });

    if (!existingComplaint) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    // Strict Cross-Department Access Enforcement:
    // If the requester is an OFFICER, their department MUST match the complaint's department
    if (req.user.role === 'OFFICER') {
      if (req.user.department !== existingComplaint.department) {
        return res.status(403).json({ 
          error: `Access Denied: You belong to ${req.user.department} and cannot modify complaints in ${existingComplaint.department}.` 
        });
      }
      // If staff role, cannot mark RESOLVED or REJECTED unless higher role
      if (req.user.departmentRole === 'STAFF' && (status === 'REJECTED' || status === 'RESOLVED')) {
        return res.status(403).json({
          error: "Permission Denied: Department Staff cannot mark complaints as Resolved or Rejected. Only Department Head or Officer can approve final resolution."
        });
      }
    }

    const previousStatus = existingComplaint.status;

    const updateData = { status: status };
    if (humanVerified !== undefined) {
      updateData.humanVerified = Boolean(humanVerified);
      updateData.verificationStatus = Boolean(humanVerified) ? 'VERIFIED' : 'PENDING';
    }
    if (humanRemarks) {
      updateData.humanRemarks = humanRemarks;
    }
    if (severityOverride && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severityOverride)) {
      updateData.severity = severityOverride;
      updateData.priority = severityOverride;
    }

    // Update the master record in the database
    const updatedComplaint = await prisma.complaint.update({
      where: { id: id },
      data: updateData,
      include: {
        assignedOfficer: {
          select: { id: true, name: true, email: true, departmentRole: true }
        }
      }
    });

    // Create a timeline log so the Citizen can see exactly when it changed
    await prisma.statusLog.create({
      data: {
        status: status,
        remarks: remark || `Status updated to ${status} by ${req.user.name || req.user.role} (${req.user.departmentRole || req.user.role})`,
        complaintId: id
      }
    });

    // Create status change notification ONLY if status actually changed
    if (previousStatus !== status) {
      let notifTitle = "Complaint Status Updated";
      let notifMessage = `Your complaint "${existingComplaint.title}" status changed to ${status}.`;

      if (status === 'IN_PROGRESS') {
        notifTitle = "Complaint In Progress";
        notifMessage = `Work has started on your complaint "${existingComplaint.title}".`;
      } else if (status === 'RESOLVED') {
        notifTitle = "Complaint Resolved";
        notifMessage = `Your complaint "${existingComplaint.title}" has been marked as resolved.`;
      } else if (status === 'REJECTED') {
        notifTitle = "Complaint Rejected";
        notifMessage = `Your complaint "${existingComplaint.title}" was reviewed and rejected.`;
      } else if (status === 'DUPLICATE') {
        notifTitle = "Duplicate Identified";
        notifMessage = `Your complaint "${existingComplaint.title}" was identified as a duplicate of an active incident.`;
      }

      if (remark) {
        notifMessage += ` Remarks: ${remark}`;
      }

      await prisma.notification.create({
        data: {
          userId: existingComplaint.citizenId,
          title: notifTitle,
          message: notifMessage,
          type: "STATUS_UPDATE",
          complaintId: id
        }
      });
    }

    res.status(200).json({ 
      message: `System updated: Incident marked as ${status}`, 
      complaint: updatedComplaint 
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update incident status." });
  }
};

// 3B. UPDATE COMPLAINT SEVERITY (Admin & Officer Action - 3 Active Levels: HIGH, MEDIUM, LOW)
export const updateSeverity = async (req, res) => {
  try {
    const { id } = req.params;
    const { severity } = req.body;

    // Check authorization: only ADMIN or OFFICER
    if (req.user.role !== 'ADMIN' && req.user.role !== 'OFFICER') {
      return res.status(403).json({ error: "Access Denied: Only Administrators and Officers can modify complaint severity." });
    }

    // Strictly enforce 3 active levels: HIGH, MEDIUM, LOW
    const ALLOWED_SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'];
    if (!severity || !ALLOWED_SEVERITIES.includes(String(severity).trim().toUpperCase())) {
      return res.status(400).json({ 
        error: `Invalid severity level '${severity}'. Allowed values are: ${ALLOWED_SEVERITIES.join(', ')}.` 
      });
    }

    const cleanSeverity = String(severity).trim().toUpperCase();

    // Check existing complaint
    const existing = await prisma.complaint.findUnique({
      where: { id: id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    // Check if rejected non-civic media: do not allow normal civic severity assignment
    const isRejected = existing.status === 'REJECTED' || 
                       existing.civicRelevance === 'IRRELEVANT' || 
                       existing.severity === 'REJECTED_AS_IRRELEVANT';
    if (isRejected) {
      return res.status(400).json({ 
        error: "Cannot assign civic severity to a rejected non-civic media upload." 
      });
    }

    // Check if needs review and not human verified
    const isUnverified = (existing.verificationStatus === 'NEEDS_REVIEW' || existing.civicRelevance === 'UNCERTAIN') && !existing.humanVerified;
    if (isUnverified && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        error: "This complaint is pending verification review. Please review and verify the complaint before updating severity."
      });
    }

    // Strict Cross-Department Access Enforcement for Officers:
    if (req.user.role === 'OFFICER') {
      if (req.user.department && req.user.department !== existing.department) {
        return res.status(403).json({ 
          error: `Access Denied: You belong to ${req.user.department} and cannot modify complaints in ${existing.department}.` 
        });
      }
    }

    const prevSeverity = existing.severity;

    // Map calibrated severity score
    const newScore = cleanSeverity === 'HIGH' ? 85 : (cleanSeverity === 'MEDIUM' ? 50 : 25);

    // Keep original AI-assessed severity separate from Admin-assigned severity
    const aiSeverityToStore = existing.aiPredictedSeverity || prevSeverity || cleanSeverity;

    const updatedComplaint = await prisma.complaint.update({
      where: { id: id },
      data: {
        severity: cleanSeverity,
        priority: cleanSeverity,
        severityScore: newScore,
        aiPredictedSeverity: aiSeverityToStore
      },
      include: {
        assignedOfficer: {
          select: { id: true, name: true, email: true, departmentRole: true }
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' }
        },
        feedback: true
      }
    });

    // Record in statusLogs for persistent audit trail
    await prisma.statusLog.create({
      data: {
        status: existing.status,
        remarks: `Severity updated from ${prevSeverity} to ${cleanSeverity} by ${req.user.name || req.user.role} (${req.user.departmentRole || req.user.role})`,
        complaintId: id
      }
    });

    // Notify citizen of priority update if changed
    if (prevSeverity !== cleanSeverity) {
      try {
        await prisma.notification.create({
          data: {
            userId: existing.citizenId,
            title: "Complaint Severity Updated",
            message: `The priority for your complaint "${existing.title}" was set to ${cleanSeverity}.`,
            type: "SEVERITY_UPDATE",
            complaintId: id
          }
        });
      } catch (notifErr) {
        console.warn("Notification skipped:", notifErr.message);
      }
    }

    res.status(200).json({
      message: `Severity successfully updated to ${cleanSeverity}.`,
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error("Error updating severity:", error);
    res.status(500).json({ error: "Failed to update complaint severity." });
  }
};

// 4. GET CITIZEN'S OWN COMPLAINTS (Citizen Action)
export const getMyComplaints = async (req, res) => {
  try {
    // Extract the citizen's ID from their secure token
    const citizenId = req.user.userId || req.user.id;

    // Ask PostgreSQL/SQLite for only this specific user's complaints with feedback
    const complaints = await prisma.complaint.findMany({
      where: { citizenId: citizenId },
      include: {
        feedback: true
      },
      orderBy: { createdAt: 'desc' } // Show newest first
    });

    res.status(200).json({
      message: "Fetched citizen history successfully",
      complaints: complaints
    });

  } catch (error) {
    console.error("Error fetching citizen complaints:", error);
    res.status(500).json({ error: "Failed to load your complaint history." });
  }
};

// 5. DELETE A COMPLAINT (Admin Override Action)
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    // Unlink duplicates where this was the master complaint
    await prisma.complaint.updateMany({
      where: { masterComplaintId: id },
      data: { masterComplaintId: null }
    });

    // Delete the complaint (Prisma schema cascade deletes logs/feedback)
    await prisma.complaint.delete({
      where: { id: id }
    });

    res.status(200).json({
      message: "Signal decommissioned and purged from database successfully. 🗑️"
    });

  } catch (error) {
    console.error("Error decommissioning complaint:", error);
    res.status(500).json({ error: "Failed to purge signal from database." });
  }
};

// 6. SUBMIT FEEDBACK FOR RESOLVED COMPLAINT (Citizen Action)
export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, comments } = req.body;
    const citizenId = req.user.userId || req.user.id;

    // 1. Validate rating: integer between 1 and 5
    const parsedRating = Number(rating);
    if (
      rating === undefined ||
      rating === null ||
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        error: "A valid rating between 1 and 5 is required."
      });
    }

    // 2. Find complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { feedback: true }
    });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    // 3. Security: Check complaint belongs to authenticated citizen
    if (complaint.citizenId !== citizenId) {
      return res.status(403).json({
        error: "Access Denied: You can only submit feedback for your own complaints."
      });
    }

    // 4. Verify complaint status is RESOLVED
    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({
        error: "Feedback can only be submitted for complaints marked as RESOLVED."
      });
    }

    // 5. Verify feedback doesn't already exist (One feedback per complaint)
    if (complaint.feedback) {
      return res.status(409).json({
        error: "Feedback has already been submitted for this complaint."
      });
    }

    // 6. Optional comment/comments
    const feedbackComment = comment !== undefined ? comment : comments;
    const cleanComments = feedbackComment && typeof feedbackComment === 'string' && feedbackComment.trim().length > 0
      ? feedbackComment.trim()
      : null;

    // 7. Save feedback
    const newFeedback = await prisma.feedback.create({
      data: {
        rating: parsedRating,
        comments: cleanComments,
        complaintId: id,
        userId: citizenId
      }
    });

    res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback: newFeedback
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: "Feedback has already been submitted for this complaint."
      });
    }
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback." });
  }
};

// 7. GET FEEDBACK FOR COMPLAINT (Citizen / Owner Action)
export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const citizenId = req.user.userId || req.user.id;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { feedback: true }
    });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    // Security check: Only the complaint owner (or admin) can view this feedback
    if (complaint.citizenId !== citizenId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: "Access Denied: You can only view feedback for your own complaints."
      });
    }

    if (!complaint.feedback) {
      return res.status(404).json({
        message: "No feedback found for this complaint.",
        feedback: null
      });
    }

    res.status(200).json({
      feedback: complaint.feedback
    });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
};

// 8. REASSIGN DEPARTMENT (City Admin Action)
export const reassignDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, reason } = req.body;
    const adminId = req.user.userId || req.user.id;

    const SUPPORTED_DEPARTMENTS = ['ROAD', 'SANITATION', 'WATER_SUPPLY', 'ELECTRICAL', 'DRAINAGE'];
    if (!department || !SUPPORTED_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ error: `Cannot reassign to '${department}'. Supported departments: ${SUPPORTED_DEPARTMENTS.join(', ')}` });
    }

    const existing = await prisma.complaint.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    const prevDept = existing.department;

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        department: department,
        assignedOfficerId: null // Reset assignment on department transfer
      },
      include: {
        assignedOfficer: {
          select: { id: true, name: true, email: true, departmentRole: true }
        }
      }
    });

    // Create status log
    await prisma.statusLog.create({
      data: {
        status: existing.status,
        remarks: `Department administratively reassigned from ${prevDept} to ${department}. Reason: ${reason || 'Administrative routing override'} (by City Admin)`,
        complaintId: id
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: adminId ? String(adminId) : null,
        adminName: req.user.name || 'City Admin',
        action: 'DEPARTMENT_REASSIGNMENT',
        targetId: id,
        details: JSON.stringify({
          fromDepartment: prevDept,
          toDepartment: department,
          reason: reason || 'City Admin override',
          complaintTitle: existing.title
        })
      }
    });

    // Notify citizen
    await prisma.notification.create({
      data: {
        userId: existing.citizenId,
        title: "Department Assignment Updated",
        message: `Your complaint "${existing.title}" was reassigned to the ${DEPARTMENT_NAMES[department] || department} department. Reason: ${reason || 'Administrative routing override'}.`,
        type: "ROUTED",
        complaintId: id
      }
    });

    // Notify target department officers
    try {
      const newOfficers = await prisma.user.findMany({
        where: { role: 'OFFICER', department: department, status: 'ACTIVE' },
        select: { id: true }
      });
      for (const off of newOfficers) {
        await prisma.notification.create({
          data: {
            userId: off.id,
            title: `Reassigned Incident: ${department}`,
            message: `Complaint "${existing.title}" reassigned to your department by City Admin.`,
            type: "ROUTED",
            complaintId: id
          }
        });
      }
    } catch (e) {
      console.error("Error notifying new department officers:", e);
    }

    res.status(200).json({
      message: `Complaint reassigned successfully from ${prevDept} to ${department}`,
      complaint: updated
    });
  } catch (error) {
    console.error("Error reassigning department:", error);
    res.status(500).json({ error: "Failed to reassign department." });
  }
};

// 9. ASSIGN COMPLAINT TO OFFICER (Department Head or Admin Action)
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id }
    });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    // Role check: Admin OR Department Head of the SAME department
    if (req.user.role !== 'ADMIN') {
      if (req.user.role !== 'OFFICER' || req.user.departmentRole !== 'HEAD' || req.user.department !== complaint.department) {
        return res.status(403).json({ 
          error: "Access Denied: Only City Admin or Department Head of this department can assign complaints." 
        });
      }
    }

    // If unassigning
    if (!officerId) {
      const updated = await prisma.complaint.update({
        where: { id },
        data: { assignedOfficerId: null }
      });
      return res.status(200).json({ message: "Complaint unassigned.", complaint: updated });
    }

    // Verify target officer
    const targetOfficer = await prisma.user.findUnique({
      where: { id: officerId }
    });

    if (!targetOfficer || targetOfficer.role !== 'OFFICER') {
      return res.status(400).json({ error: "Invalid officer selected." });
    }

    if (targetOfficer.department !== complaint.department) {
      return res.status(400).json({ 
        error: `Officer belongs to ${targetOfficer.department}, but this complaint is in ${complaint.department}.` 
      });
    }

    if (targetOfficer.status === 'INACTIVE') {
      return res.status(400).json({ error: "Cannot assign complaint to a deactivated user." });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: { assignedOfficerId: officerId },
      include: {
        assignedOfficer: {
          select: { id: true, name: true, email: true, departmentRole: true }
        }
      }
    });

    // Create status log
    await prisma.statusLog.create({
      data: {
        status: complaint.status,
        remarks: `Complaint assigned to ${targetOfficer.name} (${targetOfficer.departmentRole}) by ${req.user.name || req.user.role}`,
        complaintId: id
      }
    });

    // Notify assigned officer
    await prisma.notification.create({
      data: {
        userId: officerId,
        title: "Complaint Assigned To You",
        message: `You have been assigned to handle complaint: "${complaint.title}" (${complaint.priority} priority).`,
        type: "ASSIGNED",
        complaintId: id
      }
    });

    res.status(200).json({
      message: `Assigned successfully to ${targetOfficer.name}`,
      complaint: updated
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    res.status(500).json({ error: "Failed to assign complaint." });
  }
};

// 10. GET ACTIVE OFFICERS OF A DEPARTMENT (For Assignment Dropdowns)
export const getDepartmentOfficers = async (req, res) => {
  try {
    const { department } = req.params;

    // Security check: Officers can only query their own department officers unless Admin
    if (req.user.role === 'OFFICER' && req.user.department !== department) {
      return res.status(403).json({ error: "Access Denied: Cannot view officers of other departments." });
    }

    const officers = await prisma.user.findMany({
      where: {
        role: 'OFFICER',
        department: department,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        departmentRole: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ officers });
  } catch (error) {
    console.error("Error fetching department officers:", error);
    res.status(500).json({ error: "Failed to fetch department officers." });
  }
};