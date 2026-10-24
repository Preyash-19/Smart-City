import express from 'express';
import { 
  submitComplaint, 
  getDashboardData, 
  updateStatus, 
  getMyComplaints, 
  deleteComplaint,
  submitFeedback,
  getFeedback,
  uploadImage,
  reassignDepartment,
  assignComplaint,
  getDepartmentOfficers,
  updateSeverity
} from '../controllers/complaintController.js';
import { verifyToken, verifyOfficer, verifyAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Citizen Route (Only needs a basic token)
router.post('/upload-image', verifyToken, uploadImage);
router.post('/submit', verifyToken, submitComplaint);
router.get('/my-history', verifyToken, getMyComplaints);

// Citizen Feedback Routes (Protected by verifyToken)
router.post('/:id/feedback', verifyToken, submitFeedback);
router.get('/:id/feedback', verifyToken, getFeedback);

// Officer/Admin Route (Needs Officer Token)
router.get('/dashboard', verifyOfficer, getDashboardData);
router.get('/department-officers/:department', verifyOfficer, getDepartmentOfficers);

// Officer Status Update Route (Requires Officer Token)
router.put('/:id/status', verifyOfficer, updateStatus);

// Severity Update Route (Requires Admin / Officer Token)
router.put('/:id/severity', verifyOfficer, updateSeverity);

// Department Assignment by Head or Admin
router.put('/:id/assign', verifyOfficer, assignComplaint);

// Admin Department Reassignment Route
router.put('/:id/reassign-department', verifyAdmin, reassignDepartment);

// Admin Decommission Route (Requires Admin Token)
router.delete('/:id', verifyAdmin, deleteComplaint);

export default router;