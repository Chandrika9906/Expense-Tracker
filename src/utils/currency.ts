export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}

export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Food & Dining': 'bg-orange-500',
    'Transportation': 'bg-blue-500',
    'Shopping': 'bg-pink-500',
    'Entertainment': 'bg-purple-500',
    'Bills & Utilities': 'bg-red-500',
    'Healthcare': 'bg-green-500',
    'Education': 'bg-indigo-500',
    'Travel': 'bg-teal-500',
    'Groceries': 'bg-yellow-500',
    'Others': 'bg-gray-500'
  };
  return colors[category] || 'bg-gray-500';
}

export function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    'Food & Dining': '🍽️',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills & Utilities': '⚡',
    'Healthcare': '⚕️',
    'Education': '📚',
    'Travel': '✈️',
    'Groceries': '🛒',
    'Others': '📦'
  };
  return icons[category] || '📦';
}