import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  AppSettings,
  PeriodTotals,
  Transaction,
  ViewPeriod,
} from './types';
import {
  loadSettings,
  loadTransactions,
  saveSettings,
  saveTransactions,
} from './utils/storage';
import { SAMPLE_TRANSACTIONS } from './data/sampleData';
import { Header } from './components/Header';
import { PeriodSelector } from './components/PeriodSelector';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { ThemeModal } from './components/ThemeModal';
import { ReportModal } from './components/ReportModal';
import { UserAuthModal } from './components/UserAuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToTransactions,
  subscribeToSettings,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  saveSettingsToFirestore,
} from './services/firestoreService';

function ExpenseTrackerApp() {
  const { user } = useAuth();

  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());

  // Period State: default to today
  const today = new Date();
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetModalMode, setBudgetModalMode] = useState<'budget' | 'settings'>('settings');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Listen to Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      // Offline / guest mode: load from localStorage
      setTransactions(loadTransactions());
      setSettings(loadSettings());
      return;
    }

    // Subscribe to authenticated user's transactions
    const unsubscribeTx = subscribeToTransactions(
      user.uid,
      (cloudTxs) => {
        setTransactions(cloudTxs);
      },
      (err) => {
        console.warn('Could not sync user transactions:', err);
      }
    );

    // Subscribe to authenticated user's settings
    const unsubscribeSettings = subscribeToSettings(
      user.uid,
      (cloudSettings) => {
        setSettings((prev) => ({ ...prev, ...cloudSettings }));
      },
      (err) => {
        console.warn('Could not sync user settings:', err);
      }
    );

    return () => {
      unsubscribeTx();
      unsubscribeSettings();
    };
  }, [user]);

  // Local storage backup effect when not signed in
  useEffect(() => {
    if (!user) {
      saveTransactions(transactions);
    }
  }, [transactions, user]);

  useEffect(() => {
    if (!user) {
      saveSettings(settings);
    }
  }, [settings, user]);

  // Update Settings handler
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user) {
      saveSettingsToFirestore(user.uid, updated).catch((err) =>
        console.error('Failed to save settings to Firestore:', err)
      );
    }
  };

  // Filter transactions according to active period (Daily / Monthly / Yearly)
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (viewPeriod === 'daily') {
        return t.date === selectedDate;
      } else if (viewPeriod === 'monthly') {
        const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        return t.date.startsWith(monthPrefix);
      } else {
        // yearly
        return t.date.startsWith(`${selectedYear}-`);
      }
    });
  }, [transactions, viewPeriod, selectedDate, selectedYear, selectedMonth]);

  // Calculate totals for active period
  const periodTotals = useMemo<PeriodTotals>(() => {
    let incomeUsd = 0;
    let incomeKhr = 0;
    let expenseUsd = 0;
    let expenseKhr = 0;

    periodTransactions.forEach((t) => {
      if (t.type === 'income') {
        if (t.currency === 'USD') incomeUsd += t.amount;
        else incomeKhr += t.amount;
      } else {
        if (t.currency === 'USD') expenseUsd += t.amount;
        else expenseKhr += t.amount;
      }
    });

    const netUsd = incomeUsd - expenseUsd;
    const netKhr = incomeKhr - expenseKhr;

    const totalIncomeNormalizedUsd = incomeUsd + incomeKhr / settings.exchangeRate;
    const totalExpenseNormalizedUsd = expenseUsd + expenseKhr / settings.exchangeRate;
    const totalNetNormalizedUsd = totalIncomeNormalizedUsd - totalExpenseNormalizedUsd;

    return {
      incomeUsd,
      incomeKhr,
      expenseUsd,
      expenseKhr,
      netUsd,
      netKhr,
      totalIncomeNormalizedUsd,
      totalExpenseNormalizedUsd,
      totalNetNormalizedUsd,
    };
  }, [periodTransactions, settings.exchangeRate]);

  // Handle transaction save (create / update)
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Find existing to preserve createdAt
      const existing = transactions.find((t) => t.id === existingId);
      const updatedTx: Transaction = {
        ...txData,
        id: existingId,
        createdAt: existing ? existing.createdAt : Date.now(),
      };

      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? updatedTx : t))
      );

      if (user) {
        saveTransactionToFirestore(user.uid, updatedTx).catch((err) =>
          console.error('Failed to update in Firestore:', err)
        );
      }
    } else {
      // Create new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      if (user) {
        saveTransactionToFirestore(user.uid, newTx).catch((err) =>
          console.error('Failed to save to Firestore:', err)
        );
      }

      // If added for a different date, switch date to match
      if (txData.date) {
        setSelectedDate(txData.date);
        const [y, m] = txData.date.split('-').map(Number);
        if (y && m) {
          setSelectedYear(y);
          setSelectedMonth(m);
        }
      }
    }
  };

  // Handle transaction delete
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      deleteTransactionFromFirestore(user.uid, id).catch((err) =>
        console.error('Failed to delete from Firestore:', err)
      );
    }
  };

  // Handle reset to sample data
  const handleResetSampleData = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
  };

  // Handle clear all
  const handleClearAllData = () => {
    setTransactions([]);
  };

  const isKm = settings.language === 'km';
  const currentTheme = settings.theme || 'emerald';

  const getAppThemeClasses = () => {
    switch (currentTheme) {
      case 'dark':
        return 'bg-[#0B0F19] text-slate-100';
      case 'warm':
        return 'bg-[#F7F4EE] text-[#2C2825]';
      case 'indigo':
        return 'bg-[#F4F6FB] text-slate-900';
      case 'emerald':
      default:
        return 'bg-slate-50 text-slate-900';
    }
  };

  return (
    <div className={`min-h-screen ${getAppThemeClasses()} flex flex-col antialiased transition-colors duration-200`}>
      {/* Top Application Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenBudgetModal={() => {
          setBudgetModalMode('budget');
          setIsBudgetModalOpen(true);
        }}
        onOpenSettingsModal={() => {
          setBudgetModalMode('settings');
          setIsBudgetModalOpen(true);
        }}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenThemeModal={() => {
          setIsThemeModalOpen(true);
        }}
        onOpenReportModal={() => {
          setIsReportModalOpen(true);
        }}
        onOpenAuthModal={() => {
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Period Selector: Daily / Monthly / Yearly */}
        <PeriodSelector
          viewPeriod={viewPeriod}
          onSelectPeriod={setViewPeriod}
          selectedDate={selectedDate}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onChangeDate={setSelectedDate}
          onChangeMonth={(y, m) => {
            setSelectedYear(y);
            setSelectedMonth(m);
          }}
          onChangeYear={setSelectedYear}
          language={settings.language}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Financial Summary Cards */}
        <SummaryCards
          totals={periodTotals}
          settings={settings}
          viewPeriod={viewPeriod}
          onOpenBudgetModal={() => {
            setBudgetModalMode('budget');
            setIsBudgetModalOpen(true);
          }}
        />

        {/* Analytics Charts & Trends */}
        <AnalyticsCharts
          transactions={periodTransactions}
          viewPeriod={viewPeriod}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          settings={settings}
        />

        {/* Transaction History & Records */}
        <TransactionList
          transactions={periodTransactions}
          onEditTransaction={(tx) => {
            setEditingTransaction(tx);
            setIsTransactionModalOpen(true);
          }}
          onDeleteTransaction={handleDeleteTransaction}
          onOpenNewTransaction={() => {
            setEditingTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          settings={settings}
        />
      </main>

      {/* Floating Action Button for Mobile Screens */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button
          id="mobile-fab-add"
          onClick={() => {
            setEditingTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xl shadow-emerald-600/40 flex items-center justify-center cursor-pointer"
          title={isKm ? 'កត់ត្រាថ្មី' : 'Add New'}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultDate={selectedDate}
        settings={settings}
      />

      {/* Budget & Settings Modal */}
      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        transactions={transactions}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        mode={budgetModalMode}
      />

      {/* UI Surface / Theme Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={settings}
        onSelectTheme={(theme) => handleUpdateSettings({ theme })}
      />

      {/* Financial Reports Modal (Daily, Monthly, Yearly + Export & Print) */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        settings={settings}
        currentPeriod={viewPeriod}
        currentDate={selectedDate}
        currentYear={selectedYear}
        currentMonth={selectedMonth}
      />

      {/* User Authentication & Cloud Sync Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        settings={settings}
        localTransactions={loadTransactions()}
        cloudTransactionsCount={user ? transactions.length : 0}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExpenseTrackerApp />
    </AuthProvider>
  );
}
