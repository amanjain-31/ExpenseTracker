/**
 * Generate a UUID v4 idempotency key
 * Used to prevent duplicate requests from creating duplicate expenses
 */
export function generateIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retry with exponential backoff
 * Handles transient network failures
 */
async function retryFetch(url, options, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Only retry on network/timeout errors, not on 4xx/5xx
      if (response.ok || response.status >= 400) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;

      // Don't retry on the last attempt
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * API client for expense operations
 * Handles idempotency and retry logic
 */
export const expenseAPI = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',

  /**
   * Create a new expense
   * @param {Object} expense - { amount (cents), category, description, date }
   * @returns {Promise<Object>} Created expense with id and createdAt
   */
  async createExpense(expense) {
    const idempotencyKey = generateIdempotencyKey();

    const response = await retryFetch(`${this.baseURL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(expense),
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.error || 'Failed to create expense');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Get all expenses
   * @param {Object} filters - { startDate, endDate, category }
   * @returns {Promise<Object>} { expenses: [...] }
   */
  async getExpenses(filters = {}) {
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);

    const queryString = params.toString();
    const url = queryString ? `${this.baseURL}/expenses?${queryString}` : `${this.baseURL}/expenses`;

    const response = await retryFetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch expenses');
    }

    return data;
  },

  /**
   * Delete an expense
   * @param {string} id - Expense ID
   * @returns {Promise<Object>} { message, id }
   */
  async deleteExpense(id) {
    const idempotencyKey = generateIdempotencyKey();

    const response = await retryFetch(`${this.baseURL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete expense');
    }

    return data;
  },
};
