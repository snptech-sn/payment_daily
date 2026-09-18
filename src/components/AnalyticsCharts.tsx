import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AppSettings, Category, Transaction, ViewPeriod } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import {
  convertCurrency,
  formatCurrency,
  KHMER_MONTHS,
  ENGLISH_MONTHS,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  viewPeriod: ViewPeriod;
  selectedYear: number;
  selectedMonth: number;
  selectedDate: string;
  settings: AppSettings;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  viewPeriod,
  selectedYear,
  selectedMonth,
  selectedDate,
  settings,
}) => {
  const isKm = settings.language === 'km';
  const { exchangeRate } = settings;
  const theme = settings.theme || 'emerald';
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cardBase = isDark
    ? 'bg-[#151E2E] border-slate-800 text-slate-100 shadow-md shadow-black/20'
    : isWarm
    ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825] shadow-xs'
    : 'bg-white border-slate-200/80 text-slate-900 shadow-xs';

  const subCard = isDark
    ? 'bg-[#0D1424] border-slate-800 text-slate-200'
    : isWarm
    ? 'bg-[#F7F4EE] border-[#E7E1D4] text-[#2C2825]'
    : 'bg-slate-50 border-slate-100 text-slate-700';

  const headingText = isDark ? 'text-slate-100' : isWarm ? 'text-[#2C2825]' : 'text-slate-800';
  const mutedText = isDark ? 'text-slate-400' : isWarm ? 'text-[#7A7267]' : 'text-slate-500';

  // Normalize transaction amount to USD for consistent chart calculation
  const toUsd = (t: Transaction) => convertCurrency(t.amount, t.currency, 'USD', exchangeRate);

  // Filter transactions
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const incomeTx = transactions.filter((t) => t.type === 'income');

  // Compute category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  expenseTx.forEach((t) => {
    const usd = toUsd(t);
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + usd;
  });

  const totalExpenseUsd = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Sorted categories
  const sortedCategories = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId) || {
        id: catId,
        nameKm: 'ផ្សេងៗ',
        nameEn: 'Other',
        color: '#64748b',
        bgColor: '#f1f5f9',
        icon: 'MoreHorizontal',
        type: 'expense',
      };
      const percent = totalExpenseUsd > 0 ? Math.round((amount / totalExpenseUsd) * 100) : 0;
      return { cat, amount, percent };
    })
    .sort((a, b) => b.amount - a.amount);

  // -------------------------------------------------------------
  // DAILY VIEW: Category breakdown bar & payment method stats
  // -------------------------------------------------------------
  if (viewPeriod === 'daily') {
    if (transactions.length === 0) {
      return null;
    }

    return (
      <div className={`rounded-2xl border p-4 sm:p-5 mb-6 transition-colors ${cardBase}`}>
        <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${headingText}`}>
          <PieIcon className="w-4 h-4 text-emerald-500" />
          <span>{isKm ? 'ការបែងចែកការចំណាយថ្ងៃនេះ' : "Today's Expense Breakdown"}</span>
        </h3>

        {sortedCategories.length > 0 ? (
          <div className="space-y-3">
            {/* Multi-segment progress bar */}
            <div className={`w-full h-3.5 rounded-full overflow-hidden flex ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {sortedCategories.map((item, idx) => (
                <div
                  key={item.cat.id}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.cat.color,
                  }}
                  className="h-full transition-all duration-300"
                  title={`${isKm ? item.cat.nameKm : item.cat.nameEn}: ${item.percent}%`}
                />
              ))}
            </div>

            {/* Category chips grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {sortedCategories.map((item) => (
                <div
                  key={item.cat.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${subCard}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.cat.bgColor, color: item.cat.color }}
                    >
                      <CategoryIcon iconName={item.cat.icon} size={15} />
                    </div>
                    <span className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {isKm ? item.cat.nameKm : item.cat.nameEn}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold block ${headingText}`}>
                      ${item.amount.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-medium ${mutedText}`}>
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className={`text-xs italic ${mutedText}`}>
            {isKm ? 'មិនមានការចំណាយសម្រាប់ថ្ងៃនេះទេ' : 'No expenses recorded for this day'}
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // MONTHLY VIEW: Daily spending timeline + Donut category chart
  // -------------------------------------------------------------
  if (viewPeriod === 'monthly') {
    // Group expenses by day of month (1..31)
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyExpenses: { day: number; amount: number; count: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTx = expenseTx.filter((t) => t.date === dayStr);
      const dayAmount = dayTx.reduce((sum, t) => sum + toUsd(t), 0);
      dailyExpenses.push({ day, amount: dayAmount, count: dayTx.length });
    }

    const maxDayExpense = Math.max(...dailyExpenses.map((d) => d.amount), 1);

    // SVG donut chart calculation
    let accumulatedAngle = 0;
    const donutSegments = sortedCategories.map((item) => {
      const angle = (item.amount / totalExpenseUsd) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      return { ...item, startAngle, angle };
    });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Daily Spending Trend (Bar Chart) */}
        <div className={`lg:col-span-7 rounded-2xl border p-4 sm:p-5 transition-colors ${cardBase}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${headingText}`}>
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>{isKm ? 'ចរន្តចំណាយប្រចាំថ្ងៃក្នុងខែ' : 'Daily Spending Trend in Month'}</span>
            </h3>
            <span className={`text-xs font-medium ${mutedText}`}>
              {isKm ? `សរុប ${daysInMonth} ថ្ងៃ` : `${daysInMonth} days`}
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className={`h-44 sm:h-48 w-full flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 border-b relative ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {dailyExpenses.map((d, index) => {
              const heightPercent = (d.amount / maxDayExpense) * 100;
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={d.day}
                  className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && d.amount > 0 && (
                    <div className="absolute -top-10 z-20 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-md whitespace-nowrap shadow-md pointer-events-none">
                      {isKm ? `ថ្ងៃទី ${d.day}: ` : `Day ${d.day}: `}
                      <span className="font-bold text-rose-300">${d.amount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${Math.max(d.amount > 0 ? 8 : 2, heightPercent)}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      d.amount > 0
                        ? isHovered
                          ? 'bg-rose-600'
                          : 'bg-rose-400/80 hover:bg-rose-500'
                        : isDark
                        ? 'bg-slate-800'
                        : 'bg-slate-100'
                    }`}
                  />
                  {/* Day label on bottom */}
                  {(d.day === 1 || d.day % 5 === 0 || d.day === daysInMonth) && (
                    <span className="text-[10px] text-slate-400 font-medium mt-1 select-none">
                      {d.day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`flex items-center justify-between text-xs mt-2 ${mutedText}`}>
            <span>
              {isKm ? 'មធ្យមភាគប្រចាំថ្ងៃ:' : 'Daily Average:'}{' '}
              <strong className={headingText}>
                ${(totalExpenseUsd / (daysInMonth || 1)).toFixed(2)}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-400"></span>
              <span>{isKm ? 'ចំណាយ' : 'Expense'}</span>
            </span>
          </div>
        </div>

        {/* Category Breakdown (Donut + Ranked list) */}
        <div className={`lg:col-span-5 rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-colors ${cardBase}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${headingText}`}>
              <PieIcon className="w-4 h-4 text-emerald-500" />
              <span>{isKm ? 'ចំណាយតាមប្រភេទ' : 'Expenses by Category'}</span>
            </h3>
            <span className={`text-xs font-bold ${headingText}`}>
              ${totalExpenseUsd.toFixed(2)}
            </span>
          </div>

          {sortedCategories.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {sortedCategories.map((item) => (
                <div key={item.cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.cat.bgColor, color: item.cat.color }}
                      >
                        <CategoryIcon iconName={item.cat.icon} size={13} />
                      </div>
                      <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {isKm ? item.cat.nameKm : item.cat.nameEn}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-bold ${headingText}`}>${item.amount.toFixed(2)}</span>
                      <span className={`ml-1.5 font-medium ${mutedText}`}>({item.percent}%)</span>
                    </div>
                  </div>
                  {/* Mini category bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`py-8 text-center text-xs ${mutedText}`}>
              {isKm ? 'មិនទាន់មានទិន្នន័យចំណាយក្នុងខែនេះទេ' : 'No expense data for this month yet'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // YEARLY VIEW: 12-Month Bar Chart (Income vs Expense) & Table
  // -------------------------------------------------------------
  if (viewPeriod === 'yearly') {
    // Compute 12-month data
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      const monthPrefix = `${selectedYear}-${String(monthNumber).padStart(2, '0')}`;
      const mIncome = incomeTx
        .filter((t) => t.date.startsWith(monthPrefix))
        .reduce((sum, t) => sum + toUsd(t), 0);
      const mExpense = expenseTx
        .filter((t) => t.date.startsWith(monthPrefix))
        .reduce((sum, t) => sum + toUsd(t), 0);
      const net = mIncome - mExpense;
      return {
        month: monthNumber,
        nameKm: KHMER_MONTHS[i],
        nameEn: ENGLISH_MONTHS[i],
        income: mIncome,
        expense: mExpense,
        net,
      };
    });

    const maxMonthValue = Math.max(
      ...monthlyStats.map((m) => Math.max(m.income, m.expense)),
      1
    );

    const totalYearIncome = monthlyStats.reduce((s, m) => s + m.income, 0);
    const totalYearExpense = monthlyStats.reduce((s, m) => s + m.expense, 0);
    const totalYearNet = totalYearIncome - totalYearExpense;

    return (
      <div className="space-y-6 mb-6">
        {/* 12-Month Comparison Bar Chart */}
        <div className={`rounded-2xl border p-4 sm:p-5 transition-colors ${cardBase}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${headingText}`}>
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>
                  {isKm
                    ? `ការប្រៀបធៀបចំណូល និងចំណាយ ១២ ខែ (${selectedYear})`
                    : `12-Month Income vs Expense Comparison (${selectedYear})`}
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${mutedText}`}>
                {isKm
                  ? 'ប្រៀបធៀបចំណូល និងចំណាយតាមខែនីមួយៗពេញមួយឆ្នាំ'
                  : 'Track your annual cashflow trajectory across all 12 months'}
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                {isKm ? 'ចំណូល' : 'Income'}
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
                {isKm ? 'ចំណាយ' : 'Expense'}
              </span>
            </div>
          </div>

          {/* SVG/Bar Chart */}
          <div className={`h-56 sm:h-64 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {monthlyStats.map((m) => {
              const incomeHeight = (m.income / maxMonthValue) * 100;
              const expenseHeight = (m.expense / maxMonthValue) * 100;

              return (
                <div
                  key={m.month}
                  className="flex-1 h-full flex flex-col justify-end items-center group relative"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 px-2 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                    <p className="font-bold border-b border-slate-700 pb-0.5 mb-0.5">
                      {isKm ? `ខែ${m.nameKm}` : m.nameEn}
                    </p>
                    <p className="text-emerald-300">
                      +{formatCurrency(m.income, 'USD')}
                    </p>
                    <p className="text-rose-300">
                      -{formatCurrency(m.expense, 'USD')}
                    </p>
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${Math.max(m.income > 0 ? 8 : 2, incomeHeight)}%` }}
                      className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                        m.income > 0 ? 'bg-emerald-500 hover:bg-emerald-400' : isDark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${Math.max(m.expense > 0 ? 8 : 2, expenseHeight)}%` }}
                      className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                        m.expense > 0 ? 'bg-rose-500 hover:bg-rose-400' : isDark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className={`text-[10px] sm:text-xs font-medium mt-2 truncate max-w-full text-center ${mutedText}`}>
                    {isKm ? m.nameKm : m.nameEn.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 12-Month Detailed Data Table */}
        <div className={`rounded-2xl border overflow-hidden transition-colors ${cardBase}`}>
          <div className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-[#0D1424]' : isWarm ? 'border-[#E7E1D4] bg-[#F8F5EE]' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <h4 className={`text-xs sm:text-sm font-bold ${headingText}`}>
              {isKm ? 'តារាងសង្ខេបចំណូលចំណាយតាមខែ' : 'Monthly Financial Summary Table'}
            </h4>
            <span className={`text-xs ${mutedText}`}>
              {isKm ? `ឆ្នាំ ${selectedYear}` : `Year ${selectedYear}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className={`font-semibold border-b ${
                isDark
                  ? 'bg-[#101726] text-slate-300 border-slate-800'
                  : isWarm
                  ? 'bg-[#F2ECE0] text-[#3D3730] border-[#E7E1D4]'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="px-4 py-3">{isKm ? 'ខែ' : 'Month'}</th>
                  <th className="px-4 py-3 text-right text-emerald-500">
                    {isKm ? 'ចំណូល' : 'Income'}
                  </th>
                  <th className="px-4 py-3 text-right text-rose-500">
                    {isKm ? 'ចំណាយ' : 'Expense'}
                  </th>
                  <th className="px-4 py-3 text-right">
                    {isKm ? 'សមតុល្យនៅសល់' : 'Net Savings'}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : isWarm ? 'divide-[#EFEAE0]' : 'divide-slate-100'}`}>
                {monthlyStats.map((m) => (
                  <tr
                    key={m.month}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : isWarm ? 'hover:bg-[#F9F6F0]' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className={`px-4 py-2.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {isKm ? `ខែ${m.nameKm}` : m.nameEn}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-500">
                      {m.income > 0 ? `+${formatCurrency(m.income, 'USD')}` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-rose-500">
                      {m.expense > 0 ? `-${formatCurrency(m.expense, 'USD')}` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold">
                      <span
                        className={
                          m.net > 0
                            ? 'text-emerald-500'
                            : m.net < 0
                            ? 'text-rose-500'
                            : mutedText
                        }
                      >
                        {m.net !== 0 ? formatCurrency(m.net, 'USD') : '$0'}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className={`font-bold border-t-2 ${
                  isDark
                    ? 'bg-[#0D1424] border-slate-700 text-white'
                    : isWarm
                    ? 'bg-[#F2ECE0] border-[#DDD5C5] text-[#2C2825]'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <td className="px-4 py-3">
                    {isKm ? 'សរុបពេញមួយឆ្នាំ' : 'Full Year Total'}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-500">
                    +{formatCurrency(totalYearIncome, 'USD')}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-500">
                    -{formatCurrency(totalYearExpense, 'USD')}
                  </td>
                  <td className={`px-4 py-3 text-right text-base ${isDark ? 'text-indigo-300' : isWarm ? 'text-amber-900 font-extrabold' : 'text-indigo-900'}`}>
                    {formatCurrency(totalYearNet, 'USD')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
