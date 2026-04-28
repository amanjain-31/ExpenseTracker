/**
 * Format cents to USD string
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted as "$XX.XX"
 */
export function formatCurrency(cents) {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

/**
 * Convert USD string to cents
 * @param {string} dollarString - Amount like "10.50" or "10"
 * @returns {number} Amount in cents
 */
export function dollarsToCents(dollarString) {
  const dollars = parseFloat(dollarString);
  if (isNaN(dollars)) {
    throw new Error('Invalid amount');
  }
  // Round to nearest cent to handle floating point issues
  return Math.round(dollars * 100);
}

/**
 * Format ISO date to "MMM DD, YYYY"
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format ISO date to "YYYY-MM-DD" for input type="date"
 */
export function formatDateForInput(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in "YYYY-MM-DD" format
 */
export function getTodayForInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
