import { useState, useEffect } from 'react';
import { expenseAPI } from '../api/expenseClient';
import { formatCurrency, formatDate } from '../utils/formatting';
import './ExpenseList.css';

export default function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'date_desc',
  });

  const loadExpenses = async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query object with non-empty filters
      const queryFilters = {};
      if (currentFilters.category) queryFilters.category = currentFilters.category;
      if (currentFilters.sort) queryFilters.sort = currentFilters.sort;

      const data = await expenseAPI.getExpenses(queryFilters);
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setError(err.message || 'Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses(filters);
  }, [refreshTrigger]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    // Reload expenses with new filters
    loadExpenses(newFilters);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseAPI.deleteExpense(id);
      // Remove from list
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="expense-list"><p>Loading expenses...</p></div>;
  }

  if (error) {
    return <div className="expense-list"><p className="error-message">{error}</p></div>;
  }

  if (expenses.length === 0) {
    return <div className="expense-list"><p className="empty-state">No expenses yet. Add your first expense!</p></div>;
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expense-list">
      <h2>Expenses</h2>

      {/* Filter and Sort Controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="food">🍔 Food</option>
            <option value="transport">🚗 Transport</option>
            <option value="entertainment">🎬 Entertainment</option>
            <option value="utilities">💡 Utilities</option>
            <option value="other">📌 Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort:</label>
          <select
            id="sort-filter"
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Cost First</option>
            <option value="amount_asc">Lowest Cost First</option>
          </select>
        </div>
      </div>

      <div className="total-section">
        <p className="total-label">Total Spent:</p>
        <p className="total-amount">{formatCurrency(totalAmount)}</p>
      </div>

      <div className="expenses-table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td>{formatDate(expense.date)}</td>
                <td className="category-cell">
                  {getCategoryEmoji(expense.category)} {expense.category}
                </td>
                <td>{expense.description}</td>
                <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                <td className="action-cell">
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(expense.id)}
                    title="Delete expense"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const emojis = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    other: '📌',
  };
  return emojis[category] || '📌';
}
