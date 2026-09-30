// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static frontend in production if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// Root health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Khan Academy Kids Parent Companion API' });
});

// Any non-API route serves the frontend index.html if built
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.json({
        message: 'Khan Academy Kids Academic Prototype Backend API is running.',
        endpoints: [
          '/api/children/:childId',
          '/api/children/:childId/daily-summary',
          '/api/children/:childId/practice-opportunity',
          '/api/activities/:activityId',
          '/api/children/:childId/observations',
          '/api/demo/reset',
          '/api/config/version',
        ],
      });
    }
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
