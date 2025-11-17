const axios = require('axios');

// WSO2 MI base URL (default ports)
const WSO2_MI_URL = 'http://localhost:8290/hub';

async function testIntegration() {
    console.log('🧪 Testing WSO2 MI Message Hub Integration\n');
    console.log('=' .repeat(60));
    
    // Wait for WSO2 MI to start up
    console.log('⏳ Waiting for WSO2 MI to start up...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    try {
        // Test 1: Health Check
        console.log('\n🔍 Test 1: Health Check');
        console.log('-'.repeat(40));
        
        const healthResponse = await axios.get(`${WSO2_MI_URL}/health`, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Health check successful');
        console.log('Response:', JSON.stringify(healthResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Health check failed');
        console.log('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 WSO2 MI might not be running yet. Check if it started properly.');
            return;
        }
    }
    
    try {
        // Test 2: Order Message Routing
        console.log('\n🟢 Test 2: Order Message Routing');
        console.log('-'.repeat(40));
        
        const orderMessage = {
            type: 'order',
            id: 'ORDER-12345',
            priority: 'high',
            data: {
                item: 'Laptop',
                quantity: 2,
                price: 1200.00,
                customer: 'John Doe'
            }
        };
        
        const orderResponse = await axios.post(`${WSO2_MI_URL}/process`, orderMessage, {
            timeout: 10000,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ Order routing successful');
        console.log('Request:', JSON.stringify(orderMessage, null, 2));
        console.log('Response:', JSON.stringify(orderResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Order routing failed');
        console.log('Error:', error.response?.data || error.message);
    }
    
    try {
        // Test 3: Payment Message Routing
        console.log('\n💳 Test 3: Payment Message Routing');
        console.log('-'.repeat(40));
        
        const paymentMessage = {
            type: 'payment',
            id: 'PAY-67890',
            priority: 'medium',
            data: {
                amount: 1200.00,
                currency: 'USD',
                cardNumber: '**** **** **** 1234',
                customer: 'John Doe'
            }
        };
        
        const paymentResponse = await axios.post(`${WSO2_MI_URL}/process`, paymentMessage, {
            timeout: 10000,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ Payment routing successful');
        console.log('Request:', JSON.stringify(paymentMessage, null, 2));
        console.log('Response:', JSON.stringify(paymentResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Payment routing failed');
        console.log('Error:', error.response?.data || error.message);
    }
    
    try {
        // Test 4: Unknown Message Type (Error Handling)
        console.log('\n❓ Test 4: Unknown Message Type (Error Handling)');
        console.log('-'.repeat(40));
        
        const unknownMessage = {
            type: 'unknown',
            id: 'UNK-999',
            priority: 'low',
            data: {
                invalid: 'data'
            }
        };
        
        const unknownResponse = await axios.post(`${WSO2_MI_URL}/process`, unknownMessage, {
            timeout: 5000,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ Error handling working');
        console.log('Request:', JSON.stringify(unknownMessage, null, 2));
        console.log('Response:', JSON.stringify(unknownResponse.data, null, 2));
        
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Error handling working (400 Bad Request as expected)');
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Unexpected error');
            console.log('Error:', error.response?.data || error.message);
        }
    }
    
    try {
        // Test 5: Batch Processing
        console.log('\n📦 Test 5: Batch Processing');
        console.log('-'.repeat(40));
        
        const batchMessage = {
            items: [
                { type: 'order', id: 'BATCH-001', data: { item: 'Phone' } },
                { type: 'payment', id: 'BATCH-002', data: { amount: 500 } },
                { type: 'order', id: 'BATCH-003', data: { item: 'Tablet' } }
            ]
        };
        
        const batchResponse = await axios.post(`${WSO2_MI_URL}/batch`, batchMessage, {
            timeout: 10000,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ Batch processing successful');
        console.log('Request:', JSON.stringify(batchMessage, null, 2));
        console.log('Response:', JSON.stringify(batchResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Batch processing failed');
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Integration testing completed!');
    console.log('📋 Summary:');
    console.log('   - WSO2 MI is running on http://localhost:8290');
    console.log('   - Order Service (mock) on http://localhost:8081');
    console.log('   - Payment Service (mock) on http://localhost:8082');
    console.log('   - Message Hub API on http://localhost:8290/hub');
    console.log('\n💡 You can now test with Postman or any REST client!');
}

// Quick test function for specific endpoints
async function quickTest(type = 'order') {
    const message = {
        type: type,
        id: `TEST-${Date.now()}`,
        priority: 'medium',
        data: { test: true, timestamp: new Date().toISOString() }
    };
    
    try {
        const response = await axios.post(`${WSO2_MI_URL}/process`, message, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ ${type} test successful`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log(`❌ ${type} test failed: ${error.message}`);
    }
}

// Run tests if called directly
if (require.main === module) {
    const testType = process.argv[2];
    if (testType === 'quick') {
        const messageType = process.argv[3] || 'order';
        quickTest(messageType);
    } else {
        testIntegration().catch(console.error);
    }
}

module.exports = { testIntegration, quickTest };