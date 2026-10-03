import express from 'express';
import { 
  submitComplaint, 
  getDashboardData, 
  updateStatus, 
  getMyComplaints, 
  deleteComplaint,
  submitFeedback,
  getFeedback
} from '../controllers/complaintController.js';
import { verifyToken, verifyOfficer, verifyAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Citizen Route (Only needs a basic token)
router.post('/submit', verifyToken, submitComplaint);
router.get('/my-history', verifyToken, getMyComplaints);

// Citizen Feedback Routes (Protected by verifyToken)
router.post('/:id/feedback', verifyToken, submitFeedback);
router.get('/:id/feedback', verifyToken, getFeedback);

// Officer/Admin Route (Needs the strict Officer Token)
router.get('/dashboard', verifyOfficer, getDashboardData);

// Officer Status Update Route (Requires Officer Token)
// The ":id" is a variable that represents the specific complaint ID
router.put('/:id/status', verifyOfficer, updateStatus);

// Admin Decommission Route (Requires Admin Token)
router.delete('/:id', verifyAdmin, deleteComplaint);

export default router;