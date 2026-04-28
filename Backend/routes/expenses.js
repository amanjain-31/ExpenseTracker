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
 * Retrieves all expenses with optional filtering and sorting
 * 
 * Query params:
 *   category: string          → filter by category (food, transport, entertainment, utilities, other)
 *   sort: string              → sort order (date_desc=default, date_asc, amount_desc, amount_asc)
 *   startDate: string (ISO)   → filter by date range start
 *   endDate: string (ISO)     → filter by date range end
 * 
 * Examples:
 *   GET /api/expenses                                    → all expenses, newest first
 *   GET /api/expenses?category=food                      → food expenses, newest first
 *   GET /api/expenses?sort=date_asc                      → all expenses, oldest first
 *   GET /api/expenses?category=food&sort=amount_desc    → food expenses, highest cost first
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

    // Filter by category if provided
    if (req.query.category) {
      const validCategories = ['food', 'transport', 'entertainment', 'utilities', 'other'];
      if (!validCategories.includes(req.query.category)) {
        const err = new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        err.statusCode = 400;
        return next(err);
      }
      query.category = req.query.category;
    }

    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        if (isNaN(startDate.getTime())) {
          const err = new Error('Invalid startDate. Must be a valid ISO date string');
          err.statusCode = 400;
          return next(err);
        }
        query.date.$gte = startDate;
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        if (isNaN(endDate.getTime())) {
          const err = new Error('Invalid endDate. Must be a valid ISO date string');
          err.statusCode = 400;
          return next(err);
        }
        query.date.$lte = endDate;
      }
    }

    // Determine sort order
    let sortOptions = { date: -1 }; // Default: newest first
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'date_asc':
          sortOptions = { date: 1 };
          break;
        case 'date_desc':
          sortOptions = { date: -1 };
          break;
        case 'amount_desc':
          sortOptions = { amount: -1 };
          break;
        case 'amount_asc':
          sortOptions = { amount: 1 };
          break;
        default:
          const err = new Error('Invalid sort parameter. Must be one of: date_desc, date_asc, amount_desc, amount_asc');
          err.statusCode = 400;
          return next(err);
      }
    }

    const expenses = await Expense.find(query).sort(sortOptions).lean();

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
