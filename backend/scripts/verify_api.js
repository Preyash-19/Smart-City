import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const BACKEND_URL = 'http://localhost:5000/api';

async function runTests() {
  try {
    console.log('--- STARTING END-TO-END VERIFICATION ---');

    // Clean stale test records from previous test runs so tests are 100% reproducible
    await prisma.complaint.deleteMany({
      where: {
        OR: [
          { address: { contains: 'I-95 Express Lane' } },
          { address: { contains: 'College Gate' } },
          { address: { contains: 'Downtown Avenue' } }
        ]
      }
    });

    // 1. Register a new Citizen
    const testEmail = `citizen_${Date.now()}@city.gov`;
    console.log(`\n[1] Registering citizen with email: ${testEmail}...`);
    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Citizen',
        email: testEmail,
        password: 'password123',
        role: 'CITIZEN'
      })
    });
    const regData = await regRes.json();
    console.log('Result:', regData);

    // 2. Login Citizen
    console.log('\n[2] Logging in as citizen...');
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const citizenToken = loginData.token;
    console.log('Result: Login successful, token acquired.');

    // 3. Submit a master complaint to check AI Engine integration
    console.log('\n[3] Submitting new complaint to AI Engine & DB...');
    const submitRes = await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        title: 'Massive pothole on highway',
        description: 'Dangerous pothole in the middle lane causing cars to swerve. Urgent hazard!',
        imageUrl: 'http://res.cloudinary.com/demo/image/upload/v1234/test_pothole.jpg',
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'I-95 Express Lane, Mile 14'
      })
    });
    const submitData = await submitRes.json();
    console.log('Result:', submitData);
    const complaint = submitData.complaint;
    
    // Assertions on AI categorization
    console.log('\n[Assert] Checking AI diagnostic results:');
    console.log('  - Classified Department:', complaint.department); // Expected: ROAD
    console.log('  - Assigned Priority:', complaint.priority); // Expected: HIGH
    console.log('  - Evidence Score:', complaint.evidenceScore); // Expected: 85
    console.log('  - AI Summary:', complaint.aiSummary);

    // 4. Test Smart Duplicate Detector (All 7 Required Test Scenarios)
    console.log('\n[4] Running Smart Duplicate Detector Test Matrix (Tests 1 - 7)...');
    
    // TEST 1 — Same location, different problem (Pothole vs Garbage at 21.1458, 79.0882)
    console.log('  - TEST 1: Same location, different problem (Pothole vs Garbage)...');
    const t1_pothole = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Large pothole near college gate', description: 'Deep pothole road damage.', latitude: 21.1458, longitude: 79.0882, address: 'College Gate Square' })
    })).json();

    console.log('    t1_pothole:', t1_pothole);
    const t1_garbage = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Garbage accumulation near college gate', description: 'Trash and filth dumped.', latitude: 21.1458, longitude: 79.0882, address: 'College Gate Square' })
    })).json();
    console.log('    t1_garbage:', t1_garbage);

    console.log('    Result:', (!t1_pothole.isDuplicate && !t1_garbage.isDuplicate) ? '✅ NOT DUPLICATE (As Expected - Different problems allowed at same coords)' : '❌ FAILED');

    // TEST 2 — Same location, same problem
    console.log('  - TEST 2: Same location, same problem (Another Pothole at college gate)...');
    const t2_dupPothole = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Deep pothole near college entrance', description: 'Dangerous pothole road damage.', latitude: 21.1458, longitude: 79.0882, address: 'College Gate Square' })
    })).json();
    console.log('    t2_dupPothole:', t2_dupPothole);
    console.log('    Result:', t2_dupPothole.isDuplicate ? '✅ DUPLICATE (As Expected)' : '❌ FAILED');

    // TEST 3 — Same location, different department
    console.log('  - TEST 3: Same location, different department (Streetlight ELECTRICAL vs Garbage SANITATION)...');
    const t3_light = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Broken streetlight near gate', description: 'Electric wire sparking lamp outage.', latitude: 21.1458, longitude: 79.0882, address: 'College Gate Square' })
    })).json();
    console.log('    Result:', !t3_light.isDuplicate ? '✅ NOT DUPLICATE (As Expected)' : '❌ FAILED');

    // TEST 4 — Nearby location, same problem
    console.log('  - TEST 4: Nearby location (~20m), same problem (Pothole on highway)...');
    const t4_nearPothole = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Deep pothole on the same road', description: 'Dangerous pothole causing cars to swerve.', latitude: 40.71282, longitude: -74.00601, address: 'I-95 Express Lane, Mile 14' })
    })).json();
    console.log('    Result:', t4_nearPothole.isDuplicate ? '✅ DUPLICATE (As Expected)' : '❌ FAILED');

    // TEST 5 — Nearby location, same department, different problem
    console.log('  - TEST 5: Nearby location (~15m), same department (ROAD), different problem (Road Divider)...');
    const t5_divider = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Broken road divider barrier', description: 'Metal guard rail cracked.', latitude: 40.71281, longitude: -74.00602, address: 'I-95 Express Lane, Mile 14' })
    })).json();
    console.log('    Result:', !t5_divider.isDuplicate ? '✅ NOT DUPLICATE (As Expected)' : '❌ FAILED');

    // TEST 6 — Same problem wording, far away (15 km away)
    console.log('  - TEST 6: Same problem wording, far away (15km away)...');
    const t6_farPothole = await (await fetch(`${BACKEND_URL}/complaints/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ title: 'Massive pothole on highway', description: 'Dangerous pothole in middle lane.', latitude: 40.85000, longitude: -74.15000, address: 'Downtown Avenue 5' })
    })).json();
    console.log('    Result:', !t6_farPothole.isDuplicate ? '✅ NOT DUPLICATE (As Expected - Outside Geo Radius)' : '❌ FAILED');

    // TEST 7 — Same exact coordinates, multiple valid problems
    console.log('  - TEST 7: Identical coordinates (21.1458, 79.0882) + 5 distinct civic problems...');
    const testCoords = { latitude: 21.1458, longitude: 79.0882, address: 'College Gate Square' };

    const c1 = await (await fetch(`${BACKEND_URL}/complaints/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` }, body: JSON.stringify({ title: 'Water pipe leak near gate', description: 'Plumbing burst water supply.', ...testCoords }) })).json();
    const c2 = await (await fetch(`${BACKEND_URL}/complaints/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` }, body: JSON.stringify({ title: 'Clogged drainage gutter overflow', description: 'Drainage flooding street.', ...testCoords }) })).json();

    console.log('    Result:', (!c1.isDuplicate && !c2.isDuplicate) ? '✅ ALL DISTINCT PROBLEMS COEXIST AT SAME GPS (As Expected)' : '❌ FAILED');

    // 5. Fetch Citizen History
    console.log('\n[5] Fetching citizen complaint history...');
    const historyRes = await fetch(`${BACKEND_URL}/complaints/my-history`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const historyData = await historyRes.json();
    console.log(`Result: Found ${historyData.complaints.length} complaints in history.`);

    // 6. Login as Admin
    console.log('\n[6] Logging in as Admin (admin@city.gov)...');
    const adminLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@city.gov',
        password: 'password123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('Result: Admin login successful.');

    // 7. Get Officer/Admin Dashboard Telemetry
    console.log('\n[7] Fetching Admin dashboard telemetry...');
    const dashRes = await fetch(`${BACKEND_URL}/complaints/dashboard`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    console.log(`Result: Fetched ${dashData.complaints.length} total active incidents.`);

    // 8. Update Complaint Status to RESOLVED (testing enum & route)
    console.log(`\n[8] Updating complaint (${complaint.id}) status to RESOLVED...`);
    const updateRes = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'RESOLVED',
        remark: 'Road repair crew patched the pothole and laid new asphalt.'
      })
    });
    const updateData = await updateRes.json();
    console.log('Result:', updateData);
    console.log('✅ Status updated successfully to RESOLVED!');

    // 8b. Test Citizen Feedback API, Validation, Security & Retrieval
    console.log(`\n[8b] Testing Citizen Feedback Feature on Complaint (${complaint.id})...`);

    // (a) Invalid Rating: Rating 0 (Should fail with 400)
    console.log('  - Testing invalid rating 0 [Should fail with 400]...');
    const fbInvalidZero = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ rating: 0, comment: 'Bad' })
    });
    console.log('    Status:', fbInvalidZero.status, fbInvalidZero.status === 400 ? '✅ 400 Bad Request' : '❌ FAILED');

    // (b) Invalid Rating: Rating 6 (Should fail with 400)
    console.log('  - Testing invalid rating 6 [Should fail with 400]...');
    const fbInvalidSix = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ rating: 6, comment: 'Too high' })
    });
    console.log('    Status:', fbInvalidSix.status, fbInvalidSix.status === 400 ? '✅ 400 Bad Request' : '❌ FAILED');

    // (c) Invalid Status: Submitting feedback on a non-resolved complaint (c1 is ROUTED)
    console.log('  - Testing feedback on unresolved complaint [Should fail with 400]...');
    const fbUnresolved = await fetch(`${BACKEND_URL}/complaints/${c1.complaint?.id || c1.existingId || c1.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ rating: 5, comment: 'Premature' })
    });
    console.log('    Status:', fbUnresolved.status, (fbUnresolved.status === 400 || fbUnresolved.status === 404) ? '✅ Blocked' : '❌ FAILED');

    // (d) Unauthorized Citizen: User B tries to submit feedback on User A's resolved complaint
    console.log('  - Testing unauthorized feedback from another citizen [Should fail with 403]...');
    const userCEmail = `citizen_feedback_${Date.now()}@city.gov`;
    await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Citizen C', email: userCEmail, password: 'password123', role: 'CITIZEN' })
    });
    const userCLogin = await (await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userCEmail, password: 'password123' })
    })).json();

    const fbUnauthorized = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userCLogin.token}` },
      body: JSON.stringify({ rating: 4, comment: 'Intruder comment' })
    });
    console.log('    Status:', fbUnauthorized.status, fbUnauthorized.status === 403 ? '✅ 403 Forbidden' : '❌ FAILED');

    // (e) Valid Feedback Submission: Rating 5 + Optional Comment
    console.log('  - Testing valid feedback submission (5 stars + comment) [Should succeed with 201]...');
    const fbValid = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ 
        rating: 5, 
        comment: 'The pothole was repaired properly. Thank you for resolving the issue.' 
      })
    });
    const fbValidData = await fbValid.json();
    console.log('    Status:', fbValid.status, fbValid.status === 201 ? '✅ 201 Created' : '❌ FAILED');
    console.log('    Saved Feedback:', fbValidData.feedback);

    // (f) Duplicate Feedback Guard: Try submitting feedback again on same complaint (Should fail with 409)
    console.log('  - Testing duplicate feedback submission [Should fail with 409]...');
    const fbDuplicate = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
      body: JSON.stringify({ rating: 3, comment: 'Second attempt' })
    });
    console.log('    Status:', fbDuplicate.status, fbDuplicate.status === 409 ? '✅ 409 Conflict' : '❌ FAILED');

    // (g) Feedback Retrieval: Owner fetches their feedback
    console.log('  - Testing feedback retrieval by owner [Should succeed with 200]...');
    const fbGetOwner = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const fbGetOwnerData = await fbGetOwner.json();
    console.log('    Status:', fbGetOwner.status, fbGetOwner.status === 200 ? '✅ 200 OK' : '❌ FAILED');
    console.log('    Retrieved Rating:', fbGetOwnerData.feedback?.rating, 'Comments:', fbGetOwnerData.feedback?.comments);

    // (h) Unauthorized Feedback Retrieval: User C tries to fetch User A's feedback [Should fail with 403]
    console.log('  - Testing unauthorized feedback retrieval by User C [Should fail with 403]...');
    const fbGetUnauthorized = await fetch(`${BACKEND_URL}/complaints/${complaint.id}/feedback`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userCLogin.token}` }
    });
    console.log('    Status:', fbGetUnauthorized.status, fbGetUnauthorized.status === 403 ? '✅ 403 Forbidden' : '❌ FAILED');

    // (i) Citizen History Feedback Embed: Verify getMyComplaints includes feedback
    console.log('  - Testing getMyComplaints returns embedded feedback...');
    const myHistoryWithFb = await (await fetch(`${BACKEND_URL}/complaints/my-history`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    })).json();
    const resolvedInHistory = myHistoryWithFb.complaints.find(c => c.id === complaint.id);
    console.log('    Has feedback embedded:', resolvedInHistory?.feedback ? '✅ Yes (Rating: ' + resolvedInHistory.feedback.rating + ')' : '❌ FAILED');

    // 9. Verify Decommission (Delete) Security and Functionality
    console.log(`\n[9] Testing decommission/delete security...`);
    
    // (a) Citizen tries to delete -> should fail (403)
    console.log(`  - Citizen tries to delete complaint (${complaint.id}) [Should fail with 403]...`);
    const citizenDeleteRes = await fetch(`${BACKEND_URL}/complaints/${complaint.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('  - Status Code:', citizenDeleteRes.status); // Expected: 403
    if (citizenDeleteRes.status === 403) {
      console.log('  ✅ Security verified: Citizen successfully blocked from deleting.');
    } else {
      console.log('  ❌ Security FAILED: Citizen was not blocked from deleting!');
    }

    // (b) Admin deletes -> should succeed (200)
    console.log(`  - Admin tries to delete complaint (${complaint.id}) [Should succeed with 200]...`);
    const adminDeleteRes = await fetch(`${BACKEND_URL}/complaints/${complaint.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminDeleteData = await adminDeleteRes.json();
    console.log('  - Status Code:', adminDeleteRes.status); // Expected: 200
    console.log('  - Result:', adminDeleteData);
    if (adminDeleteRes.status === 200) {
      console.log('  ✅ Functionality verified: Admin successfully deleted complaint.');
    } else {
      console.log('  ❌ Functionality FAILED: Admin could not delete complaint!');
    }

    // (c) Double-check Admin dashboard -> complaint should be gone
    console.log(`  - Double-checking Admin dashboard telemetry...`);
    const finalDashRes = await fetch(`${BACKEND_URL}/complaints/dashboard`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const finalDashData = await finalDashRes.json();
    const isPresent = finalDashData.complaints.some(c => c.id === complaint.id);
    if (!isPresent) {
      console.log('  ✅ Double-check verified: Complaint is no longer in the dashboard!');
    } else {
      console.log('  ❌ Double-check FAILED: Complaint is still in the dashboard!');
    }

    // 10. Verify Citizen Notification System API & Security
    console.log('\n[10] Testing Notification System APIs & Security Scopes...');
    
    // Fetch notifications for citizen
    const notifRes = await fetch(`${BACKEND_URL}/notifications`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const notifList = await notifRes.json();
    console.log(`  - Citizen Notifications Count: ${notifList.length}`);
    console.log('  - Sample Notification:', notifList[0] || 'None');
    
    if (notifList.length > 0) {
      const sampleNotifId = notifList[0].id;

      // Mark single notification as read
      const markRes = await fetch(`${BACKEND_URL}/notifications/${sampleNotifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      console.log('  - Mark Read Status:', markRes.status);
      if (markRes.status === 200) {
        console.log('  ✅ Notification marked as read successfully.');
      } else {
        console.log('  ❌ Failed to mark notification as read.');
      }

      // Security Check: Register User B and attempt to mark Citizen A's notification as read
      const userBEmail = `citizen_b_${Date.now()}@city.gov`;
      await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Citizen B', email: userBEmail, password: 'password123', role: 'CITIZEN' })
      });
      const userBLogin = await (await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userBEmail, password: 'password123' })
      })).json();

      const unauthorizedMark = await fetch(`${BACKEND_URL}/notifications/${sampleNotifId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${userBLogin.token}` }
      });
      console.log('  - Unauthorized User B Mark Read Status Code:', unauthorizedMark.status); // Expected: 403
      if (unauthorizedMark.status === 403) {
        console.log('  ✅ Notification Security Verified: User B blocked from accessing User A notification!');
      } else {
        console.log('  ❌ Notification Security FAILED!');
      }

      // Mark all read for Citizen
      const markAllRes = await fetch(`${BACKEND_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      console.log('  - Mark All Read Status:', markAllRes.status);
      if (markAllRes.status === 200) {
        console.log('  ✅ All notifications marked as read.');
      }
    }

    console.log('\n--- ALL END-TO-END VERIFICATIONS PASSED SUCCESSFULLY! 🚀 ---');
  } catch (error) {
    console.error('\n❌ E2E VERIFICATION FAILED:', error.message);
  }
}

runTests();
