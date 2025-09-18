import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatIndianCurrency, getCategoryIcon } from '../utils/currency';
import { PlusCircle, Calculator } from 'lucide-react';
import NotificationToast from '../components/NotificationToast';

const AddExpense: React.FC = () => {
  const { state, addExpense } = useExpenses();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      addExpense({
        amount: Number(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date
      });

      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setShowToast(true);
      setCalculatorMode(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculatorButtons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', 'C', '+'
  ];

  const handleCalculatorClick = (value: string) => {
    if (value === 'C') {
      setFormData(prev => ({ ...prev, amount: '' }));
    } else if (['+', '-', '*', '/'].includes(value)) {
      setFormData(prev => ({ ...prev, amount: prev.amount + value }));
    } else {
      setFormData(prev => ({ ...prev, amount: prev.amount + value }));
    }
  };

  const evaluateExpression = () => {
    try {
      const result = eval(formData.amount);
      setFormData(prev => ({ ...prev, amount: result.toString() }));
      setCalculatorMode(false);
    } catch (error) {
      setFormData(prev => ({ ...prev, amount: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          ➕ Add New Expense
        </h1>
        <p className="text-gray-600">Record your expenses easily</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <div className="relative">
              <div className="flex">
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter amount"
                />
                <button
                  type="button"
                  onClick={() => setCalculatorMode(!calculatorMode)}
                  className="px-4 py-3 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600 transition-colors"
                >
                  <Calculator size={20} />
                </button>
              </div>
              {formData.amount && !isNaN(Number(formData.amount)) && Number(formData.amount) > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {formatIndianCurrency(Number(formData.amount))}
                </p>
              )}
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Calculator */}
          {calculatorMode && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-2">
                {calculatorButtons.map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleCalculatorClick(btn)}
                    className="p-3 bg-white rounded-lg shadow hover:bg-gray-100 font-medium"
                  >
                    {btn}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={evaluateExpression}
                className="w-full mt-2 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Calculate
              </button>
            </div>
          )}

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="What did you spend on?"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {state.categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleInputChange('category', category)}
                  className={`p-3 border-2 rounded-lg text-left transition-all hover:scale-105 ${
                    formData.category === category
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(category)}</span>
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-all"
          >
            <PlusCircle size={24} />
            <span>Add Expense</span>
          </button>
        </form>
      </div>

      <NotificationToast
        message="Expense added successfully! 🎉"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default AddExpense;