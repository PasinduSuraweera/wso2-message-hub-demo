const express = require('express');
const app = express();
const PORT = 8081;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'Order Service',
        status: 'healthy',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Main order processing endpoint
app.post('/orders', (req, res) => {
    console.log('\n🟢 ORDER SERVICE - Processing order...');
    
    const order = req.body;
    
    // Simulate processing time
    setTimeout(() => {
        const response = {
            status: 'success',
            service: 'Order Service',
            orderId: `ORD-${Date.now()}`,
            originalData: order,
            processedAt: new Date().toISOString(),
            message: 'Order processed successfully'
        };
        
        console.log('Order Response:', JSON.stringify(response, null, 2));
        res.json(response);
    }, 500); // 500ms delay to simulate processing
});

// Catch all other routes
app.all('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        service: 'Order Service',
        path: req.path,
        method: req.method
    });
});

app.listen(PORT, () => {
    console.log(`🟢 Order Service running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Orders endpoint: http://localhost:${PORT}/orders`);
});