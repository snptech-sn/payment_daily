import { AppSettings, Transaction } from '../types';
import { SAMPLE_TRANSACTIONS } from '../data/sampleData';

const STORAGE_KEY_TRANSACTIONS = 'k_tracker_transactions_v1';
const STORAGE_KEY_SETTINGS = 'k_tracker_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'km',
  primaryCurrency: 'BOTH',
  exchangeRate: 4100,
  monthlyBudget: 500, // $500 monthly budget
  theme: 'emerald',
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      saveTransactions(SAMPLE_TRANSACTIONS);
      return SAMPLE_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_TRANSACTIONS;
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return SAMPLE_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: parsed.theme || 'emerald',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function exportDataAsJson(transactions: Transaction[], settings: AppSettings): void {
  const data = {
    transactions,
    settings,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `income_expense_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataAsCsv(transactions: Transaction[]): void {
  const headers = ['ID', 'Type', 'Amount', 'Currency', 'Category', 'Date', 'Time', 'Payment Method', 'Note'];
  const rows = transactions.map((t) => [
    t.id,
    t.type,
    t.amount,
    t.currency,
    t.categoryId,
    t.date,
    t.time || '',
    t.paymentMethod,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a');
  a.href = encodedUri;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}
