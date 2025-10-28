export interface Transaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  confidence?: 'high' | 'medium' | 'low';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalDebt: number;
  totalReceivables: number;
  netWorth: number;
  expensesByCategory: { name: string; value: number }[];
  monthlyData: { month: string; income: number; expenses: number }[];
}

export interface Prediction {
    month: string;
    totalPredictedExpenses: number;
    categoryPredictions: {
        category: string;
        predictedAmount: number;
    }[];
}

export interface FinancialTip {
  title: string;
  explanation: string;
}

export interface ScenarioResult {
  newMonthlySavings: number;
  impactAnalysis: string;
  recommendations: string;
}

export interface SpendingAnomaly {
  description: string;
  justification: string;
}

export interface CreditAdvice {
  summary: string;
  tips: {
    title: string;
    explanation: string;
  }[];
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string; // ISO string for easy storage
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  isPaid: boolean;
}

export interface Debt {
  id: string;
  description: string;
  amount: number;
  type: 'owed' | 'iou'; // 'owed' is owed by me, 'iou' is owed to me
  dueDate?: string; // Optional
  isSettled: boolean;
}

export interface Budget {
  category: string;
  amount: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Cash' | 'Investment' | 'Property' | 'Other';
  value: number;
}

export interface Liability {
  id: string;
  name: string;
  type: 'Loan' | 'Credit Card' | 'Mortgage' | 'Other';
  value: number;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO string
}

export interface StoredData {
  transactions: Transaction[];
  categories: string[];
  goals: Goal[];
  bills: Bill[];
  debts: Debt[];
  budgets: Budget[];
  assets: Asset[];
  liabilities: Liability[];
  reminders: Reminder[];
  creditScore: number | null;
}