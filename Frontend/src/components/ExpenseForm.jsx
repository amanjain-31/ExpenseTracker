import { useState } from 'react';
import { expenseAPI } from '../api/expenseClient';
import { dollarsToCents, getTodayForInput } from '../utils/formatting';
import './ExpenseForm.css';

export default function ExpenseForm({ onExpenseCreated }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: getTodayForInput(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Convert dollars to cents
      const amountInCents = dollarsToCents(formData.amount);

      // Send to API
      const createdExpense = await expenseAPI.createExpense({
        amount: amountInCents,
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      // Reset form
      setFormData({
        amount: '',
        category: 'food',
        description: '',
        date: getTodayForInput(),
      });

      // Notify parent
      onExpenseCreated?.(createdExpense);
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError(err.message || 'Failed to create expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Add Expense</h2>

      <div className="form-group">
        <label htmlFor="amount">Amount ($)</label>
        <input
          id="amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="food">🍔 Food</option>
          <option value="transport">🚗 Transport</option>
          <option value="entertainment">🎬 Entertainment</option>
          <option value="utilities">💡 Utilities</option>
          <option value="other">📌 Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What did you spend on?"
          maxLength="200"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}
