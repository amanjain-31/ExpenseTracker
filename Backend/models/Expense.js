const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    // Amount stored as integer cents (e.g., $10.50 = 1050 cents)
    // This avoids floating-point precision errors
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1 cent'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be an integer (cents)',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['food', 'transport', 'entertainment', 'utilities', 'other'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
