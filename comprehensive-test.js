// MessageHub Integrator - Professional Test Suite
// Run with: node comprehensive-test.js

const http = require('http');

// Test configuration
const WSO2_BASE_URL = 'http://localhost:8290/hub';
const ORDER_SERVICE_URL = 'http://localhost:8081';
const PAYMENT_SERVICE_URL = 'http://localhost:8082';

console.log('🚀 MessageHub Integrator - Professional Test Suite');
console.log('=' .repeat(60));

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data && method !== 'GET') {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        data: jsonResponse,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test runner
async function runTests() {
    let testCount = 0;
    let passedTests = 0;
    let failedTests = 0;

    async function runTest(testName, testFunction) {
        testCount++;
        console.log(`\n🧪 Test ${testCount}: ${testName}`);
        console.log('-'.repeat(50));
        
        try {
            const startTime = Date.now();
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            if (result.success) {
                passedTests++;
                console.log(`✅ PASSED (${duration}ms): ${result.message || 'Success'}`);
            } else {
                failedTests++;
                console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
            }
            
        } catch (error) {
            failedTests++;
            console.log(`❌ FAILED: ${error.message}`);
        }
    }

    // Test 1: WSO2 MI Health Check
    await runTest('WSO2 MI Health Check', async () => {
        const response = await makeRequest(`${WSO2_BASE_URL}/health`);
        
        if (response.statusCode !== 200) {
            return { success: false, error: `Expected status 200, got ${response.statusCode}` };
        }
        
        if (!response.data.status || response.data.status !== 'healthy') {
            return { success: false, error: `Service not healthy: ${JSON.stringify(response.data)}` };
        }
        
        return { 
            success: true, 
            message: `Service healthy, version: ${response.data.version || 'unknown'}` 
        };
    });

    // Test 2: Order Service Health
    await runTest('Order Service Health Check', async () => {
        const response = await makeRequest(`${ORDER_SERVICE_URL}/health`);
        
        if (response.statusCode !== 200) {
            return { success: false, error: `Order service unreachable: ${response.statusCode}` };
        }
        
        return { success: true, message: 'Order service is healthy' };
    });

    // Test 3: Payment Service Health
    await runTest('Payment Service Health Check', async () => {
        const response = await makeRequest(`${PAYMENT_SERVICE_URL}/health`);
        
        if (response.statusCode !== 200) {
            return { success: false, error: `Payment service unreachable: ${response.statusCode}` };
        }
        
        return { success: true, message: 'Payment service is healthy' };
    });

    // Test 4: Order Message Routing
    await runTest('Order Message Routing', async () => {
        const orderData = {
            type: "order",
            id: "TEST-ORDER-" + Date.now(),
            priority: "high",
            data: {
                item: "Enterprise Laptop",
                quantity: 3,
                customer: "Test Customer",
                value: 4500.00
            }
        };

        const response = await makeRequest(`${WSO2_BASE_URL}/process`, 'POST', orderData);
        
        if (response.statusCode !== 200) {
            return { success: false, error: `Expected status 200, got ${response.statusCode}` };
        }
        
        if (!response.data.service || response.data.service !== 'Order Service') {
            return { success: false, error: `Message not routed to Order Service: ${JSON.stringify(response.data)}` };
        }
        
        if (!response.data.orderId) {
            return { success: false, error: 'No orderId generated' };
        }
        
        return { 
            success: true, 
            message: `Order routed successfully, ID: ${response.data.orderId}` 
        };
    });

    // Test 5: Payment Message Routing
    await runTest('Payment Message Routing', async () => {
        const paymentData = {
            type: "payment",
            id: "TEST-PAYMENT-" + Date.now(),
            priority: "critical",
            data: {
                amount: 4500.00,
                currency: "USD",
                customer: "Test Customer",
                method: "enterprise_transfer"
            }
        };

        const response = await makeRequest(`${WSO2_BASE_URL}/process`, 'POST', paymentData);
        
        if (response.statusCode !== 200) {
            return { success: false, error: `Expected status 200, got ${response.statusCode}` };
        }
        
        if (!response.data.service || response.data.service !== 'Payment Service') {
            return { success: false, error: `Message not routed to Payment Service: ${JSON.stringify(response.data)}` };
        }
        
        if (!response.data.transactionId) {
            return { success: false, error: 'No transactionId generated' };
        }
        
        return { 
            success: true, 
            message: `Payment routed successfully, ID: ${response.data.transactionId}` 
        };
    });

    // Test 6: Batch Processing
    await runTest('Batch Message Processing', async () => {
        const batchData = {
            items: [
                {
                    type: "order",
                    id: "BATCH-ORDER-" + Date.now(),
                    data: {
                        item: "Tablet",
                        quantity: 5
                    }
                },
                {
                    type: "payment",
                    id: "BATCH-PAYMENT-" + Date.now(),
                    data: {
                        amount: 2500.00,
                        currency: "USD"
                    }
                },
                {
                    type: "order",
                    id: "BATCH-ORDER2-" + Date.now(),
                    data: {
                        item: "Monitor",
                        quantity: 2
                    }
                }
            ]
        };

        const response = await makeRequest(`${WSO2_BASE_URL}/batch`, 'POST', batchData);
        
        if (response.statusCode !== 200) {
            return { success: false, error: `Expected status 200, got ${response.statusCode}` };
        }
        
        if (!response.data.status || response.data.status !== 'batch_processed') {
            return { success: false, error: `Batch not processed: ${JSON.stringify(response.data)}` };
        }
        
        const itemsReceived = parseFloat(response.data.itemsReceived);
        if (itemsReceived !== 3) {
            return { success: false, error: `Expected 3 items, got ${itemsReceived}` };
        }
        
        return { 
            success: true, 
            message: `Batch processed successfully, ${itemsReceived} items` 
        };
    });

    // Test 7: Performance Test
    await runTest('Response Time Performance', async () => {
        const testData = {
            type: "order",
            id: "PERF-TEST-" + Date.now(),
            data: { item: "Performance Test", quantity: 1 }
        };

        const iterations = 5;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = Date.now();
            const response = await makeRequest(`${WSO2_BASE_URL}/process`, 'POST', testData);
            const duration = Date.now() - start;
            
            if (response.statusCode !== 200) {
                return { success: false, error: `Performance test failed on iteration ${i + 1}` };
            }
            
            times.push(duration);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        
        return { 
            success: true, 
            message: `Avg: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms` 
        };
    });

    // Test Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${testCount}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
        console.log('\n🎉 ALL TESTS PASSED! The integration is production-ready!');
        console.log('🚀 Ready for enterprise deployment and showcase!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the results above.');
    }
    
    console.log('=' .repeat(60));
}

// Run the tests
runTests().catch(console.error);