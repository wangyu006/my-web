// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['https://yuzhihejin.top', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'yuzhihejin-proxy', time: new Date().toISOString() });
});

app.use('/api', createProxyMiddleware({
    target: 'https://zwfw.hubei.gov.cn',
    changeOrigin: true,
    pathRewrite: { '^/api': '/api/v1' },
    onProxyReq: (proxyReq, req, res) => {
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if (req.headers['x-requested-with']) {
            proxyReq.setHeader('X-Requested-With', req.headers['x-requested-with']);
        }
        console.log(`🔄 转发: ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ 响应: ${proxyRes.statusCode} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('❌ 代理错误:', err.message);
        res.status(500).json({
            success: false,
            error: '代理服务错误',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    },
    proxyTimeout: 30000,
    timeout: 30000
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════');
    console.log('  🏮 玉旨和锦 · 著作权登记代理服务');
    console.log(`  ✅ 服务运行在: http://localhost:${PORT}`);
    console.log(`  📡 代理目标: https://zwfw.hubei.gov.cn/api/v1`);
    console.log(`  🌐 前端地址: https://yuzhihejin.top`);
    console.log('═══════════════════════════════════════════════');
});