export type TransactionType = 'income' | 'expense';

export type Currency = 'USD' | 'KHR';

export type PaymentMethod =
  | 'khqr'
  | 'bank'
  | 'acleda'
  | 'wing'
  | 'cash'
  | 'card'
  | 'other';

export interface Category {
  id: string;
  nameKm: string;
  nameEn: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export type ViewPeriod = 'daily' | 'monthly' | 'yearly';

export type UITheme = 'emerald' | 'dark' | 'indigo' | 'warm';

export interface AppSettings {
  language: 'km' | 'en';
  primaryCurrency: 'USD' | 'KHR' | 'BOTH';
  exchangeRate: number; // KHR per 1 USD (e.g., 4100)
  monthlyBudget: number; // in USD
  theme: UITheme;
}

export interface PeriodTotals {
  incomeUsd: number;
  incomeKhr: number;
  expenseUsd: number;
  expenseKhr: number;
  netUsd: number;
  netKhr: number;
  totalIncomeNormalizedUsd: number;
  totalExpenseNormalizedUsd: number;
  totalNetNormalizedUsd: number;
}
