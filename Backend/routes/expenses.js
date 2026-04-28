const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { validateExpense } = require('../utils/validators');
const auth = require('../middleware/auth');

// Apply auth middleware to all expense routes
router.use(auth);

/**
 * POST /api/expenses
 */
router.post('/', async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    const validation = validateExpense({ amount, category, description, date });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.statusCode = 400;
      return next(err);
    }

    const expense = new Expense({
      description,
      amount,
      category,
      date: new Date(date),
      user: req.user.id,
    });

    await expense.save();

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
 */
router.get('/', async (req, res, next) => {
  try {
    const query = { user: req.user.id };

    if (req.query.category) {
      const validCategories = ['food', 'transport', 'entertainment', 'utilities', 'other'];
      if (!validCategories.includes(req.query.category)) {
        const err = new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        err.statusCode = 400;
        return next(err);
      }
      query.category = req.query.category;
    }

    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    let sortOptions = { date: -1 };
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'date_asc': sortOptions = { date: 1 }; break;
        case 'date_desc': sortOptions = { date: -1 }; break;
        case 'amount_desc': sortOptions = { amount: -1 }; break;
        case 'amount_asc': sortOptions = { amount: 1 }; break;
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
 */
router.get('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

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
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

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
