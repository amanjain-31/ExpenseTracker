import { useState } from 'react';
import { expenseAPI } from '../api/expenseClient';
import { dollarsToCents, getTodayForInput } from '../utils/formatting';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
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
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const amountInCents = dollarsToCents(formData.amount);

      const createdExpense = await expenseAPI.createExpense({
        amount: amountInCents,
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      setFormData({
        amount: '',
        category: 'food',
        description: '',
        date: getTodayForInput(),
      });

      onExpenseCreated?.(createdExpense);
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError(err.message || 'Failed to create expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form glass-panel">
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

      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        type="submit" 
        className="submit-btn"
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
      >
        <PlusCircle size={20} />
        {isLoading ? 'Adding...' : 'Add Expense'}
      </motion.button>
    </form>
  );
}
