const axios = require('axios');

async function testServices() {
    console.log('🧪 Testing Mock Services...\n');
    
    const services = [
        { name: 'Order Service', url: 'http://localhost:8081/health' },
        { name: 'Payment Service', url: 'http://localhost:8082/health' }
    ];
    
    for (const service of services) {
        try {
            console.log(`Testing ${service.name}...`);
            const response = await axios.get(service.url, { timeout: 2000 });
            console.log(`✅ ${service.name} is healthy`);
            console.log(`   Response: ${JSON.stringify(response.data)}\n`);
        } catch (error) {
            console.log(`❌ ${service.name} is not responding`);
            console.log(`   Error: ${error.message}\n`);
        }
    }
    
    // Test actual endpoints
    console.log('🧪 Testing Service Endpoints...\n');
    
    try {
        console.log('Testing Order Service endpoint...');
        const orderResponse = await axios.post('http://localhost:8081/orders', {
            type: 'order',
            id: 'TEST-001',
            priority: 'high',
            data: { item: 'laptop', quantity: 1 }
        }, { timeout: 3000 });
        console.log('✅ Order Service endpoint working');
        console.log(`   Response: ${JSON.stringify(orderResponse.data, null, 2)}\n`);
    } catch (error) {
        console.log('❌ Order Service endpoint failed');
        console.log(`   Error: ${error.message}\n`);
    }
    
    try {
        console.log('Testing Payment Service endpoint...');
        const paymentResponse = await axios.post('http://localhost:8082/payments', {
            type: 'payment',
            id: 'TEST-002',
            priority: 'medium',
            data: { amount: 1000, currency: 'USD' }
        }, { timeout: 3000 });
        console.log('✅ Payment Service endpoint working');
        console.log(`   Response: ${JSON.stringify(paymentResponse.data, null, 2)}\n`);
    } catch (error) {
        console.log('❌ Payment Service endpoint failed');
        console.log(`   Error: ${error.message}\n`);
    }
}

if (require.main === module) {
    testServices().catch(console.error);
}

module.exports = { testServices };