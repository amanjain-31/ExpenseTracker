const mongoose = require('mongoose');

const processedRequestSchema = new mongoose.Schema(
  {
    // Unique idempotency key (UUID v4) from client
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    // Cached response to return for duplicate requests
    response: {
      statusCode: Number,
      body: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: automatically delete documents after 24 hours
// This prevents unbounded growth of the cache
processedRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('ProcessedRequest', processedRequestSchema);
