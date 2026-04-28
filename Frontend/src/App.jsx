import { useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseCreated = (expense) => {
    // Trigger a refresh of the expense list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your spending with confidence</p>
      </header>

      <main className="app-main">
        <ExpenseForm onExpenseCreated={handleExpenseCreated} />
        <ExpenseList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;
