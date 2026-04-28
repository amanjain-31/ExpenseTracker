const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { validateExpense } = require('../utils/validators');

/**
 * POST /api/expenses
 * 
 * Creates a new expense entry.
 * 
 * Request body:
 * {
 *   amount: number,      // in cents (e.g., 1050 for $10.50)
 *   category: string,    // one of: food, transport, entertainment, utilities, other
 *   description: string, // what was spent on
 *   date: string         // ISO date string (YYYY-MM-DD)
 * }
 * 
 * Headers:
 *   X-Idempotency-Key: string (UUID v4)
 * 
 * Response (201):
 * {
 *   id: string,
 *   amount: number,
 *   category: string,
 *   description: string,
 *   date: string,
 *   createdAt: string
 * }
 */
router.post('/', async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validate input
    const validation = validateExpense({ amount, category, description, date });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      return next(err);
    }

    // Create expense
    const expense = new Expense({
      description,
      amount, // Already validated as integer cents
      category,
      date: new Date(date),
    });

    await expense.save();

    // Return with 201 Created status
    res.status(201).json({
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/expenses
 * 
 * Retrieves all expenses, optionally filtered by date range or category
 * 
 * Query params:
 *   startDate: string (ISO date)
 *   endDate: string (ISO date)
 *   category: string
 * 
 * Response (200):
 * {
 *   expenses: [
 *     { id, amount, category, description, date, createdAt }
 *   ]
 * }
 */
router.get('/', async (req, res, next) => {
  try {
    const query = {};

    // Optional: filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Optional: filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();

    res.json({
      expenses: expenses.map(exp => ({
        id: exp._id.toString(),
        amount: exp.amount,
        category: exp.category,
        description: exp.description,
        date: exp.date.toISOString(),
        createdAt: exp.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/expenses/:id
 * 
 * Retrieves a single expense by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      const err = new Error('Expense not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      id: expense._id.toString(),
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/expenses/:id
 * 
 * Deletes an expense by ID (requires idempotency key)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      const err = new Error('Expense not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      message: 'Expense deleted',
      id: expense._id.toString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
