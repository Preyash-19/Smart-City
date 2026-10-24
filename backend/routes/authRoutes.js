import express from 'express';
import { 
  registerUser, 
  loginUser, 
  verifyInvitationToken, 
  activateAccount, 
  requestPasswordReset 
} from '../controllers/authController.js';

const router = express.Router();

// Define the endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);

// Account activation and invitation verification
router.get('/verify-invitation/:token', verifyInvitationToken);
router.post('/activate', activateAccount);
router.post('/request-password-reset', requestPasswordReset);

export default router;