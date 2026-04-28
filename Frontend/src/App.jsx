import { useState, useEffect, useMemo, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { expenseAPI } from './api/expenseClient';
import { formatCurrency, formatDate } from './utils/formatting';
import { AuthContext } from './context/AuthContext';
import ExpenseForm from './components/ExpenseForm';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function DashboardView() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [budget, setBudget] = useState('25000');
  
  // View Controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateWindow, setDateWindow] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await expenseAPI.getExpenses({});
        setExpenses(data.expenses || []);
      } catch (err) {
        console.error('Failed to load expenses', err);
      }
    };
    fetchExpenses();
  }, [refreshTrigger]);

  const handleExpenseCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseAPI.deleteExpense(id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to delete expense', err);
      alert('Failed to delete expense');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => e.description.toLowerCase().includes(query) || e.category.toLowerCase().includes(query));
    }
    if (selectedCategory) {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (dateWindow === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(e => new Date(e.date) >= firstDay);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [expenses, searchQuery, selectedCategory, dateWindow, sortOrder]);

  const visibleSpend = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgTransaction = filteredExpenses.length ? visibleSpend / filteredExpenses.length : 0;
  
  const currentMonthExpenses = expenses.filter(e => {
    const now = new Date();
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const mtdSpend = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetLeft = Math.max(0, parseFloat(budget || 0) * 100 - mtdSpend);
  
  let largestExpense = null;
  if (filteredExpenses.length > 0) {
    largestExpense = filteredExpenses.reduce((max, e) => e.amount > max.amount ? e : max, filteredExpenses[0]);
  }

  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  
  const categoryList = Object.entries(categoryTotals).map(([cat, amt]) => ({
    category: cat,
    amount: amt,
    percentage: visibleSpend ? (amt / visibleSpend) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const getCategoryColor = (cat) => {
    const colors = { food: '#e07a3c', transport: '#3aa394', other: '#9ca3af', utilities: '#06b6d4', entertainment: '#8b5cf6' };
    return colors[cat] || colors.other;
  };

  const todayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const budgetUsedPct = parseFloat(budget) > 0 ? Math.min(100, (mtdSpend / (parseFloat(budget) * 100)) * 100) : 0;

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ['Date', 'Category', 'Description', 'Amount (INR)'];
    const csvRows = filteredExpenses.map(exp => [
      formatDate(exp.date),
      exp.category,
      `"${exp.description.replace(/"/g, '""')}"`,
      (exp.amount / 100).toFixed(2)
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="layout-container">
      <div className="header-section">
        <div className="header-left">
          <div className="header-label">EXPENSE INTELLIGENCE</div>
          <h1>Control every rupee with a realistic money command center.</h1>
          <p>Welcome back, {user?.name}. Track expenses, monitor budget burn, search quickly, and understand spending patterns.</p>
        </div>
        <div className="header-right">
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <div className="theme-pill">Theme: Sunrise Ledger</div>
            <button onClick={handleLogout} className="theme-pill" style={{cursor: 'pointer', background: 'var(--danger-light)', color: 'var(--danger)', border: 'none'}}>Logout</button>
          </div>
          <div className="date-text">{todayStr}</div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass-card">
          <h3>Visible spend</h3>
          <div className="amount">{formatCurrency(visibleSpend)}</div>
          <p>{filteredExpenses.length} records in view</p>
        </div>
        <div className="summary-card glass-card">
          <h3>Average transaction</h3>
          <div className="amount">{formatCurrency(avgTransaction)}</div>
          <p>Across filtered entries</p>
        </div>
        <div className="summary-card glass-card">
          <h3>Month to date</h3>
          <div className="amount">{formatCurrency(mtdSpend)}</div>
          <p>Budget left: {formatCurrency(budgetLeft)}</p>
        </div>
        <div className="summary-card glass-card">
          <h3>Largest expense</h3>
          <div className="amount">{largestExpense ? formatCurrency(largestExpense.amount) : '₹0.00'}</div>
          <p>{largestExpense ? `${largestExpense.category} on ${formatDate(largestExpense.date)}` : '-'}</p>
        </div>
      </div>

      <div className="main-grid">
        <div className="col-left">
          <ExpenseForm onExpenseCreated={handleExpenseCreated} />

          <div className="glass-card">
            <div className="section-label">DISTRIBUTION</div>
            <h2 className="card-title">Category breakdown</h2>
            <div className="category-bars">
              {categoryList.map(item => (
                <div key={item.category} className="cat-bar-item">
                  <div className="cat-bar-header">
                    <span style={{textTransform: 'capitalize'}}>{item.category}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${item.percentage}%`, backgroundColor: getCategoryColor(item.category) }}></div>
                  </div>
                  <div className="cat-bar-pct">{item.percentage.toFixed(1)}%</div>
                </div>
              ))}
              {categoryList.length === 0 && <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>No data for current filters.</p>}
            </div>
          </div>
        </div>

        <div className="col-right">
          <div className="glass-card view-controls">
            <div className="section-label">FILTERS AND BUDGET</div>
            <h2 className="card-title">View controls</h2>
            
            <div className="control-group">
              <label>Search</label>
              <input type="text" placeholder="Search category or description" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            
            <div className="control-group">
              <label>Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">All categories</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Date window</label>
              <select value={dateWindow} onChange={e => setDateWindow(e.target.value)}>
                <option value="all">All time</option>
                <option value="month">This month</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Sort by date</label>
              <div className="toggle-group">
                <button className={sortOrder === 'newest' ? 'active' : ''} onClick={() => setSortOrder('newest')}>Newest</button>
                <button className={sortOrder === 'oldest' ? 'active' : ''} onClick={() => setSortOrder('oldest')}>Oldest</button>
              </div>
            </div>

            <div className="control-group">
              <label>Monthly budget (INR)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} />
              <div className="budget-track">
                <div className="budget-fill" style={{ width: `${budgetUsedPct}%`, backgroundColor: budgetUsedPct > 90 ? '#e07a3c' : '#3aa394' }}></div>
              </div>
              <div className="budget-label">{budgetUsedPct.toFixed(0)}% of monthly budget used</div>
            </div>
          </div>

          <div className="glass-card transactions-ledger">
            <div className="ledger-header-row">
              <div>
                <div className="section-label">EXPENSES</div>
                <h2 className="card-title" style={{marginBottom: 0}}>Transactions ledger</h2>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <button onClick={handleExportCSV} style={{background: 'transparent', border: '1px solid var(--input-border)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer'}}>
                  Export CSV
                </button>
                <div className="record-count">{filteredExpenses.length} records</div>
              </div>
            </div>
            
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>AMOUNT</th>
                  <th>CATEGORY</th>
                  <th>DESCRIPTION</th>
                  <th>DATE</th>
                  <th style={{textAlign: 'right'}}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.slice(0, 10).map(exp => (
                  <tr key={exp.id}>
                    <td style={{fontWeight: 600}}>{formatCurrency(exp.amount)}</td>
                    <td style={{textTransform: 'capitalize'}}>{exp.category}</td>
                    <td>{exp.description}</td>
                    <td>{formatDate(exp.date)}</td>
                    <td style={{textAlign: 'right'}}>
                      <button onClick={() => handleDelete(exp.id)} style={{background: 'transparent', color: '#d9534f', padding: '4px 8px', fontSize: '0.8rem', fontWeight: '600', border: 'none', cursor: 'pointer'}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExpenses.length > 10 && <div style={{textAlign:'center', fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'1rem'}}>Showing 10 of {filteredExpenses.length}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardView />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
