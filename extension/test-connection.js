// Test script to verify Chrome Extension can connect to Job Tracker API
// Run this in browser console to test the connection

(async function testJobTrackerConnection() {
    console.log('🧪 Testing Job Tracker API Connection...');
    
    const apiUrl = 'http://localhost:3000/api/extension';
    
    try {
        // Test GET endpoint (health check)
        console.log('📡 Testing GET /api/extension...');
        const getResponse = await fetch(apiUrl, { method: 'GET' });
        const getResult = await getResponse.json();
        
        if (getResponse.ok && getResult.success) {
            console.log('✅ GET test passed:', getResult.data.status);
        } else {
            console.error('❌ GET test failed:', getResult);
            return;
        }
        
        // Test POST endpoint with sample data
        console.log('📡 Testing POST /api/extension...');
        const testJobData = {
            url: 'https://example.com/test-job',
            description: 'This is a test job posting for API verification. Software Engineer position at Test Company. Requirements: JavaScript, React, Node.js. Salary: $80,000 - $120,000.'
        };
        
        const postResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testJobData)
        });
        
        const postResult = await postResponse.json();
        
        if (postResponse.ok && postResult.success) {
            console.log('✅ POST test passed - Job created with ID:', postResult.data.id);
            return postResult.data.id;
        } else {
            console.error('❌ POST test failed:', postResult);
        }
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('💡 Make sure Job Tracker is running on http://localhost:3000');
            console.log('💡 Run: npm run dev in your Job Tracker directory');
        }
    }
})();

// Instructions:
// 1. Start your Job Tracker application (npm run dev)
// 2. Open browser console on any page
// 3. Copy and paste this entire script
// 4. Press Enter to run the test
// 5. Check console output for results