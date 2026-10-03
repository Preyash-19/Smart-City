import { PrismaClient } from '@prisma/client';
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
  if (!text) return 'OTHER';
  const lower = text.toLowerCase();
  if (lower.includes('pothole') || lower.includes('hole')) return 'POTHOLE';
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('litter') || lower.includes('filth')) return 'GARBAGE';
  if (lower.includes('leak') || lower.includes('pipe') || lower.includes('burst') || lower.includes('water')) return 'WATER_LEAK';
  if (lower.includes('light') || lower.includes('lamp') || lower.includes('wire') || lower.includes('transformer') || lower.includes('electrical') || lower.includes('spark')) return 'ELECTRICAL';
  if (lower.includes('drain') || lower.includes('clog') || lower.includes('gutter') || lower.includes('flooding')) return 'DRAINAGE';
  if (lower.includes('signal') || lower.includes('traffic') || lower.includes('congestion')) return 'TRAFFIC_SIGNAL';
  if (lower.includes('divider') || lower.includes('rail') || lower.includes('crack') || lower.includes('sidewalk') || lower.includes('road')) return 'ROAD_DAMAGE';
  return 'OTHER';
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
  TRAFFIC: 100
};
const DEFAULT_DUPLICATE_RADIUS_METERS = 50;

const prisma = new PrismaClient();

// 1. SUBMIT A NEW COMPLAINT (Citizen Action)
export const submitComplaint = async (req, res) => {
  try {
    const { title, description, imageUrl, latitude, longitude, address } = req.body;
    const citizenId = req.user.userId || req.user.id;

    // We now send the title, description, AND the Cloudinary imageUrl to Python
    const aiResponse = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, imageUrl }) 
    });

    if (!aiResponse.ok) {
      throw new Error("AI Engine is down or failed to respond.");
    }

    const aiData = await aiResponse.json();

    // --- SMART DUPLICATE DETECTION (Geographic Candidate Radius + Department Match + Problem Type + Text Similarity) ---
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      const radiusMeters = DUPLICATE_RADIUS_BY_DEPARTMENT[aiData.department] || DEFAULT_DUPLICATE_RADIUS_METERS;
      const radiusKm = radiusMeters / 1000;

      // STEP A: Query Candidate Complaints in the SAME Department (Geographic Candidate Pool)
      const candidateComplaints = await prisma.complaint.findMany({
        where: {
          department: aiData.department, // Must belong to same department
          status: {
            in: ['ROUTED', 'IN_PROGRESS'] // Active, unresolved complaints
          }
        }
      });

      const newCombinedText = `${title} ${description}`;
      const newProblemType = getProblemType(newCombinedText);

      // STEP B: Evaluate candidates using Proximity + Problem Category + Text Similarity
      for (const existing of candidateComplaints) {
        if (existing.latitude === null || existing.latitude === undefined || 
            existing.longitude === null || existing.longitude === undefined) {
          continue; // Skip complaints without valid coordinates
        }

        // Criterion 1: Geographic Proximity (Distance <= Department Candidate Radius)
        const distanceKm = calculateDistance(latitude, longitude, existing.latitude, existing.longitude);
        
        if (distanceKm <= radiusKm) {
          const existingCombinedText = `${existing.title} ${existing.description}`;
          const existingProblemType = getProblemType(existingCombinedText);

          // Criterion 2: Specific Problem Sub-type Match (e.g. Pothole vs Road Divider)
          if (newProblemType !== 'OTHER' && existingProblemType !== 'OTHER' && newProblemType !== existingProblemType) {
            continue; // Different problem sub-types under same department (e.g. Pothole vs Divider) -> NOT a duplicate!
          }

          // Criterion 3: Text / Semantic Problem Similarity Threshold (Jaccard >= 0.15)
          const similarityScore = calculateTextSimilarity(newCombinedText, existingCombinedText);

          if (similarityScore >= 0.15 || (newProblemType !== 'OTHER' && newProblemType === existingProblemType)) {
            // Confirm Duplicate: Increment report count & link master record
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

    // --- ORIGINAL: Save to Database (If no duplicate found) ---
    const newComplaint = await prisma.complaint.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || "",
        latitude,
        longitude,
        address,
        department: aiData.department,
        priority: aiData.priority,
        evidenceScore: aiData.evidenceScore,
        aiSummary: aiData.aiSummary,
        isFake: aiData.isFake,
        status: 'ROUTED',
        citizen: { connect: { id: citizenId } }
      }
    });

    // --- NEW: Create In-App Notifications for Citizen ---
    await prisma.notification.create({
      data: {
        userId: citizenId,
        title: "Complaint Submitted",
        message: `Your complaint "${newComplaint.title}" has been successfully registered.`,
        type: "SUBMITTED",
        complaintId: newComplaint.id
      }
    });

    if (aiData.department) {
      await prisma.notification.create({
        data: {
          userId: citizenId,
          title: "Complaint Assigned",
          message: `Your complaint has been assigned to the ${aiData.department} Department.`,
          type: "ASSIGNED",
          complaintId: newComplaint.id
        }
      });
    }

    res.status(201).json({ 
      message: "Incident successfully logged and routed to the proper department.", 
      complaint: newComplaint 
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

    // If the user is a standard OFFICER, lock them to their department
    // If they are an ADMIN, leave the query empty so they see EVERYTHING
    if (role === 'OFFICER' && department) {
      query.department = department;
    }

    const complaints = await prisma.complaint.findMany({
      where: query,
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
    const { status, remark } = req.body;

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

    const previousStatus = existingComplaint.status;

    // Update the master record in the database
    const updatedComplaint = await prisma.complaint.update({
      where: { id: id },
      data: { status: status }
    });

    // Create a timeline log so the Citizen can see exactly when it changed
    await prisma.statusLog.create({
      data: {
        status: status,
        remarks: remark || `Status updated to ${status} by ${req.user.role}`,
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