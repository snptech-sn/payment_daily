import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  CalendarCheck2,
  FileText,
} from 'lucide-react';
import { UITheme, ViewPeriod } from '../types';
import {
  formatDate,
  formatMonthYear,
  formatYear,
  KHMER_MONTHS,
  ENGLISH_MONTHS,
} from '../utils/formatters';

interface PeriodSelectorProps {
  viewPeriod: ViewPeriod;
  onSelectPeriod: (period: ViewPeriod) => void;
  selectedDate: string; // YYYY-MM-DD
  selectedYear: number;
  selectedMonth: number; // 1-12
  onChangeDate: (date: string) => void;
  onChangeMonth: (year: number, month: number) => void;
  onChangeYear: (year: number) => void;
  language: 'km' | 'en';
  theme?: UITheme;
  onOpenReportModal?: () => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  viewPeriod,
  onSelectPeriod,
  selectedDate,
  selectedYear,
  selectedMonth,
  onChangeDate,
  onChangeMonth,
  onChangeYear,
  language,
  theme = 'emerald',
  onOpenReportModal,
}) => {
  const isKm = language === 'km';
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';
  const isIndigo = theme === 'indigo';

  // Navigation handlers
  const handlePrev = () => {
    if (viewPeriod === 'daily') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      const iso = d.toISOString().slice(0, 10);
      onChangeDate(iso);
    } else if (viewPeriod === 'monthly') {
      let newMonth = selectedMonth - 1;
      let newYear = selectedYear;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      onChangeMonth(newYear, newMonth);
    } else {
      onChangeYear(selectedYear - 1);
    }
  };

  const handleNext = () => {
    if (viewPeriod === 'daily') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      const iso = d.toISOString().slice(0, 10);
      onChangeDate(iso);
    } else if (viewPeriod === 'monthly') {
      let newMonth = selectedMonth + 1;
      let newYear = selectedYear;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      onChangeMonth(newYear, newMonth);
    } else {
      onChangeYear(selectedYear + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;

    onChangeDate(todayIso);
    onChangeMonth(todayYear, todayMonth);
    onChangeYear(todayYear);
  };

  const getActiveTabClass = (active: boolean) => {
    if (!active) {
      return isDark
        ? 'text-slate-400 hover:text-slate-200'
        : isWarm
        ? 'text-[#6B635A] hover:text-[#2C2825]'
        : 'text-slate-600 hover:text-slate-900';
    }
    if (isDark) {
      return 'bg-[#1E293B] text-emerald-400 font-bold shadow-xs border border-slate-700';
    }
    if (isWarm) {
      return 'bg-[#FFFEFC] text-amber-900 font-bold shadow-xs border border-[#E7E1D4]';
    }
    if (isIndigo) {
      return 'bg-white text-indigo-700 font-bold shadow-xs border border-indigo-100';
    }
    return 'bg-white text-emerald-700 font-bold shadow-xs border border-emerald-100';
  };

  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 mb-6 transition-colors duration-200 ${
        isDark
          ? 'bg-[#151E2E] border-slate-800 text-slate-100 shadow-md shadow-black/20'
          : isWarm
          ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825] shadow-xs'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Selection: Daily / Monthly / Yearly */}
        <div
          className={`inline-flex p-1 rounded-xl self-center md:self-auto w-full md:w-auto ${
            isDark ? 'bg-[#0D1424] border border-slate-800/80' : isWarm ? 'bg-[#F3EFE7] border border-[#E7E1D4]' : 'bg-slate-100'
          }`}
        >
          <button
            id="tab-daily"
            onClick={() => onSelectPeriod('daily')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${getActiveTabClass(
              viewPeriod === 'daily'
            )}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{isKm ? 'ប្រចាំថ្ងៃ' : 'Daily'}</span>
          </button>
          <button
            id="tab-monthly"
            onClick={() => onSelectPeriod('monthly')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${getActiveTabClass(
              viewPeriod === 'monthly'
            )}`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isKm ? 'ប្រចាំខែ' : 'Monthly'}</span>
          </button>
          <button
            id="tab-yearly"
            onClick={() => onSelectPeriod('yearly')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${getActiveTabClass(
              viewPeriod === 'yearly'
            )}`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>{isKm ? 'ប្រចាំឆ្នាំ' : 'Yearly'}</span>
          </button>
        </div>

        {/* Date / Month / Year Navigation */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Previous Button */}
          <button
            id="period-prev-btn"
            onClick={handlePrev}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                : isWarm
                ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title={isKm ? 'ថយក្រោយ' : 'Previous'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Current Period Display / Direct Selector */}
          <div
            className={`flex items-center gap-2 border px-3 sm:px-4 py-2 rounded-xl ${
              isDark
                ? 'bg-[#0D1424] border-slate-800 text-slate-200'
                : isWarm
                ? 'bg-[#FAF7F2] border-[#E7E1D4] text-[#2C2825]'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {viewPeriod === 'daily' && (
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold">
                  {formatDate(selectedDate, language)}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && onChangeDate(e.target.value)}
                  className={`w-7 h-7 cursor-pointer border-none bg-transparent p-0 ${
                    isDark ? 'text-slate-100 opacity-90' : 'text-slate-700 opacity-80'
                  }`}
                  title={isKm ? 'ជ្រើសរើសថ្ងៃ' : 'Select date'}
                />
              </div>
            )}

            {viewPeriod === 'monthly' && (
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold">
                  {formatMonthYear(selectedYear, selectedMonth, language)}
                </span>
                <select
                  value={selectedMonth}
                  onChange={(e) => onChangeMonth(selectedYear, parseInt(e.target.value, 10))}
                  className={`border text-xs sm:text-sm rounded-lg px-2 py-1 font-semibold focus:outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#1E293B] border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-[#FFFEFC] border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {(isKm ? KHMER_MONTHS : ENGLISH_MONTHS).map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {isKm ? `ខែ${m}` : m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => onChangeMonth(parseInt(e.target.value, 10), selectedMonth)}
                  className={`border text-xs sm:text-sm rounded-lg px-2 py-1 font-semibold focus:outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#1E293B] border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-[#FFFEFC] border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {isKm ? `ឆ្នាំ ${y}` : y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewPeriod === 'yearly' && (
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold">
                  {formatYear(selectedYear, language)}
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => onChangeYear(parseInt(e.target.value, 10))}
                  className={`border text-xs sm:text-sm rounded-lg px-2 py-1 font-semibold focus:outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#1E293B] border-slate-700 text-slate-200'
                      : isWarm
                      ? 'bg-[#FFFEFC] border-[#DDD6C8] text-[#2C2825]'
                      : 'bg-white border-slate-200 text-slate-700'
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
          </div>

          {/* Next Button */}
          <button
            id="period-next-btn"
            onClick={handleNext}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                : isWarm
                ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title={isKm ? 'ទៅមុខ' : 'Next'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Current / Today Button */}
          <button
            id="period-today-btn"
            onClick={handleToday}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                : isWarm
                ? 'bg-[#EFE9DF] hover:bg-[#E5DFD3] text-amber-900 border border-[#E7E1D4]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {viewPeriod === 'daily'
              ? isKm
                ? 'ថ្ងៃនេះ'
                : 'Today'
              : viewPeriod === 'monthly'
              ? isKm
                ? 'ខែនេះ'
                : 'This Month'
              : isKm
              ? 'ឆ្នាំនេះ'
              : 'This Year'}
          </button>

          {/* Report Button */}
          {onOpenReportModal && (
            <button
              id="period-open-report-btn"
              onClick={onOpenReportModal}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : isWarm
                  ? 'bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825] border border-[#E7E1D4]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
              title={isKm ? 'របាយការណ៍ & បោះពុម្ព' : 'Reports & Print'}
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">{isKm ? 'របាយការណ៍' : 'Report'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
