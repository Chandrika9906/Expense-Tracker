import React from 'react';
import { Home, Plus, List, BarChart3 } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add', label: 'Add Expense', icon: Plus },
    { id: 'expenses', label: 'View Expenses', icon: List },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-orange-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-gray-800">Indian Expense Tracker</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;