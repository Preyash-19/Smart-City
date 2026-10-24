import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:5000';
const prisma = new PrismaClient();

async function runSmokeTests() {
  console.log('================================================================');
  console.log('   PHASE 5A: BACKEND SMOKE TESTS AGAINST NEON POSTGRESQL');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details ? ': ' + details : ''}`);
      failed++;
    }
  }

  try {
    // Test 1: API Health Endpoint
    console.log('1. Health check & basic API response...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert('API Health Check', healthRes.status === 200 && healthData.status === 'ok', `status: ${healthData.status}`);

    // Test 2: Direct read-only database query via Prisma on Neon
    console.log('\n2. Read-only direct Prisma query against Neon PostgreSQL...');
    const userCount = await prisma.user.count();
    const complaintCount = await prisma.complaint.count();
    assert('Direct Prisma Read', userCount === 87 && complaintCount === 76, `users: ${userCount}, complaints: ${complaintCount}`);

    // Test 3: Citizen Authentication
    console.log('\n3. Citizen authentication (JWT issuance & password verification)...');
    const citizenEmail = 'priya.deshmukh@civic.test';
    const citizenLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenEmail, password: 'CitizenPass@123' })
    });
    const citizenLogin = await citizenLoginRes.json();
    const citizenRole = citizenLogin.user?.role;
    assert('Citizen Login', citizenLoginRes.status === 200 && citizenLogin.token && citizenRole === 'CITIZEN', `Role: ${citizenRole}, Token: masked`);
    const citizenToken = citizenLogin.token;

    // Test 4: Citizen Complaint History Read
    console.log('\n4. Citizen history read endpoint (/api/complaints/my-history)...');
    const historyRes = await fetch(`${BASE_URL}/api/complaints/my-history`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const historyData = await historyRes.json();
    const complaintsList = historyData.complaints || historyData;
    assert('Citizen History Read', historyRes.status === 200 && Array.isArray(complaintsList), `${complaintsList.length} complaints retrieved`);

    // Test 5: Citizen Notifications Read
    console.log('\n5. Citizen notifications read endpoint (/api/notifications)...');
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const notifData = await notifRes.json();
    const notifList = Array.isArray(notifData) ? notifData : (notifData.notifications || []);
    assert('Citizen Notifications Read', notifRes.status === 200 && Array.isArray(notifList), `${notifList.length} notifications retrieved`);

    // Test 6: City Admin Authentication & Role Authorization
    console.log('\n6. City Admin authentication & RBAC check...');
    const adminEmail = 'city.admin@smartcity.gov';
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'Admin@123456' })
    });
    const adminLogin = await adminLoginRes.json();
    const adminRole = adminLogin.user?.role;
    assert('Admin Login', adminLoginRes.status === 200 && adminLogin.token && adminRole === 'ADMIN', `Role: ${adminRole}, Token: masked`);
    const adminToken = adminLogin.token;

    // Test 7: Officer / Admin Dashboard Overview Read
    console.log('\n7. Officer/Admin dashboard read endpoint (/api/complaints/dashboard)...');
    const dashboardRes = await fetch(`${BASE_URL}/api/complaints/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashboardData = await dashboardRes.json();
    const dashboardList = dashboardData.complaints || dashboardData;
    assert('Dashboard Overview Read', dashboardRes.status === 200 && Array.isArray(dashboardList), `${dashboardList.length} complaints in dashboard`);

    // Test 8: Relational Details Query (Complaint with Citizen, StatusLogs, Feedback)
    console.log('\n8. Relational details read on representative complaint...');
    const sampleComplaint = await prisma.complaint.findFirst({
      where: { feedback: { isNot: null } },
      include: { citizen: true, statusLogs: true, feedback: true }
    });
    assert('Relational Integrity Read', 
      sampleComplaint && sampleComplaint.citizen && sampleComplaint.statusLogs.length > 0 && sampleComplaint.feedback,
      `Complaint ID: ${sampleComplaint.id.substring(0, 8)}..., Citizen: ${sampleComplaint.citizen.name}, Logs: ${sampleComplaint.statusLogs.length}, Rating: ${sampleComplaint.feedback.rating}/5`
    );

    // Test 9: Admin Audit Logs Read
    console.log('\n9. Admin audit logs read endpoint (/api/admin/users/audit-logs)...');
    const auditRes = await fetch(`${BASE_URL}/api/admin/users/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const auditData = await auditRes.json();
    const auditLogsList = auditData.logs || auditData;
    assert('Audit Logs Read', auditRes.status === 200 && Array.isArray(auditLogsList), `${auditLogsList.length} audit logs retrieved`);

    // Test 10: Admin Department Users Read
    console.log('\n10. Department users read endpoint (/api/admin/users)...');
    const deptUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const deptUsersData = await deptUsersRes.json();
    const deptUsersList = deptUsersData.users || deptUsersData;
    assert('Department Users Read', deptUsersRes.status === 200 && Array.isArray(deptUsersList), `${deptUsersList.length} department users retrieved`);

    // Test 11: Non-Destructive Invariant Assertion
    console.log('\n11. Final Invariant Assertion: Confirming zero writes occurred...');
    const postUserCount = await prisma.user.count();
    const postComplaintCount = await prisma.complaint.count();
    const postAuditCount = await prisma.auditLog.count();
    assert('Zero Write Side-effects', postUserCount === 87 && postComplaintCount === 76 && postAuditCount === 20, 
      `All counts identical: Users=${postUserCount}, Complaints=${postComplaintCount}, AuditLogs=${postAuditCount}`
    );

    console.log('\n================================================================');
    console.log(`SMOKE TESTS RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }

  } finally {
    await prisma.$disconnect();
  }
}

runSmokeTests().catch(err => {
  console.error('Smoke tests error:', err);
  process.exit(1);
});
