import nodemailer from 'nodemailer';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const DEPARTMENT_LABELS = {
  ROAD: 'Roads & Potholes',
  SANITATION: 'Sanitation & Garbage',
  WATER_SUPPLY: 'Water Supply',
  ELECTRICAL: 'Electricity & Streetlights',
  DRAINAGE: 'Drainage & Sewage',
  // Historical / Legacy fallback
  TRAFFIC: 'Traffic & Transport (Legacy)',
  OTHER: 'Other Civic Infrastructure (Legacy)'
};

const ROLE_LABELS = {
  HEAD: 'Department Head',
  OFFICER: 'Department Officer',
  STAFF: 'Department Staff'
};

/**
 * Checks whether SMTP environment variables are configured.
 */
export const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

/**
 * Creates nodemailer transport if configured.
 */
const getTransporter = () => {
  if (!isSmtpConfigured()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Dispatches an account invitation and password setup email.
 */
export const sendInvitationEmail = async ({ email, name, department, departmentRole, token, invitationToken }) => {
  const actualToken = token || invitationToken;
  const activationUrl = `${APP_URL}/activate?token=${encodeURIComponent(actualToken || '')}`;
  const deptName = DEPARTMENT_LABELS[department] || department;
  const roleName = ROLE_LABELS[departmentRole] || departmentRole;

  console.log('------------------------------------------------------------');
  console.log(`✉️ [Email Service] New Department Invitation Prepared`);
  console.log(`   To: ${name} <${email}>`);
  console.log(`   Department: ${deptName} (${department})`);
  console.log(`   Role: ${roleName} (${departmentRole})`);
  console.log(`   Activation URL: ${activationUrl}`);
  console.log('------------------------------------------------------------');

  const transporter = getTransporter();

  if (!transporter) {
    return {
      sent: false,
      configured: false,
      activationUrl,
      reason: 'SMTP configuration is not set in backend/.env (SMTP_HOST, SMTP_USER, SMTP_PASS). Activation link logged for manual setup.'
    };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || '"Smart City Administration" <no-reply@smartcity.gov>';
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Official Invitation: Access to Smart City ${deptName} Department`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Smart City Governance Mainframe</h2>
          <p style="color: #475569; font-size: 14px;">Official Department Account Invitation</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #1e293b; font-size: 15px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #334155; line-height: 1.6;">
            You have been officially appointed as <strong>${roleName}</strong> in the <strong>${deptName}</strong> Department by the City Administrator.
          </p>
          <p style="color: #334155; line-height: 1.6;">
            Please activate your account and establish your secure credentials using the link below:
          </p>
          <div style="margin: 24px 0;">
            <a href="${activationUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Activate Department Account
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px;">This secure invitation link is valid for 7 days. If you did not expect this invitation, please inform your department supervisor immediately.</p>
        </div>
      `
    });

    return {
      sent: true,
      configured: true,
      activationUrl
    };
  } catch (error) {
    console.error('❌ [Email Service] SMTP Transmission Error:', error.message);
    return {
      sent: false,
      configured: true,
      activationUrl,
      error: error.message,
      reason: `Email transmission failed: ${error.message}`
    };
  }
};

/**
 * Dispatches an access reset email.
 */
export const sendPasswordResetEmail = async ({ email, name, token, resetToken }) => {
  const actualToken = token || resetToken;
  const resetUrl = `${APP_URL}/activate?token=${encodeURIComponent(actualToken || '')}`;

  console.log('------------------------------------------------------------');
  console.log(`🔑 [Email Service] Password Reset / Access Link Prepared`);
  console.log(`   To: ${name} <${email}>`);
  console.log(`   Reset URL: ${resetUrl}`);
  console.log('------------------------------------------------------------');

  const transporter = getTransporter();

  if (!transporter) {
    return {
      sent: false,
      configured: false,
      resetUrl,
      reason: 'SMTP configuration is not set in backend/.env. Reset link logged for activation.'
    };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || '"Smart City Administration" <no-reply@smartcity.gov>';
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Smart City Department Account Access Reset`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #0f172a;">Smart City Governance Mainframe</h2>
          <p style="color: #1e293b;">Hello <strong>${name}</strong>,</p>
          <p style="color: #334155;">An administrative access reset has been initiated for your department account (${email}).</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `
    });

    return {
      sent: true,
      configured: true,
      resetUrl
    };
  } catch (error) {
    console.error('❌ [Email Service] Reset Dispatch Error:', error.message);
    return {
      sent: false,
      configured: true,
      resetUrl,
      error: error.message,
      reason: `Email transmission failed: ${error.message}`
    };
  }
};
