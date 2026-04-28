import { useState } from 'react';
import { motion } from 'framer-motion';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';
import { WalletCards } from 'lucide-react';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <motion.header 
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><WalletCards size={40} className="header-icon" /> Expense Tracker</h1>
        <p>Track your spending with confidence</p>
      </motion.header>

      <main className="app-main">
        <motion.div 
          className="app-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ExpenseForm onExpenseCreated={handleExpenseCreated} />
        </motion.div>
        
        <div className="app-content">
          <Dashboard refreshTrigger={refreshTrigger} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ExpenseList refreshTrigger={refreshTrigger} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
