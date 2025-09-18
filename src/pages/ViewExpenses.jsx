import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatIndianCurrency, getCategoryColor, getCategoryIcon } from '../utils/currency';
import { formatDate, formatDateForInput } from '../utils/dateUtils';
import { Search, Edit2, Trash2, Filter, X, Check } from 'lucide-react';
import NotificationToast from '../components/NotificationToast';

const ViewExpenses = () => {
  const { state, updateExpense, deleteExpense } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    category: '',
    date: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredExpenses = useMemo(() => {
    return state.expenses.filter(expense => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || expense.category === categoryFilter;
      const matchesDate = !dateFilter || expense.date.includes(dateFilter);

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [state.expenses, searchTerm, categoryFilter, dateFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      date: formatDateForInput(expense.date)
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editForm.amount && editForm.description && editForm.category && editForm.date) {
      updateExpense(editingId, {
        amount: Number(editForm.amount),
        description: editForm.description,
        category: editForm.category,
        date: editForm.date
      });
      setEditingId(null);
      setToastMessage('Expense updated successfully! ✏️');
      setShowToast(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ amount: '', description: '', category: '', date: '' });
  };

  const handleDelete = (id, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      deleteExpense(id);
      setToastMessage('Expense deleted successfully! 🗑️');
      setShowToast(true);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setDateFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          📋 Manage Expenses
        </h1>
        <p className="text-gray-600">View, edit, and organize your expenses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="mr-2" size={20} />
            Filters & Search
          </h2>
          <button
            onClick={clearFilters}
            className="text-orange-500 hover:text-orange-600 flex items-center space-x-1"
          >
            <X size={16} />
            <span>Clear All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Categories</option>
            {state.categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xl font-bold text-orange-600">
              Total: {formatIndianCurrency(totalFilteredAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {editingId === expense.id ? (
                /* Edit Mode */
                <div className="p-6 border-l-4 border-orange-500">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Description"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {state.categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Check size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(expense.category)}`}></div>
                      <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{expense.description}</h3>
                        <p className="text-gray-500 text-sm">{expense.category}</p>
                        <p className="text-gray-400 text-xs">{formatDate(expense.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {formatIndianCurrency(expense.amount)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit expense"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id, expense.description)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No expenses found</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter || dateFilter
              ? 'Try adjusting your filters to see more results'
              : 'Start by adding your first expense!'}
          </p>
        </div>
      )}

      <NotificationToast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ViewExpenses;
