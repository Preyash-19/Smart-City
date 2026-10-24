import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { sendInvitationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

export const VALID_DEPARTMENTS = [
  'ROAD',
  'SANITATION',
  'WATER_SUPPLY',
  'ELECTRICAL',
  'DRAINAGE'
];

const VALID_DEPARTMENT_ROLES = ['HEAD', 'OFFICER', 'STAFF'];

// Helper to log admin actions
export const createAuditLog = async ({ adminId, adminName, action, targetId, targetEmail, details }) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: adminId ? String(adminId) : null,
        adminName: adminName || null,
        action,
        targetId: targetId ? String(targetId) : null,
        targetEmail: targetEmail || null,
        details: typeof details === 'object' ? JSON.stringify(details) : details
      }
    });
  } catch (err) {
    console.error('AuditLog creation error:', err);
  }
};

// 1. GET ALL DEPARTMENT USERS (Admin Only)
export const getDepartmentUsers = async (req, res) => {
  try {
    const { search, department, role, status } = req.query;

    const where = {
      role: 'OFFICER'
    };

    if (department && department !== 'ALL') {
      where.department = department;
    }

    if (role && role !== 'ALL') {
      where.departmentRole = role;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        departmentRole: true,
        status: true,
        invitationToken: true,
        invitationExpires: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { officerComplaints: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mask sensitive token data but expose whether invitation is pending and valid
    const now = new Date();
    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      departmentRole: u.departmentRole || 'OFFICER',
      status: u.status || 'ACTIVE',
      hasPendingInvitation: Boolean(u.invitationToken && u.invitationExpires && u.invitationExpires > now),
      invitationExpired: Boolean(u.invitationToken && u.invitationExpires && u.invitationExpires <= now),
      invitationExpires: u.invitationExpires,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      assignedComplaintsCount: u._count.officerComplaints
    }));

    res.status(200).json({
      message: 'Department users retrieved successfully',
      users: sanitized
    });
  } catch (error) {
    console.error('Error fetching department users:', error);
    res.status(500).json({ error: 'Failed to retrieve department users' });
  }
};

// 2. CREATE A NEW DEPARTMENT USER (Admin Only)
export const createDepartmentUser = async (req, res) => {
  try {
    const { name, email, department, departmentRole, status, temporaryPassword } = req.body;
    const adminId = req.user.userId || req.user.id;
    const adminName = req.user.name || 'City Admin';

    // 1. Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'A valid full name (minimum 2 characters) is required.' });
    }

    // 2. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'A valid official email address is required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    // 3. Validate department
    if (!department || !VALID_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ 
        error: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}.` 
      });
    }

    // 4. Validate department role
    const effectiveDeptRole = (departmentRole || 'OFFICER').toUpperCase();
    if (!VALID_DEPARTMENT_ROLES.includes(effectiveDeptRole)) {
      return res.status(400).json({ 
        error: `Invalid department role. Must be one of: ${VALID_DEPARTMENT_ROLES.join(', ')}.` 
      });
    }

    // 5. Prevent duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existing) {
      return res.status(409).json({ 
        error: `An account with email "${cleanEmail}" already exists in the system.` 
      });
    }

    // 6. Generate activation token & handle password
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const initialStatus = status === 'ACTIVE' ? 'ACTIVE' : 'INVITED';

    // Hash a placeholder password or the provided temporary password
    const salt = await bcrypt.genSalt(10);
    const passToHash = temporaryPassword && temporaryPassword.length >= 8 
      ? temporaryPassword 
      : crypto.randomBytes(24).toString('base64');
    const hashedPassword = await bcrypt.hash(passToHash, salt);

    // 7. Create user record
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'OFFICER',
        department,
        departmentRole: effectiveDeptRole,
        status: initialStatus,
        invitationToken: initialStatus === 'INVITED' ? invitationToken : null,
        invitationExpires: initialStatus === 'INVITED' ? invitationExpires : null
      }
    });

    // 8. Send invitation email if invited or requested
    let emailResult = { sent: false, configured: false };
    if (initialStatus === 'INVITED') {
      emailResult = await sendInvitationEmail({
        email: cleanEmail,
        name: newUser.name,
        department,
        departmentRole: effectiveDeptRole,
        invitationToken,
        token: invitationToken
      });
    }

    // 9. Audit log entry
    await createAuditLog({
      adminId,
      adminName,
      action: 'CREATE_DEPARTMENT_USER',
      targetId: newUser.id,
      targetEmail: newUser.email,
      details: {
        name: newUser.name,
        email: newUser.email,
        department,
        departmentRole: effectiveDeptRole,
        status: initialStatus,
        emailSent: emailResult.sent,
        emailConfigured: emailResult.configured
      }
    });

    res.status(201).json({
      message: 'Department user created successfully! ✅',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        departmentRole: newUser.departmentRole,
        status: newUser.status,
        createdAt: newUser.createdAt
      },
      emailDelivery: {
        sent: emailResult.sent,
        configured: emailResult.configured,
        message: emailResult.sent 
          ? `Invitation sent successfully to ${cleanEmail}`
          : (emailResult.reason || 'SMTP service unconfigured. Use activation link from console/response.'),
        activationUrl: emailResult.activationUrl || null
      }
    });

  } catch (error) {
    console.error('Error creating department user:', error);
    res.status(500).json({ error: 'Failed to create department user account.' });
  }
};

// 3. UPDATE DEPARTMENT USER (Admin Only)
export const updateDepartmentUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, departmentRole, status } = req.body;
    const adminId = req.user.userId || req.user.id;
    const adminName = req.user.name || 'City Admin';

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Department user not found.' });
    }

    // Self-Protection check: Prevent Admin from locking themselves out
    if (id === adminId) {
      if (status === 'INACTIVE') {
        return res.status(403).json({ error: 'Security restriction: You cannot deactivate your own administrative account.' });
      }
    }

    const updateData = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (department) {
      if (!VALID_DEPARTMENTS.includes(department)) {
        return res.status(400).json({ error: `Invalid department: ${department}` });
      }
      updateData.department = department;
    }

    if (departmentRole) {
      const cleanRole = departmentRole.toUpperCase();
      if (!VALID_DEPARTMENT_ROLES.includes(cleanRole)) {
        return res.status(400).json({ error: `Invalid department role: ${departmentRole}` });
      }
      updateData.departmentRole = cleanRole;
    }

    if (status) {
      if (!['ACTIVE', 'INACTIVE', 'INVITED'].includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status}` });
      }
      updateData.status = status;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        departmentRole: true,
        status: true,
        lastLogin: true,
        updatedAt: true
      }
    });

    await createAuditLog({
      adminId,
      adminName,
      action: 'UPDATE_DEPARTMENT_USER',
      targetId: id,
      targetEmail: existingUser.email,
      details: {
        previous: {
          name: existingUser.name,
          department: existingUser.department,
          departmentRole: existingUser.departmentRole,
          status: existingUser.status
        },
        updated: updateData
      }
    });

    res.status(200).json({
      message: 'Department user updated successfully! ✅',
      user: updated
    });

  } catch (error) {
    console.error('Error updating department user:', error);
    res.status(500).json({ error: 'Failed to update department user.' });
  }
};

// 4. RESEND INVITATION (Admin Only)
export const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId || req.user.id;
    const adminName = req.user.name || 'City Admin';

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(400).json({ error: 'Cannot send invitation to a deactivated account. Please activate it first.' });
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id },
      data: {
        invitationToken: newToken,
        invitationExpires: newExpires,
        status: 'INVITED'
      }
    });

    const emailResult = await sendInvitationEmail({
      email: user.email,
      name: user.name,
      department: user.department || 'ROAD',
      departmentRole: user.departmentRole || 'OFFICER',
      invitationToken: newToken,
      token: newToken
    });

    await createAuditLog({
      adminId,
      adminName,
      action: 'RESEND_INVITATION',
      targetId: id,
      targetEmail: user.email,
      details: { email: user.email, emailResult }
    });

    res.status(200).json({
      message: emailResult.sent
        ? `Invitation successfully resent to ${user.email} ✉️`
        : `Invitation regenerated. (SMTP not configured)`,
      emailDelivery: {
        sent: emailResult.sent,
        configured: emailResult.configured,
        message: emailResult.sent 
          ? `Invitation sent to ${user.email}` 
          : (emailResult.reason || 'SMTP unconfigured. See console or link below.'),
        activationUrl: emailResult.activationUrl || null
      }
    });

  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ error: 'Failed to resend invitation.' });
  }
};

// 5. RESET USER ACCESS / SEND PASSWORD RESET (Admin Only)
export const resetUserAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId || req.user.id;
    const adminName = req.user.name || 'City Admin';

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id },
      data: {
        invitationToken: resetToken,
        invitationExpires: resetExpires
      }
    });

    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken,
      token: resetToken
    });

    await createAuditLog({
      adminId,
      adminName,
      action: 'RESET_USER_ACCESS',
      targetId: id,
      targetEmail: user.email,
      details: { email: user.email, emailResult }
    });

    res.status(200).json({
      message: emailResult.sent 
        ? `Password reset link sent to ${user.email} 🔒` 
        : `Reset link generated. (SMTP unconfigured)`,
      emailDelivery: {
        sent: emailResult.sent,
        configured: emailResult.configured,
        resetUrl: emailResult.resetUrl || null
      }
    });

  } catch (error) {
    console.error('Error resetting user access:', error);
    res.status(500).json({ error: 'Failed to initiate password reset.' });
  }
};

// 6. GET AUDIT LOGS (Admin Only)
export const getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, action } = req.query;

    const where = {};
    if (action && action !== 'ALL') where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      take: Math.min(parseInt(limit, 10) || 50, 100),
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      logs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
};
