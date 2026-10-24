import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// Root API index
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to LUMEN LUXE Full-Stack E-Commerce API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/products/categories',
      orders: '/api/orders',
      coupons: '/api/coupons',
      newsletter: '/api/newsletter',
      adminStats: '/api/admin/stats',
    },
  });
});

// Serve frontend build if dist folder exists (production mode)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode when dist doesn't exist yet, return friendly message
      res.status(200).send('LUMEN LUXE Backend API Server is actively running. Launch Vite for frontend development.');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 LUMEN LUXE BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;
