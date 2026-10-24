import express from 'express';
import {
  getDepartmentUsers,
  createDepartmentUser,
  updateDepartmentUser,
  resendInvitation,
  resetUserAccess,
  getAuditLogs
} from '../controllers/departmentUserController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All department user management routes require City Admin authorization
router.get('/', verifyAdmin, getDepartmentUsers);
router.post('/', verifyAdmin, createDepartmentUser);
router.put('/:id', verifyAdmin, updateDepartmentUser);
router.post('/:id/resend-invitation', verifyAdmin, resendInvitation);
router.post('/:id/reset-password', verifyAdmin, resetUserAccess);

// Audit logs
router.get('/audit-logs', verifyAdmin, getAuditLogs);

export default router;
