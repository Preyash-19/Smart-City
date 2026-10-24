import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

// 1. REGISTER A NEW USER (Citizens)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const cleanEmail = String(email || '').trim().toLowerCase();

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered!" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Scramble (Hash) the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: cleanEmail,
        password: hashedPassword,
        role: role || 'CITIZEN', // Default to Citizen if no role is given
        department: department || null,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({ message: "User registered successfully! ✅", userId: newUser.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// 2. LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Check account status: INACTIVE
    if (user.status === 'INACTIVE') {
      return res.status(403).json({ 
        error: "This account has been deactivated. Please contact the City Administrator." 
      });
    }

    // Check account status: INVITED (Needs activation)
    if (user.status === 'INVITED') {
      return res.status(403).json({ 
        error: "Account invitation is pending activation. Please use the activation link sent to your official email to create your password." 
      });
    }

    // Check if the password matches
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password!" });
    }

    // Update lastLogin timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate the Digital ID Card (JWT Token) with departmentRole and status
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role, 
        department: user.department,
        departmentRole: user.departmentRole || null,
        status: user.status || 'ACTIVE'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    res.status(200).json({
      message: "Login successful! 🔓",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        departmentRole: user.departmentRole || null,
        status: user.status || 'ACTIVE',
        lastLogin: new Date()
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
};

// 3. VERIFY INVITATION / RESET TOKEN
export const verifyInvitationToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 16) {
      return res.status(400).json({ error: "Invalid invitation token format." });
    }

    const user = await prisma.user.findFirst({
      where: { invitationToken: token }
    });

    if (!user) {
      return res.status(404).json({ error: "Invitation token not found or already used." });
    }

    // Check expiration
    if (user.invitationExpires && new Date(user.invitationExpires) < new Date()) {
      return res.status(410).json({ 
        error: "Invitation link has expired. Please contact the City Administrator to resend an invitation." 
      });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        departmentRole: user.departmentRole,
        status: user.status
      }
    });

  } catch (error) {
    console.error("Error verifying invitation:", error);
    res.status(500).json({ error: "Failed to verify invitation." });
  }
};

// 4. ACTIVATE ACCOUNT & SET PASSWORD
export const activateAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Invitation token is required." });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const user = await prisma.user.findFirst({
      where: { invitationToken: token }
    });

    if (!user) {
      return res.status(404).json({ error: "Invalid invitation token or account already activated." });
    }

    if (user.invitationExpires && new Date(user.invitationExpires) < new Date()) {
      return res.status(410).json({ 
        error: "Invitation link has expired. Please contact the City Administrator to resend an invitation." 
      });
    }

    // Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user record: set ACTIVE, clear token and expiry, set lastLogin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        invitationToken: null,
        invitationExpires: null,
        lastLogin: new Date()
      }
    });

    // Auto-login upon activation: issue JWT
    const jwtToken = jwt.sign(
      {
        userId: updatedUser.id,
        role: updatedUser.role,
        department: updatedUser.department,
        departmentRole: updatedUser.departmentRole,
        status: 'ACTIVE'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Account successfully activated! Welcome to Smart City AI. 🎉",
      token: jwtToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        departmentRole: updatedUser.departmentRole,
        status: 'ACTIVE'
      }
    });

  } catch (error) {
    console.error("Account activation error:", error);
    res.status(500).json({ error: "Failed to activate account." });
  }
};

// 5. REQUEST PASSWORD RESET
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    // Always respond with a generic success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ 
        message: "If that email is registered, a password reset link has been dispatched." 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        invitationToken: resetToken,
        invitationExpires: resetExpires
      }
    });

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken
    });

    res.status(200).json({ 
      message: "If that email is registered, a password reset link has been dispatched." 
    });

  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request." });
  }
};