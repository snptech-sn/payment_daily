import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  CalendarDays,
  CalendarRange,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  AppSettings,
  Category,
  Currency,
  PaymentMethod,
  Transaction,
  ViewPeriod,
} from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  formatYear,
  getPaymentMethodLabel,
  KHMER_MONTHS,
  ENGLISH_MONTHS,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: AppSettings;
  currentPeriod: ViewPeriod;
  currentDate: string;
  currentYear: number;
  currentMonth: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
  currentPeriod,
  currentDate,
  currentYear,
  currentMonth,
}) => {
  const isKm = settings.language === 'km';
  const theme = settings.theme || 'emerald';
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  // Report filter states
  const [reportType, setReportType] = useState<ViewPeriod>(currentPeriod);
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  // Filtered transactions based on selected report period
  const reportTransactions = useMemo(() => {
    return transactions.filter((t) => {
      let matchesPeriod = false;
      if (reportType === 'daily') {
        matchesPeriod = t.date === selectedDate;
      } else if (reportType === 'monthly') {
        const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        matchesPeriod = t.date.startsWith(monthPrefix);
      } else {
        // yearly
        matchesPeriod = t.date.startsWith(`${selectedYear}-`);
      }

      if (!matchesPeriod) return false;
      if (selectedTypeFilter !== 'all' && t.type !== selectedTypeFilter) return false;
      return true;
    });
  }, [transactions, reportType, selectedDate, selectedYear, selectedMonth, selectedTypeFilter]);

  // Calculations for report
  const totals = useMemo(() => {
    let incomeUsd = 0;
    let incomeKhr = 0;
    let expenseUsd = 0;
    let expenseKhr = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    reportTransactions.forEach((t) => {
      if (t.type === 'income') {
        incomeCount++;
        if (t.currency === 'USD') incomeUsd += t.amount;
        else incomeKhr += t.amount;
      } else {
        expenseCount++;
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
      incomeCount,
      expenseCount,
      totalCount: reportTransactions.length,
      netUsd,
      netKhr,
      totalIncomeNormalizedUsd,
      totalExpenseNormalizedUsd,
      totalNetNormalizedUsd,
    };
  }, [reportTransactions, settings.exchangeRate]);

  // Breakdown by Category
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, {
      category: Category;
      count: number;
      totalUsd: number;
      totalKhr: number;
      totalNormalizedUsd: number;
    }>();

    reportTransactions.forEach((t) => {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === t.categoryId) || {
        id: t.categoryId,
        nameKm: 'ផ្សេងៗ',
        nameEn: 'Other',
        type: t.type,
        icon: 'HelpCircle',
        color: '#64748b',
        bgColor: '#f1f5f9',
      };

      const existing = map.get(t.categoryId) || {
        category: cat,
        count: 0,
        totalUsd: 0,
        totalKhr: 0,
        totalNormalizedUsd: 0,
      };

      existing.count += 1;
      if (t.currency === 'USD') {
        existing.totalUsd += t.amount;
        existing.totalNormalizedUsd += t.amount;
      } else {
        existing.totalKhr += t.amount;
        existing.totalNormalizedUsd += t.amount / settings.exchangeRate;
      }

      map.set(t.categoryId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalNormalizedUsd - a.totalNormalizedUsd);
  }, [reportTransactions, settings.exchangeRate]);

  // Breakdown by Payment Method
  const paymentMethodBreakdown = useMemo(() => {
    const map = new Map<PaymentMethod, { count: number; totalNormalizedUsd: number }>();

    reportTransactions.forEach((t) => {
      const existing = map.get(t.paymentMethod) || { count: 0, totalNormalizedUsd: 0 };
      existing.count += 1;
      const normalizedAmount = t.currency === 'USD' ? t.amount : t.amount / settings.exchangeRate;
      existing.totalNormalizedUsd += normalizedAmount;
      map.set(t.paymentMethod, existing);
    });

    return Array.from(map.entries()).map(([method, data]) => ({
      method,
      label: getPaymentMethodLabel(method, settings.language),
      count: data.count,
      totalNormalizedUsd: data.totalNormalizedUsd,
    })).sort((a, b) => b.totalNormalizedUsd - a.totalNormalizedUsd);
  }, [reportTransactions, settings.exchangeRate, settings.language]);

  // Monthly breakdown for Yearly report
  const yearlyMonthlyBreakdown = useMemo(() => {
    if (reportType !== 'yearly') return [];

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const prefix = `${selectedYear}-${String(monthNum).padStart(2, '0')}`;
      let incUsd = 0;
      let expUsd = 0;
      let count = 0;

      transactions.forEach((t) => {
        if (t.date.startsWith(prefix)) {
          count++;
          const val = t.currency === 'USD' ? t.amount : t.amount / settings.exchangeRate;
          if (t.type === 'income') incUsd += val;
          else expUsd += val;
        }
      });

      return {
        month: monthNum,
        nameKm: KHMER_MONTHS[i],
        nameEn: ENGLISH_MONTHS[i],
        incomeUsd: incUsd,
        expenseUsd: expUsd,
        netUsd: incUsd - expUsd,
        count,
      };
    });

    return months;
  }, [reportType, transactions, selectedYear, settings.exchangeRate]);

  // Title string based on current report type
  const reportPeriodLabel = useMemo(() => {
    if (reportType === 'daily') {
      return formatDate(selectedDate, settings.language);
    } else if (reportType === 'monthly') {
      return formatMonthYear(selectedYear, selectedMonth, settings.language);
    } else {
      return formatYear(selectedYear, settings.language);
    }
  }, [reportType, selectedDate, selectedYear, selectedMonth, settings.language]);

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Export CSV function
  const handleDownloadCsv = () => {
    const BOM = '\uFEFF';
    const reportTitle = isKm
      ? `របាយការណ៍ហិរញ្ញវត្ថុ_${reportType === 'daily' ? 'ប្រចាំថ្ងៃ' : reportType === 'monthly' ? 'ប្រចាំខែ' : 'ប្រចាំឆ្នាំ'}_${reportPeriodLabel.replace(/[\s,/]/g, '_')}`
      : `Financial_Report_${reportType}_${reportPeriodLabel.replace(/[\s,/]/g, '_')}`;

    const headers = [
      isKm ? 'ល.រ' : 'No',
      isKm ? 'កាលបរិច្ឆេទ' : 'Date',
      isKm ? 'ម៉ោង' : 'Time',
      isKm ? 'ប្រភេទ' : 'Type',
      isKm ? 'ជំពូក/ប្រភេទ' : 'Category',
      isKm ? 'វិធីទូទាត់' : 'Payment Method',
      isKm ? 'កំណត់ចំណាំ' : 'Note',
      isKm ? 'ចំនួនទឹកប្រាក់' : 'Amount',
      isKm ? 'រូបិយប័ណ្ណ' : 'Currency',
      isKm ? 'សមមូលដុល្លារ ($)' : 'Equivalent (USD)',
    ];

    const rows = reportTransactions.map((t, idx) => {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === t.categoryId);
      const catName = cat ? (isKm ? cat.nameKm : cat.nameEn) : t.categoryId;
      const typeLabel = t.type === 'income' ? (isKm ? 'ចំណូល' : 'Income') : (isKm ? 'ចំណាយ' : 'Expense');
      const pmLabel = getPaymentMethodLabel(t.paymentMethod, settings.language);
      const eqUsd = t.currency === 'USD' ? t.amount : t.amount / settings.exchangeRate;

      return [
        idx + 1,
        t.date,
        t.time || '',
        typeLabel,
        `"${catName.replace(/"/g, '""')}"`,
        `"${pmLabel.replace(/"/g, '""')}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        t.amount,
        t.currency,
        eqUsd.toFixed(2),
      ];
    });

    // Summary block in CSV
    const summaryRows = [
      [''],
      [isKm ? '=== សង្ខេបរបាយការណ៍ ===' : '=== REPORT SUMMARY ==='],
      [isKm ? 'រយៈពេលរបាយការណ៍' : 'Report Period', `"${reportPeriodLabel}"`],
      [isKm ? 'ចំនួនប្រតិបត្តិការសរុប' : 'Total Transactions', totals.totalCount],
      [isKm ? 'ចំណូលសរុប (USD)' : 'Total Income (USD)', totals.incomeUsd.toFixed(2)],
      [isKm ? 'ចំណូលសរុប (KHR)' : 'Total Income (KHR)', totals.incomeKhr.toLocaleString()],
      [isKm ? 'ចំណាយសរុប (USD)' : 'Total Expense (USD)', totals.expenseUsd.toFixed(2)],
      [isKm ? 'ចំណាយសរុប (KHR)' : 'Total Expense (KHR)', totals.expenseKhr.toLocaleString()],
      [isKm ? 'សមតុល្យសល់សរុប ($)' : 'Net Balance (USD)', totals.totalNetNormalizedUsd.toFixed(2)],
      [isKm ? 'អត្រាប្តូរប្រាក់ ($1)' : 'Exchange Rate ($1)', `${settings.exchangeRate} KHR`],
      [''],
      [isKm ? '=== បញ្ជីប្រតិបត្តិការលម្អិត ===' : '=== TRANSACTION LEDGER ==='],
    ];

    const csvContent =
      BOM +
      summaryRows.map((r) => r.join(',')).join('\n') +
      '\n' +
      headers.join(',') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      id="printable-report-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div
        id="printable-report"
        className={`w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-4 border flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-[#131B2B] border-slate-700/80 text-slate-100'
            : isWarm
            ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Top Header (Hidden on print) */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between no-print shrink-0 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-950 dark:text-white">
                {isKm ? 'របាយការណ៍ហិរញ្ញវត្ថុ' : 'Financial Reports'}
              </h3>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                {isKm
                  ? 'ពិនិត្យមើល ទាញយកជា Excel និងបោះពុម្ពរបាយការណ៍'
                  : 'View, export to Excel/CSV, and print formal reports'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Export CSV Button */}
            <button
              id="report-download-csv-btn"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-950 dark:text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title={isKm ? 'ទាញយកជា Excel / CSV' : 'Download CSV'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">{isKm ? 'ទាញយក CSV' : 'Export CSV'}</span>
            </button>

            {/* Quick Print Button */}
            <button
              id="report-print-btn"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              title={isKm ? 'បោះពុម្ពរបាយការណ៍' : 'Print Report'}
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>{isKm ? 'បោះពុម្ព' : 'Print'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              title={isKm ? 'បិទ' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Period Selector Controls (Hidden on print) */}
        <div
          className={`px-5 py-3 border-b no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-[#101726]' : isWarm ? 'border-[#EAE3D6] bg-[#FAF7F2]' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          {/* Period Type Switcher (Daily / Monthly / Yearly) */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/90 text-xs font-bold shrink-0">
            <button
              id="report-period-daily-btn"
              type="button"
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{isKm ? 'ប្រចាំថ្ងៃ' : 'Daily'}</span>
            </button>
            <button
              id="report-period-monthly-btn"
              type="button"
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isKm ? 'ប្រចាំខែ' : 'Monthly'}</span>
            </button>
            <button
              id="report-period-yearly-btn"
              type="button"
              onClick={() => setReportType('yearly')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                reportType === 'yearly'
                  ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>{isKm ? 'ប្រចាំឆ្នាំ' : 'Yearly'}</span>
            </button>
          </div>

          {/* Date Picker Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {reportType === 'daily' && (
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  {isKm ? 'ជ្រើសថ្ងៃ:' : 'Date:'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-white border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            )}

            {reportType === 'monthly' && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-white border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {KHMER_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {isKm ? m : ENGLISH_MONTHS[idx]}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-white border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {isKm ? `ឆ្នាំ ${y}` : y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'yearly' && (
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  {isKm ? 'ជ្រើសឆ្នាំ:' : 'Year:'}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-white border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {isKm ? `ឆ្នាំ ${y}` : y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type filter (All / Income / Expense) */}
            <div className="flex items-center gap-1 ml-auto">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                    : isWarm
                    ? 'bg-white border-[#DDD6C8] text-[#2C2825]'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">{isKm ? 'គ្រប់ប្រភេទ (ចំណូល & ចំណាយ)' : 'All Types'}</option>
                <option value="expense">{isKm ? 'តែចំណាយប៉ុណ្ណោះ' : 'Expenses Only'}</option>
                <option value="income">{isKm ? 'តែចំណូលប៉ុណ្ណោះ' : 'Income Only'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Main Printable Report Document */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 flex-1 text-slate-900 dark:text-slate-100 print:text-black print:p-0 print:space-y-4">
          {/* Printable Report Header */}
          <div className="border-b pb-5 border-slate-200 dark:border-slate-800 print:border-black print:pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400 print:text-black">
                  {isKm ? 'កម្មវិធីគ្រប់គ្រងចំណូលចំណាយ' : 'Personal & Business Cashflow'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 print:border print:border-black print:bg-white font-bold">
                  {reportType === 'daily'
                    ? isKm ? 'របាយការណ៍ប្រចាំថ្ងៃ' : 'Daily Report'
                    : reportType === 'monthly'
                    ? isKm ? 'របាយការណ៍ប្រចាំខែ' : 'Monthly Report'
                    : isKm ? 'របាយការណ៍ប្រចាំឆ្នាំ' : 'Yearly Report'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                {reportType === 'daily' && (isKm ? `របាយការណ៍ហិរញ្ញវត្ថុប្រចាំថ្ងៃ (${reportPeriodLabel})` : `Daily Financial Report (${reportPeriodLabel})`)}
                {reportType === 'monthly' && (isKm ? `របាយការណ៍ហិរញ្ញវត្ថុប្រចាំខែ (${reportPeriodLabel})` : `Monthly Financial Report (${reportPeriodLabel})`)}
                {reportType === 'yearly' && (isKm ? `របាយការណ៍ហិរញ្ញវត្ថុប្រចាំឆ្នាំ (${reportPeriodLabel})` : `Annual Financial Report (${reportPeriodLabel})`)}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-0.5">
                {isKm
                  ? `ចេញនៅកាលបរិច្ឆេទ: ${new Date().toLocaleString('km-KH', { dateStyle: 'long', timeStyle: 'short' })}`
                  : `Issued on: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 print:text-slate-700 shrink-0">
              <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                {isKm ? 'អត្រាប្តូរប្រាក់យោង:' : 'Reference Exchange Rate:'} $1 = {settings.exchangeRate.toLocaleString()} ៛
              </div>
              <div>
                {isKm ? 'ចំនួនប្រតិបត្តិការសរុប:' : 'Total Transactions:'}{' '}
                <span className="font-bold text-slate-900 dark:text-white print:text-black">{totals.totalCount}</span>
              </div>
              {settings.monthlyBudget > 0 && reportType === 'monthly' && (
                <div>
                  {isKm ? 'គោលដៅថវិកាប្រចាំខែ:' : 'Monthly Target Budget:'}{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 print:text-black">${settings.monthlyBudget}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
            {/* Total Income */}
            <div
              className={`p-4 rounded-2xl border print:border-black print:p-3.5 shadow-2xs ${
                isDark
                  ? 'bg-emerald-950/30 border-emerald-900/70'
                  : 'bg-emerald-50/80 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-sm font-bold text-emerald-800 dark:text-emerald-300 print:text-black mb-1.5">
                <span>{isKm ? 'ចំណូលសរុប (Total Income)' : 'Total Income'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  {totals.incomeCount} {isKm ? 'ប្រតិបត្តិការ' : 'tx'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 print:text-black tracking-tight">
                {formatCurrency(totals.incomeUsd, 'USD')}
              </div>
              {totals.incomeKhr > 0 && (
                <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 print:text-black mt-1">
                  + {formatCurrency(totals.incomeKhr, 'KHR')}
                </div>
              )}
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 print:text-slate-700 mt-1.5">
                ≈ ${totals.totalIncomeNormalizedUsd.toFixed(2)} USD
              </div>
            </div>

            {/* Total Expenses */}
            <div
              className={`p-4 rounded-2xl border print:border-black print:p-3.5 shadow-2xs ${
                isDark
                  ? 'bg-rose-950/30 border-rose-900/70'
                  : 'bg-rose-50/80 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-sm font-bold text-rose-800 dark:text-rose-300 print:text-black mb-1.5">
                <span>{isKm ? 'ចំណាយសរុប (Total Expense)' : 'Total Expenses'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  {totals.expenseCount} {isKm ? 'ប្រតិបត្តិការ' : 'tx'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 print:text-black tracking-tight">
                {formatCurrency(totals.expenseUsd, 'USD')}
              </div>
              {totals.expenseKhr > 0 && (
                <div className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 print:text-black mt-1">
                  + {formatCurrency(totals.expenseKhr, 'KHR')}
                </div>
              )}
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 print:text-slate-700 mt-1.5">
                ≈ ${totals.totalExpenseNormalizedUsd.toFixed(2)} USD
              </div>
            </div>

            {/* Net Balance / Cashflow */}
            <div
              className={`p-4 rounded-2xl border print:border-black print:p-3.5 shadow-2xs ${
                totals.totalNetNormalizedUsd >= 0
                  ? isDark
                    ? 'bg-blue-950/30 border-blue-900/70'
                    : 'bg-blue-50/80 border-blue-200'
                  : isDark
                  ? 'bg-amber-950/30 border-amber-900/70'
                  : 'bg-amber-50/80 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200 print:text-black mb-1.5">
                <span>{isKm ? 'សមតុល្យសល់ (Net Balance)' : 'Net Cashflow'}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    totals.totalNetNormalizedUsd >= 0
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  {totals.totalNetNormalizedUsd >= 0
                    ? isKm ? 'ចំណេញ' : 'Surplus'
                    : isKm ? 'ខាត/លើស' : 'Deficit'}
                </span>
              </div>
              <div
                className={`text-xl sm:text-2xl font-black print:text-black tracking-tight ${
                  totals.totalNetNormalizedUsd >= 0
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {totals.netUsd >= 0 ? '+' : ''}
                {formatCurrency(totals.netUsd, 'USD')}
              </div>
              {totals.netKhr !== 0 && (
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 print:text-black mt-1">
                  {totals.netKhr >= 0 ? '+' : ''}
                  {formatCurrency(totals.netKhr, 'KHR')}
                </div>
              )}
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 print:text-slate-700 mt-1.5">
                ≈ ${totals.totalNetNormalizedUsd.toFixed(2)} USD
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table (for Yearly report only) */}
          {reportType === 'yearly' && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden print:border-black shadow-2xs">
              <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 print:bg-slate-200 font-bold text-sm sm:text-base flex items-center justify-between text-slate-900 dark:text-white">
                <span>{isKm ? 'តារាងប្រៀបធៀបចំណូល-ចំណាយ តាមខែនីមួយៗ (១២ ខែ)' : '12-Month Cashflow Breakdown'}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 print:text-black">
                  {isKm ? `ឆ្នាំ ${selectedYear}` : `Year ${selectedYear}`}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left leading-relaxed">
                  <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700 print:bg-white print:border-black font-bold text-slate-800 dark:text-slate-200 print:text-black">
                    <tr>
                      <th className="py-3 px-4">{isKm ? 'ខែ' : 'Month'}</th>
                      <th className="py-3 px-4 text-right">{isKm ? 'ចំណូល ($)' : 'Income ($)'}</th>
                      <th className="py-3 px-4 text-right">{isKm ? 'ចំណាយ ($)' : 'Expense ($)'}</th>
                      <th className="py-3 px-4 text-right">{isKm ? 'សមតុល្យ ($)' : 'Net ($)'}</th>
                      <th className="py-3 px-4 text-center">{isKm ? 'ចំនួនប្រតិបត្តិការ' : 'Transactions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-750 print:divide-slate-300">
                    {yearlyMonthlyBreakdown.map((m) => (
                      <tr key={m.month}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {isKm ? m.nameKm : m.nameEn}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-300 font-bold">
                          ${m.incomeUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-700 dark:text-rose-300 font-bold">
                          ${m.expenseUsd.toFixed(2)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-black ${
                            m.netUsd >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {m.netUsd >= 0 ? '+' : ''}${m.netUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                          {m.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Category Breakdown Section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden print:border-black shadow-2xs">
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 print:bg-slate-200 font-bold text-sm sm:text-base flex items-center justify-between text-slate-900 dark:text-white">
              <span>{isKm ? 'តារាងបែងចែកចំណូល & ចំណាយ តាមប្រភេទ' : 'Category Distribution & Summary'}</span>
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 print:text-black">
                {categoryBreakdown.length} {isKm ? 'ប្រភេទ' : 'categories'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left leading-relaxed">
                <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700 print:bg-white print:border-black font-bold text-slate-800 dark:text-slate-200 print:text-black">
                  <tr>
                    <th className="py-3 px-4">{isKm ? 'ប្រភេទ' : 'Category'}</th>
                    <th className="py-3 px-4">{isKm ? 'ប្រភេទប្រតិបត្តិការ' : 'Type'}</th>
                    <th className="py-3 px-4 text-center">{isKm ? 'ចំនួនលើក' : 'Count'}</th>
                    <th className="py-3 px-4 text-right">{isKm ? 'ប្រាក់ដុល្លារ ($)' : 'USD ($)'}</th>
                    <th className="py-3 px-4 text-right">{isKm ? 'ប្រាក់រៀល (៛)' : 'KHR (៛)'}</th>
                    <th className="py-3 px-4 text-right">{isKm ? 'សរុបសមមូល ($)' : 'Total (USD)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-750 print:divide-slate-300">
                  {categoryBreakdown.map((item) => (
                    <tr key={item.category.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs print:border"
                            style={{ backgroundColor: item.category.bgColor, color: item.category.color }}
                          >
                            <CategoryIcon iconName={item.category.icon} size={16} />
                          </div>
                          <span className="font-bold text-slate-950 dark:text-white text-sm">
                            {isKm ? item.category.nameKm : item.category.nameEn}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                            item.category.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 print:border'
                              : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 print:border'
                          }`}
                        >
                          {item.category.type === 'income' ? (isKm ? 'ចំណូល' : 'Income') : (isKm ? 'ចំណាយ' : 'Expense')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {item.count}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        {item.totalUsd > 0 ? `$${item.totalUsd.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        {item.totalKhr > 0 ? `${item.totalKhr.toLocaleString()} ៛` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-950 dark:text-white print:text-black">
                        ${item.totalNormalizedUsd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method Breakdown Summary */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden print:border-black shadow-2xs">
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 print:bg-slate-200 font-bold text-sm sm:text-base flex items-center justify-between text-slate-950 dark:text-white">
              <span>{isKm ? 'តារាងបែងចែកតាមវិធីទូទាត់ (KHQR, អេស៊ីលីដា, វីង, ABA, សាច់ប្រាក់)' : 'Payment Methods Breakdown'}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 print:text-black">
                {paymentMethodBreakdown.length} {isKm ? 'មធ្យោបាយ' : 'methods'}
              </span>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 print:grid-cols-3">
              {paymentMethodBreakdown.map((pm) => (
                <div
                  key={pm.method}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 print:border-black bg-slate-50/80 dark:bg-slate-800/60 print:bg-white"
                >
                  <div className="text-xs font-black truncate text-slate-950 dark:text-white print:text-black">
                    {pm.label}
                  </div>
                  <div className="text-base font-black text-slate-950 dark:text-white print:text-black mt-1">
                    ${pm.totalNormalizedUsd.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-700 mt-0.5 font-bold">
                    {pm.count} {isKm ? 'ប្រតិបត្តិការ' : 'transactions'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Transaction Ledger Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden print:border-black shadow-2xs">
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800/90 print:bg-slate-200 font-bold text-sm sm:text-base flex items-center justify-between text-slate-950 dark:text-white">
              <span>{isKm ? 'បញ្ជីប្រតិបត្តិការលម្អិត (Detailed Transactions Ledger)' : 'Transactions Ledger'}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 print:text-black">
                {reportTransactions.length} {isKm ? 'កំណត់ត្រា' : 'records'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left leading-relaxed">
                <thead className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 print:bg-white print:border-black font-black text-slate-950 dark:text-white print:text-black">
                  <tr>
                    <th className="py-3 px-4 text-center">{isKm ? 'ល.រ' : '#'}</th>
                    <th className="py-3 px-4">{isKm ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                    <th className="py-3 px-4">{isKm ? 'ប្រភេទ' : 'Category'}</th>
                    <th className="py-3 px-4">{isKm ? 'វិធីទូទាត់' : 'Payment Method'}</th>
                    <th className="py-3 px-4">{isKm ? 'កំណត់ចំណាំ' : 'Note'}</th>
                    <th className="py-3 px-4 text-right">{isKm ? 'ចំនួនទឹកប្រាក់' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-750 print:divide-slate-300">
                  {reportTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                        {isKm ? 'គ្មានទិន្នន័យប្រតិបត្តិការសម្រាប់កាលបរិច្ឆេទនេះទេ' : 'No transactions found for this period.'}
                      </td>
                    </tr>
                  ) : (
                    reportTransactions.map((tx, idx) => {
                      const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId);
                      const catName = cat ? (isKm ? cat.nameKm : cat.nameEn) : tx.categoryId;
                      return (
                        <tr key={tx.id}>
                          <td className="py-3 px-4 text-center text-slate-800 dark:text-slate-200 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-950 dark:text-white">{tx.date}</div>
                            {tx.time && <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{tx.time}</div>}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">
                            {catName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 print:border-black">
                              {getPaymentMethodLabel(tx.paymentMethod, settings.language)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold print:text-black max-w-xs truncate">
                            {tx.note || '-'}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-black whitespace-nowrap text-sm ${
                              tx.type === 'income' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(tx.amount, tx.currency)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer / Signature lines for printing */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 print:border-black grid grid-cols-2 gap-8 text-center text-sm print:pt-4">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black mb-12">
                {isKm ? 'រៀបចំដោយ (Prepared By)' : 'Prepared By'}
              </p>
              <div className="w-40 mx-auto border-t border-slate-300 dark:border-slate-700 print:border-black pt-1.5 text-xs text-slate-500 dark:text-slate-400 print:text-black font-medium">
                {isKm ? 'ហត្ថលេខា & ឈ្មោះ' : 'Signature & Name'}
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black mb-12">
                {isKm ? 'អនុម័តដោយ (Approved By)' : 'Approved By'}
              </p>
              <div className="w-40 mx-auto border-t border-slate-300 dark:border-slate-700 print:border-black pt-1.5 text-xs text-slate-500 dark:text-slate-400 print:text-black font-medium">
                {isKm ? 'ហត្ថលេខា & កាលបរិច្ឆេទ' : 'Signature & Date'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls (Hidden on print) */}
        <div
          className={`px-5 py-3 border-t no-print flex items-center justify-between shrink-0 ${
            isDark
              ? 'border-slate-700/80 bg-[#0E1524]'
              : isWarm
              ? 'border-[#E7E1D4] bg-[#F7F3EB]'
              : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="text-xs text-slate-500">
            {isKm ? 'គាំទ្រការទាញយក Excel / CSV & បោះពុម្ពជាក្រដាស A4 ឬរក្សាទុកជា PDF' : 'Supports Excel/CSV download & Print to A4 or Save as PDF'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isKm ? 'បិទ' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-4 py-2 rounded-xl border border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isKm ? 'ទាញយក CSV' : 'Export CSV'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isKm ? 'បោះពុម្ពរបាយការណ៍' : 'Print Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
