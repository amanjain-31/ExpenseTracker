/**
 * Format cents to INR string
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted as "₹XX.XX"
 */
export function formatCurrency(cents) {
  const rupees = cents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(rupees);
}

/**
 * Convert INR string to cents
 * @param {string} rupeeString - Amount like "10.50" or "10"
 * @returns {number} Amount in cents
 */
export function dollarsToCents(rupeeString) {
  const rupees = parseFloat(rupeeString);
  if (isNaN(rupees)) {
    throw new Error('Invalid amount');
  }
  // Round to nearest cent to handle floating point issues
  return Math.round(rupees * 100);
}

/**
 * Format ISO date to "DD MMM YYYY"
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
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
