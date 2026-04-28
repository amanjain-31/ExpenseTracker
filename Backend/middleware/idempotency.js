const ProcessedRequest = require('../models/ProcessedRequest');

/**
 * Idempotency middleware for handling duplicate requests.
 * 
 * Strategy: Cache responses by idempotency key
 * - For POST, PUT, DELETE requests with X-Idempotency-Key header
 * - If key exists in cache: return cached response (no side effects)
 * - If key is new: process request and cache the response
 * 
 * This prevents duplicate expense creation from:
 * - Double-click submissions
 * - Browser retry logic
 * - Network timeouts with automatic retries
 * - Page refreshes before response arrives
 */
const idempotencyMiddleware = async (req, res, next) => {
  // Only apply to mutation requests
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['x-idempotency-key'];

  // Require idempotency key on all mutations
  if (!idempotencyKey) {
    const err = new Error('X-Idempotency-Key header is required');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Check if this request has been processed before
    const existingRequest = await ProcessedRequest.findOne({ idempotencyKey });

    if (existingRequest) {
      // Return cached response without re-processing
      return res.status(existingRequest.response.statusCode).json(existingRequest.response.body);
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    let statusCode = 200;

    res.status = function(code) {
      statusCode = code;
      return originalStatus(code);
    };

    res.json = function(body) {
      // Cache this response for future identical requests
      ProcessedRequest.create({
        idempotencyKey,
        method: req.method,
        endpoint: req.path,
        response: {
          statusCode,
          body,
        },
      }).catch(err => {
        // Log but don't fail the response if caching fails
        console.error('Failed to cache processed request:', err);
      });

      return originalJson(body);
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { idempotencyMiddleware };
