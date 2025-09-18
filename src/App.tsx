import React, { useState } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import ViewExpenses from './pages/ViewExpenses';
import Analytics from './pages/Analytics';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <AddExpense />;
      case 'expenses':
        return <ViewExpenses />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="py-8">
          {renderPage()}
        </main>
      </div>
    </ExpenseProvider>
  );
}

export default App;