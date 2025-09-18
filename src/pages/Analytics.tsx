import React, { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatIndianCurrency, getCategoryColor, getCategoryIcon } from '../utils/currency';
import { getMonthName, getCurrentYear } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, PieChart, Calendar, Target } from 'lucide-react';

const Analytics: React.FC = () => {
  const { state } = useExpenses();
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const analytics = useMemo(() => {
    const yearExpenses = state.expenses.filter(expense => 
      new Date(expense.date).getFullYear() === selectedYear
    );

    // Category breakdown
    const categoryTotals = yearExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly breakdown
    const monthlyTotals = Array(12).fill(0);
    yearExpenses.forEach(expense => {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] += expense.amount;
    });

    const monthlyData = monthlyTotals.map((amount, index) => ({
      month: getMonthName(index),
      amount,
      expenses: yearExpenses.filter(expense => 
        new Date(expense.date).getMonth() === index
      ).length
    }));

    // Trends
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentMonthTotal = monthlyTotals[currentMonth];
    const lastMonthTotal = monthlyTotals[lastMonth];
    const monthlyTrend = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    const maxMonth = monthlyData.reduce((max, month) => 
      month.amount > max.amount ? month : max, monthlyData[0]);
    const avgMonthly = totalAmount / 12;

    // Available years
    const availableYears = [...new Set(state.expenses.map(expense => 
      new Date(expense.date).getFullYear()
    ))].sort((a, b) => b - a);

    return {
      categoryBreakdown,
      monthlyData,
      totalAmount,
      avgMonthly,
      maxMonth: maxMonth || { month: 'None', amount: 0 },
      monthlyTrend,
      transactionCount: yearExpenses.length,
      availableYears: availableYears.length > 0 ? availableYears : [getCurrentYear()]
    };
  }, [state.expenses, selectedYear]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          📊 Analytics & Insights
        </h1>
        <p className="text-gray-600">Understand your spending patterns</p>
      </div>

      {/* Year Selector */}
      <div className="mb-6 flex justify-center">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        >
          {analytics.availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Spent ({selectedYear})</p>
              <p className="text-2xl font-bold">{formatIndianCurrency(analytics.totalAmount)}</p>
            </div>
            <Target className="h-10 w-10 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Monthly Average</p>
              <p className="text-2xl font-bold">{formatIndianCurrency(analytics.avgMonthly)}</p>
            </div>
            <Calendar className="h-10 w-10 text-green-100" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Highest Month</p>
              <p className="text-lg font-bold">{analytics.maxMonth.month}</p>
              <p className="text-sm">{formatIndianCurrency(analytics.maxMonth.amount)}</p>
            </div>
            <PieChart className="h-10 w-10 text-orange-100" />
          </div>
        </div>

        <div className={`bg-gradient-to-r ${analytics.monthlyTrend >= 0 ? 'from-red-500 to-pink-500' : 'from-green-500 to-emerald-500'} text-white rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm">Monthly Trend</p>
              <p className="text-2xl font-bold">
                {analytics.monthlyTrend >= 0 ? '+' : ''}{analytics.monthlyTrend.toFixed(1)}%
              </p>
            </div>
            {analytics.monthlyTrend >= 0 ? 
              <TrendingUp className="h-10 w-10 text-white text-opacity-80" /> :
              <TrendingDown className="h-10 w-10 text-white text-opacity-80" />
            }
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            📈 Category Breakdown
          </h2>
          {analytics.categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{item.category}</p>
                      <div className="w-48 bg-gray-200 rounded-full h-3 mt-1">
                        <div
                          className={`${getCategoryColor(item.category)} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatIndianCurrency(item.amount)}</p>
                    <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available for {selectedYear}</p>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            📅 Monthly Spending
          </h2>
          {analytics.totalAmount > 0 ? (
            <div className="space-y-3">
              {analytics.monthlyData.map((month, index) => {
                const percentage = analytics.totalAmount > 0 ? (month.amount / analytics.totalAmount) * 100 : 0;
                const isCurrentMonth = index === new Date().getMonth();
                
                return (
                  <div key={month.month} className={`p-3 rounded-lg ${isCurrentMonth ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${isCurrentMonth ? 'text-orange-600' : 'text-gray-700'}`}>
                        {month.month} {isCurrentMonth && '(Current)'}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{formatIndianCurrency(month.amount)}</p>
                        <p className="text-xs text-gray-500">{month.expenses} expenses</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${isCurrentMonth ? 'bg-orange-500' : 'bg-blue-500'} h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No expenses recorded for {selectedYear}</p>
          )}
        </div>
      </div>

      {/* Spending Insights */}
      {analytics.totalAmount > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">💡 Spending Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Top Category</h3>
              <p className="text-2xl">{getCategoryIcon(analytics.categoryBreakdown[0]?.category || '')}</p>
              <p className="text-sm">{analytics.categoryBreakdown[0]?.category || 'N/A'}</p>
              <p className="text-xs opacity-90">
                {analytics.categoryBreakdown[0] ? 
                  formatIndianCurrency(analytics.categoryBreakdown[0].amount) : '₹0'}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Daily Average</h3>
              <p className="text-xl font-bold">
                {formatIndianCurrency(analytics.totalAmount / 365)}
              </p>
              <p className="text-sm opacity-90">Per day spending</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Total Transactions</h3>
              <p className="text-xl font-bold">{analytics.transactionCount}</p>
              <p className="text-sm opacity-90">
                Avg: {formatIndianCurrency(analytics.totalAmount / Math.max(analytics.transactionCount, 1))} per expense
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;