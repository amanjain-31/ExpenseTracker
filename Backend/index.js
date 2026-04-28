require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
mongoose.connect(mongoUri)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models to register them
require('./models/Expense');
require('./models/ProcessedRequest');

// Import middleware
const { idempotencyMiddleware } = require('./middleware/idempotency');

// Import routes
const expenseRoutes = require('./routes/expenses');

// Apply idempotency middleware globally for POST/PUT/DELETE
app.use(idempotencyMiddleware);

// Routes
app.use('/api/expenses', expenseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
