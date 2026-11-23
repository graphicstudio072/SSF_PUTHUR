const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');

// Import Route handlers
const authRoutes = require('./routes/authRoutes');
const unitRoutes = require('./routes/unitRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads folder for uploaded logos and posters
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    server: 'SSF PUTHUR SECTOR Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Production Single-Service Support: Serve client/dist if present
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // Any non-API route serves the frontend SPA index.html
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
connectDB().then(async (connected) => {
  if (connected) {
    await seedDatabase();
  }
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 SSF PUTHUR SECTOR API Server is running`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📁 Uploads Static: http://localhost:${PORT}/uploads`);
    console.log(`===============================================`);
  });
});
