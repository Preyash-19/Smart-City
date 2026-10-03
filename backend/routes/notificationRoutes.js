import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/read-all', verifyToken, markAllNotificationsRead);
router.put('/:id/read', verifyToken, markNotificationRead);

export default router;
