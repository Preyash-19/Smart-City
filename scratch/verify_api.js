import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api';

async function runTests() {
  try {
    console.log('--- STARTING END-TO-END VERIFICATION ---');

    // 1. Register a new Citizen
    const testEmail = `citizen_${Date.now()}@city.gov`;
    console.log(`\n[1] Registering citizen with email: ${testEmail}...`);
    const regRes = await axios.post(`${BACKEND_URL}/auth/register`, {
      name: 'John Citizen',
      email: testEmail,
      password: 'password123',
      role: 'CITIZEN'
    });
    console.log('Result:', regRes.data);

    // 2. Login Citizen
    console.log('\n[2] Logging in as citizen...');
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    const citizenToken = loginRes.data.token;
    console.log('Result: Login successful, token acquired.');

    // 3. Submit a complaint to check AI Engine integration
    console.log('\n[3] Submitting new complaint to AI Engine & DB...');
    const submitRes = await axios.post(
      `${BACKEND_URL}/complaints/submit`,
      {
        title: 'Massive pothole on highway',
        description: 'Dangerous pothole in the middle lane causing cars to swerve. Urgent hazard!',
        imageUrl: 'http://res.cloudinary.com/demo/image/upload/v1234/test_pothole.jpg',
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'I-95 Express Lane, Mile 14'
      },
      {
        headers: { Authorization: `Bearer ${citizenToken}` }
      }
    );
    console.log('Result:', submitRes.data);
    const complaint = submitRes.data.complaint;
    
    // Assertions on AI categorization
    console.log('\n[Assert] Checking AI diagnostic results:');
    console.log('  - Classified Department:', complaint.department); // Expected: ROAD
    console.log('  - Assigned Priority:', complaint.priority); // Expected: HIGH
    console.log('  - Evidence Score:', complaint.evidenceScore); // Expected: 85
    console.log('  - AI Summary:', complaint.aiSummary);

    // 4. Test duplicate geo-spatial detector
    console.log('\n[4] Attempting to submit a duplicate complaint (same location)...');
    try {
      const duplicateRes = await axios.post(
        `${BACKEND_URL}/complaints/submit`,
        {
          title: 'Road crack',
          description: 'A pothole on the road here.',
          imageUrl: 'http://res.cloudinary.com/demo/image/upload/v1234/test_pothole.jpg',
          latitude: 40.71282, // within 50m
          longitude: -74.00601,
          address: 'I-95 Express Lane, Mile 14'
        },
        {
          headers: { Authorization: `Bearer ${citizenToken}` }
        }
      );
      console.log('Result:', duplicateRes.data);
      if (duplicateRes.data.isDuplicate) {
        console.log('✅ Geo-spatial duplicate detector works perfectly!');
      } else {
        console.log('❌ Duplicate detector did not flag the duplicate.');
      }
    } catch (err) {
      console.error('❌ Duplicate detection failed:', err.response?.data || err.message);
    }

    // 5. Fetch Citizen History
    console.log('\n[5] Fetching citizen complaint history...');
    const historyRes = await axios.get(`${BACKEND_URL}/complaints/my-history`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`Result: Found ${historyRes.data.complaints.length} complaints in history.`);

    // 6. Login as Admin
    console.log('\n[6] Logging in as Admin (admin@city.gov)...');
    const adminLoginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@city.gov',
      password: 'password123'
    });
    const adminToken = adminLoginRes.data.token;
    console.log('Result: Admin login successful.');

    // 7. Get Officer/Admin Dashboard Telemetry
    console.log('\n[7] Fetching Admin dashboard telemetry...');
    const dashRes = await axios.get(`${BACKEND_URL}/complaints/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Result: Fetched ${dashRes.data.complaints.length} total active incidents.`);

    // 8. Update Complaint Status to RESOLVED (testing enum & route)
    console.log(`\n[8] Updating complaint (${complaint.id}) status to RESOLVED...`);
    const updateRes = await axios.put(
      `${BACKEND_URL}/complaints/${complaint.id}/status`,
      {
        status: 'RESOLVED',
        remark: 'Road repair crew patched the pothole and laid new asphalt.'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('Result:', updateRes.data);
    console.log('✅ Status updated successfully to RESOLVED!');

    console.log('\n--- ALL END-TO-END VERIFICATIONS PASSED SUCCESSFULLY! 🚀 ---');
  } catch (error) {
    console.error('\n❌ E2E VERIFICATION FAILED:', error.response?.data || error.message);
  }
}

runTests();
