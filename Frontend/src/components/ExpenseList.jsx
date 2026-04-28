import { useState, useEffect, useMemo } from 'react';
import { expenseAPI } from '../api/expenseClient';
import { formatCurrency, formatDate } from '../utils/formatting';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search } from 'lucide-react';
import './ExpenseList.css';

export default function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'date_desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const loadExpenses = async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
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
    loadExpenses(newFilters);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseAPI.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(exp => 
      exp.description.toLowerCase().includes(query)
    );
  }, [expenses, searchQuery]);

  if (isLoading) {
    return <div className="expense-list glass-panel"><p className="loading-text">Loading expenses...</p></div>;
  }

  if (error) {
    return <div className="expense-list glass-panel"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="expense-list glass-panel">
      <div className="list-header">
        <h2>Recent Transactions</h2>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

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

      {filteredExpenses.length === 0 ? (
        <p className="empty-state">No matching expenses found.</p>
      ) : (
        <div className="expenses-table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th className="action-header">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredExpenses.map(expense => (
                  <motion.tr 
                    key={expense.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="date-cell">{formatDate(expense.date)}</td>
                    <td className="category-cell">
                      <span className="category-badge">
                        {getCategoryEmoji(expense.category)} {expense.category}
                      </span>
                    </td>
                    <td className="description-cell">{expense.description}</td>
                    <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                    <td className="action-cell">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="delete-btn"
                        onClick={() => handleDelete(expense.id)}
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
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
