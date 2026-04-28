import { useState, useEffect } from 'react';
import { expenseAPI } from '../api/expenseClient';
import { formatCurrency } from '../utils/formatting';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import './Dashboard.css';

const CATEGORY_COLORS = {
  food: '#ef4444',
  transport: '#f59e0b',
  entertainment: '#8b5cf6',
  utilities: '#06b6d4',
  other: '#64748b',
};

const CATEGORY_LABELS = {
  food: 'Food 🍔',
  transport: 'Transport 🚗',
  entertainment: 'Entertainment 🎬',
  utilities: 'Utilities 💡',
  other: 'Other 📌',
};

export default function Dashboard({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await expenseAPI.getExpenses({});
        setExpenses(data.expenses || []);
      } catch (err) {
        console.error('Failed to load expenses for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadExpenses();
  }, [refreshTrigger]);

  if (isLoading) {
    return <div className="dashboard-loading glass-panel">Loading dashboard...</div>;
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by category for Pie Chart
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: CATEGORY_LABELS[category] || category,
    value: amount / 100, // Convert to dollars for display
    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
  })).sort((a, b) => b.value - a.value);

  // Group by date for Bar Chart (Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const expensesByDate = expenses.reduce((acc, exp) => {
    const date = exp.date.split('T')[0];
    acc[date] = (acc[date] || 0) + exp.amount;
    return acc;
  }, {});

  const barData = last7Days.map(date => {
    const [year, month, day] = date.split('-');
    return {
      date: `${month}/${day}`,
      amount: (expensesByDate[date] || 0) / 100,
    };
  });

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="summary-cards">
        <div className="summary-card glass-panel">
          <h3>Total Spending</h3>
          <p className="summary-value gradient-text">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="summary-card glass-panel">
          <h3>Top Category</h3>
          <p className="summary-value">
            {pieData.length > 0 ? pieData[0].name : 'N/A'}
          </p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h3>Spending by Category</h3>
          {pieData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-chart">No data available</p>
          )}
        </div>

        <div className="chart-card glass-panel">
          <h3>Last 7 Days</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                  cursor={{ fill: 'var(--primary-light)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-card-solid)', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
