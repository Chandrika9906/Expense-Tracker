import React, { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatIndianCurrency, getCategoryColor, getCategoryIcon } from '../utils/currency';
import { getCurrentMonth, getCurrentYear } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useExpenses();

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = getCurrentYear();
    
    const thisMonthExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const lastMonthExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });

    const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalLastMonth = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAllTime = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const categoryTotals = state.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const monthlyChange = totalLastMonth > 0 
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
      : 0;

    return {
      totalThisMonth,
      totalLastMonth,
      totalAllTime,
      transactionCount: state.expenses.length,
      monthlyChange,
      topCategories,
      recentExpenses: state.expenses.slice(0, 5)
    };
  }, [state.expenses]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to your Dashboard 🏠
        </h1>
        <p className="text-gray-600">Track your expenses and manage your finances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">{formatIndianCurrency(stats.totalThisMonth)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">{formatIndianCurrency(stats.totalAllTime)}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Transactions</p>
              <p className="text-2xl font-bold">{stats.transactionCount}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-100" />
          </div>
        </div>

        <div className={`bg-gradient-to-r ${stats.monthlyChange >= 0 ? 'from-red-500 to-pink-500' : 'from-green-500 to-emerald-500'} text-white rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm">Monthly Change</p>
              <p className="text-2xl font-bold">
                {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}%
              </p>
            </div>
            {stats.monthlyChange >= 0 ? 
              <TrendingUp className="h-10 w-10 text-white text-opacity-80" /> :
              <TrendingDown className="h-10 w-10 text-white text-opacity-80" />
            }
          </div>
        </div>
      </div>

      {/* Recent Expenses and Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            📋 Recent Expenses
          </h2>
          {stats.recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatIndianCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No expenses yet</p>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            🏆 Top Spending Categories
          </h2>
          {stats.topCategories.length > 0 ? (
            <div className="space-y-4">
              {stats.topCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{category}</p>
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getCategoryColor(category)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${(amount / stats.totalAllTime) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatIndianCurrency(amount)}</p>
                    <p className="text-xs text-gray-500">
                      {((amount / stats.totalAllTime) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">✨ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
            <h3 className="font-semibold">📊 View Analytics</h3>
            <p className="text-sm opacity-90">See detailed spending insights</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
            <h3 className="font-semibold">➕ Add Expense</h3>
            <p className="text-sm opacity-90">Record a new expense</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
            <h3 className="font-semibold">📋 Manage Expenses</h3>
            <p className="text-sm opacity-90">Edit or delete expenses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;