import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, PeriodTotals, ViewPeriod } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  totals: PeriodTotals;
  settings: AppSettings;
  viewPeriod: ViewPeriod;
  onOpenBudgetModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totals,
  settings,
  viewPeriod,
  onOpenBudgetModal,
}) => {
  const isKm = settings.language === 'km';
  const { exchangeRate, primaryCurrency, monthlyBudget } = settings;
  const theme = settings.theme || 'emerald';
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  // Render amount helper based on currency preference
  const renderAmount = (amountUsd: number, amountKhr: number, normalizedUsd: number) => {
    if (primaryCurrency === 'USD') {
      const convertedKhr = normalizedUsd * exchangeRate;
      return (
        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight">
            {formatCurrency(normalizedUsd, 'USD')}
          </div>
          <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ≈ {formatCurrency(convertedKhr, 'KHR')}
          </div>
        </div>
      );
    } else if (primaryCurrency === 'KHR') {
      const normalizedKhr = normalizedUsd * exchangeRate;
      return (
        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight">
            {formatCurrency(normalizedKhr, 'KHR')}
          </div>
          <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ≈ {formatCurrency(normalizedUsd, 'USD')}
          </div>
        </div>
      );
    } else {
      // BOTH
      return (
        <div className="space-y-0.5">
          <div className="text-lg sm:text-xl font-bold tracking-tight">
            {formatCurrency(amountUsd, 'USD')}
            {amountKhr > 0 && (
              <span className={`text-base font-semibold ml-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                + {formatCurrency(amountKhr, 'KHR')}
              </span>
            )}
          </div>
          <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isKm ? 'សរុបជាដុល្លារ' : 'Total in USD'}: {formatCurrency(normalizedUsd, 'USD')} (≈ {formatCurrency(normalizedUsd * exchangeRate, 'KHR')})
          </div>
        </div>
      );
    }
  };

  // Monthly budget calculation
  const budgetSpent = totals.totalExpenseNormalizedUsd;
  const budgetPercentage = monthlyBudget > 0 ? Math.min(100, Math.round((budgetSpent / monthlyBudget) * 100)) : 0;
  const isOverBudget = monthlyBudget > 0 && budgetSpent > monthlyBudget;
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - budgetSpent : 0;

  // Savings rate
  const savingsRate =
    totals.totalIncomeNormalizedUsd > 0
      ? Math.round((totals.totalNetNormalizedUsd / totals.totalIncomeNormalizedUsd) * 100)
      : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div
          id="summary-card-income"
          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden ${
            isDark
              ? 'bg-[#151E2E] border-emerald-500/30 shadow-md shadow-black/20 hover:border-emerald-400/50'
              : isWarm
              ? 'bg-[#FFFEFC] border-emerald-200 shadow-xs hover:border-emerald-400'
              : 'bg-white border-emerald-100 shadow-xs hover:shadow-md hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                isDark ? 'text-emerald-300' : isWarm ? 'text-emerald-800' : 'text-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isKm ? 'ចំណូលសរុប' : 'Total Income'}
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
            {renderAmount(
              totals.incomeUsd,
              totals.incomeKhr,
              totals.totalIncomeNormalizedUsd
            )}
          </div>
        </div>

        {/* Expense Card */}
        <div
          id="summary-card-expense"
          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden ${
            isDark
              ? 'bg-[#151E2E] border-rose-500/30 shadow-md shadow-black/20 hover:border-rose-400/50'
              : isWarm
              ? 'bg-[#FFFEFC] border-rose-200 shadow-xs hover:border-rose-400'
              : 'bg-white border-rose-100 shadow-xs hover:shadow-md hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                isDark ? 'text-rose-300' : isWarm ? 'text-rose-800' : 'text-rose-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {isKm ? 'ចំណាយសរុប' : 'Total Expense'}
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className={isDark ? 'text-rose-300' : 'text-rose-700'}>
            {renderAmount(
              totals.expenseUsd,
              totals.expenseKhr,
              totals.totalExpenseNormalizedUsd
            )}
          </div>
        </div>

        {/* Net Balance Card */}
        <div
          id="summary-card-balance"
          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden ${
            isDark
              ? 'bg-[#151E2E] border-indigo-500/30 shadow-md shadow-black/20 hover:border-indigo-400/50'
              : isWarm
              ? 'bg-[#FFFEFC] border-amber-200 shadow-xs hover:border-amber-400'
              : 'bg-white border-indigo-100 shadow-xs hover:shadow-md hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                isDark ? 'text-indigo-300' : isWarm ? 'text-amber-900' : 'text-indigo-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {isKm ? 'សមតុល្យនៅសល់' : 'Net Balance'}
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'
                  : isWarm
                  ? 'bg-amber-100/60 text-amber-800'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div
            className={
              totals.totalNetNormalizedUsd >= 0
                ? isDark
                  ? 'text-indigo-200'
                  : isWarm
                  ? 'text-amber-950 font-extrabold'
                  : 'text-indigo-900'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }
          >
            {renderAmount(
              totals.netUsd,
              totals.netKhr,
              totals.totalNetNormalizedUsd
            )}
          </div>
        </div>
      </div>

      {/* Budget & Savings Status Banner for Monthly View */}
      {viewPeriod === 'monthly' && (
        <div
          className={`rounded-2xl p-4 sm:p-5 shadow-sm border transition-colors ${
            isDark
              ? 'bg-[#0F172A] border-slate-800 text-white'
              : isWarm
              ? 'bg-[#2E2823] border-[#433B34] text-white'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {isKm ? 'ស្ថានភាពថវិកាប្រចាំខែ' : 'Monthly Budget & Savings'}
                  </h4>
                  {monthlyBudget > 0 ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isOverBudget
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isOverBudget
                        ? isKm
                          ? 'លើសថវិកា'
                          : 'Over Budget'
                        : `${budgetPercentage}% ${isKm ? 'បានប្រើ' : 'Used'}`}
                    </span>
                  ) : (
                    <button
                      onClick={onOpenBudgetModal}
                      className="text-xs text-indigo-300 hover:text-white underline cursor-pointer"
                    >
                      {isKm ? '+ កំណត់ថវិកា' : '+ Set Budget'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {monthlyBudget > 0 ? (
                    isOverBudget ? (
                      <span className="text-rose-300 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {isKm
                          ? `អ្នកបានចំណាយលើសថវិកាចំនួន $${Math.abs(remainingBudget).toFixed(2)}`
                          : `You exceeded your budget by $${Math.abs(remainingBudget).toFixed(2)}`}
                      </span>
                    ) : (
                      <span>
                        {isKm
                          ? `នៅសល់ $${remainingBudget.toFixed(2)} នៃថវិកាសរុប $${monthlyBudget}`
                          : `$${remainingBudget.toFixed(2)} remaining out of $${monthlyBudget}`}
                      </span>
                    )
                  ) : (
                    <span>
                      {isKm
                        ? `អត្រាសន្សំក្នុងខែនេះ: ${savingsRate}%`
                        : `Savings rate this month: ${savingsRate}%`}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action or Budget Indicator */}
            {monthlyBudget > 0 ? (
              <div className="sm:w-64">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <span>${budgetSpent.toFixed(0)}</span>
                  <span>${monthlyBudget.toFixed(0)}</span>
                </div>
                <div className="w-full bg-slate-700/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-rose-500' : budgetPercentage > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (budgetSpent / monthlyBudget) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenBudgetModal}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors self-start sm:self-auto cursor-pointer"
              >
                {isKm ? 'កំណត់គោលដៅថវិកា' : 'Set Budget Goal'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
