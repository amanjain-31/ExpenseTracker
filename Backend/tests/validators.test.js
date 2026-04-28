const test = require('node:test');
const assert = require('node:assert');
const { validateExpense } = require('../utils/validators');

test('validateExpense should accept valid expense', (t) => {
  const result = validateExpense({
    amount: 1500,
    category: 'food',
    description: 'Lunch',
    date: '2023-10-05T12:00:00Z'
  });
  assert.strictEqual(result.valid, true);
});

test('validateExpense should reject negative amount', (t) => {
  const result = validateExpense({
    amount: -500,
    category: 'food',
    description: 'Lunch',
    date: '2023-10-05T12:00:00Z'
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Amount must be at least 1 cent');
});

test('validateExpense should reject non-integer amount', (t) => {
  const result = validateExpense({
    amount: 15.50, // Should be passed as cents (1550)
    category: 'food',
    description: 'Lunch',
    date: '2023-10-05T12:00:00Z'
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Amount must be an integer (cents)');
});

test('validateExpense should reject invalid category', (t) => {
  const result = validateExpense({
    amount: 1000,
    category: 'magic',
    description: 'Tricks',
    date: '2023-10-05T12:00:00Z'
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.error.includes('Category must be one of'));
});

test('validateExpense should reject empty description', (t) => {
  const result = validateExpense({
    amount: 1000,
    category: 'food',
    description: '   ',
    date: '2023-10-05T12:00:00Z'
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Description cannot be empty');
});

test('validateExpense should reject invalid date', (t) => {
  const result = validateExpense({
    amount: 1000,
    category: 'food',
    description: 'Lunch',
    date: 'Not a date'
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Date must be a valid ISO date string');
});
