import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

interface ExpenseState {
  expenses: Expense[];
  categories: string[];
  loading: boolean;
}

type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Partial<Expense> } }
  | { type: 'DELETE_EXPENSE'; payload: string };

const initialState: ExpenseState = {
  expenses: [],
  categories: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Groceries',
    'Others'
  ],
  loading: false
};

const ExpenseContext = createContext<{
  state: ExpenseState;
  dispatch: React.Dispatch<ExpenseAction>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
} | null>(null);

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload.expense }
            : expense
        )
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    default:
      return state;
  }
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('indian-expenses');
    if (savedExpenses) {
      dispatch({ type: 'SET_EXPENSES', payload: JSON.parse(savedExpenses) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('indian-expenses', JSON.stringify(state.expenses));
  }, [state.expenses]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, expense } });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  return (
    <ExpenseContext.Provider value={{
      state,
      dispatch,
      addExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}