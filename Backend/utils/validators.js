/**
 * Validate expense input data
 */
function validateExpense({ amount, category, description, date }) {
  // Validate amount
  if (amount === undefined || amount === null) {
    return { valid: false, error: 'Amount is required' };
  }

  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Amount must be an integer (cents)' };
  }

  if (amount < 1) {
    return { valid: false, error: 'Amount must be at least 1 cent' };
  }

  // Validate category
  const validCategories = ['food', 'transport', 'entertainment', 'utilities', 'other'];
  if (!category || !validCategories.includes(category)) {
    return { valid: false, error: `Category must be one of: ${validCategories.join(', ')}` };
  }

  // Validate description
  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Description is required' };
  }

  if (description.trim().length === 0) {
    return { valid: false, error: 'Description cannot be empty' };
  }

  if (description.length > 200) {
    return { valid: false, error: 'Description cannot exceed 200 characters' };
  }

  // Validate date
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Date must be a valid ISO date string' };
  }

  return { valid: true };
}

module.exports = { validateExpense };
