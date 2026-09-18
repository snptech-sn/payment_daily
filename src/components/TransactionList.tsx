import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Tag,
} from 'lucide-react';
import { AppSettings, PaymentMethod, Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import {
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
  settings: AppSettings;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
  settings,
}) => {
  const isKm = settings.language === 'km';
  const theme = settings.theme || 'emerald';
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId);
        const catMatch =
          cat &&
          (cat.nameKm.toLowerCase().includes(q) ||
            cat.nameEn.toLowerCase().includes(q));
        const noteMatch = tx.note && tx.note.toLowerCase().includes(q);
        if (!catMatch && !noteMatch) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-colors duration-200 ${
        isDark
          ? 'bg-[#151E2E] border-slate-800 text-slate-100 shadow-md shadow-black/20'
          : isWarm
          ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825] shadow-xs'
          : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : isWarm ? 'text-[#2C2825]' : 'text-slate-900'}`}>
            <span>{isKm ? 'បញ្ជីប្រតិបត្តិការ' : 'Transaction History'}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : isWarm ? 'bg-[#EFE9DF] text-[#4A423B]' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredList.length}
            </span>
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : isWarm ? 'text-[#7A7267]' : 'text-slate-500'}`}>
            {isKm ? 'កត់ត្រាចំណូល និងចំណាយលម្អិត' : 'Detailed records of your cash activity'}
          </p>
        </div>

        {/* Add Transaction Button */}
        <button
          id="list-add-transaction-btn"
          onClick={onOpenNewTransaction}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isKm ? 'បន្ថែមប្រតិបត្តិការថ្មី' : 'Add Transaction'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-2.5 mb-5 pb-4 border-b ${
        isDark ? 'border-slate-800' : isWarm ? 'border-[#E7E1D4]' : 'border-slate-100'
      }`}>
        {/* Type Segments */}
        <div className={`inline-flex p-1 rounded-xl ${
          isDark ? 'bg-[#0D1424] border border-slate-800' : isWarm ? 'bg-[#F3EFE7] border border-[#E7E1D4]' : 'bg-slate-100'
        }`}>
          <button
            id="filter-all-btn"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? isDark
                  ? 'bg-[#1E293B] text-slate-100 shadow-xs border border-slate-700'
                  : isWarm
                  ? 'bg-[#FFFEFC] text-[#2C2825] shadow-xs border border-[#E7E1D4]'
                  : 'bg-white text-slate-900 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : isWarm
                ? 'text-[#6B635A] hover:text-[#2C2825]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isKm ? 'ទាំងអស់' : 'All'}
          </button>
          <button
            id="filter-expense-btn"
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'expense'
                ? isDark
                  ? 'bg-rose-950/80 text-rose-300 shadow-xs font-bold border border-rose-800/60'
                  : 'bg-rose-50 text-rose-700 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-rose-300'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            {isKm ? 'ចំណាយ' : 'Expenses'}
          </button>
          <button
            id="filter-income-btn"
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'income'
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 shadow-xs font-bold border border-emerald-800/60'
                  : 'bg-emerald-50 text-emerald-700 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-emerald-300'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            {isKm ? 'ចំណូល' : 'Income'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKm ? 'ស្វែងរកតាមចំណាំ ឬប្រភេទ...' : 'Search by note or category...'}
            className={`w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0D1424] border border-slate-700 text-slate-100 placeholder-slate-500 focus:bg-[#151E2E] focus:ring-2 focus:ring-emerald-500'
                : isWarm
                ? 'bg-[#FAF7F2] border border-[#DDD6C8] text-[#2C2825] placeholder-[#9B9285] focus:bg-[#FFFEFC] focus:ring-2 focus:ring-amber-500'
                : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500'
            }`}
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full md:w-auto px-3 py-1.5 text-xs sm:text-sm rounded-xl font-medium focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-[#0D1424] border border-slate-700 text-slate-200 focus:ring-2 focus:ring-emerald-500'
                : isWarm
                ? 'bg-[#FAF7F2] border border-[#DDD6C8] text-[#2C2825] focus:ring-2 focus:ring-amber-500'
                : 'bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500'
            }`}
          >
            <option value="all">{isKm ? 'គ្រប់ប្រភេទទាំងអស់' : 'All Categories'}</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {isKm ? cat.nameKm : cat.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Items */}
      {filteredList.length === 0 ? (
        <div className={`text-center py-12 px-4 border-2 border-dashed rounded-2xl ${
          isDark ? 'border-slate-800 bg-[#0D1424]/40' : isWarm ? 'border-[#E7E1D4] bg-[#FAF7F2]/50' : 'border-slate-200'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'
          }`}>
            <Filter className="w-6 h-6" />
          </div>
          <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : isWarm ? 'text-[#2C2825]' : 'text-slate-700'}`}>
            {isKm ? 'មិនមានប្រតិបត្តិការត្រូវបានរកឃើញទេ' : 'No transactions found'}
          </h4>
          <p className={`text-xs max-w-sm mx-auto mt-1 mb-4 ${isDark ? 'text-slate-400' : isWarm ? 'text-[#7A7267]' : 'text-slate-500'}`}>
            {isKm
              ? 'សូមចុចប៊ូតុងខាងក្រោមដើម្បីកត់ត្រាចំណូល ឬចំណាយថ្មីរបស់អ្នក'
              : 'Add your income or expense to begin tracking your budget'}
          </p>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isKm ? '+ កត់ត្រាឥឡូវនេះ' : '+ Add Transaction Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredList.map((tx) => {
            const cat = DEFAULT_CATEGORIES.find((c) => c.id === tx.categoryId) || {
              id: tx.categoryId,
              nameKm: 'ផ្សេងៗ',
              nameEn: 'Other',
              color: '#64748b',
              bgColor: '#f1f5f9',
              icon: 'MoreHorizontal',
              type: tx.type,
            };
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all group ${
                  isDark
                    ? 'border-slate-800/80 bg-[#0D1424]/70 hover:bg-[#1E293B]/70 hover:border-slate-700'
                    : isWarm
                    ? 'border-[#EBE4D8] bg-[#FAF7F2] hover:bg-[#F3EFE7] hover:border-[#DDD5C5]'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                }`}
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    <CategoryIcon iconName={cat.icon} size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold truncate ${isDark ? 'text-slate-100' : isWarm ? 'text-[#2C2825]' : 'text-slate-900'}`}>
                        {isKm ? cat.nameKm : cat.nameEn}
                      </span>
                      {/* Payment method badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          tx.paymentMethod === 'khqr'
                            ? isDark
                              ? 'bg-rose-950/70 text-rose-300 border-rose-900/60'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                            : tx.paymentMethod === 'acleda'
                            ? isDark
                              ? 'bg-blue-950/70 text-blue-300 border-blue-900/60'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                            : tx.paymentMethod === 'wing'
                            ? isDark
                              ? 'bg-teal-950/70 text-teal-300 border-teal-900/60'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                            : tx.paymentMethod === 'bank'
                            ? isDark
                              ? 'bg-indigo-950/70 text-indigo-300 border-indigo-900/60'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : tx.paymentMethod === 'cash'
                            ? isDark
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-900/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tx.paymentMethod === 'card'
                            ? isDark
                              ? 'bg-purple-950/70 text-purple-300 border-purple-900/60'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : isWarm
                            ? 'bg-[#EAE3D6] text-[#4A423B] border-[#DDD6C8]'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {getPaymentMethodLabel(tx.paymentMethod, settings.language)}
                      </span>
                    </div>

                    {/* Note & Date */}
                    <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                      {tx.note && (
                        <span className={`font-medium truncate max-w-xs sm:max-w-md ${isDark ? 'text-slate-300' : isWarm ? 'text-[#4A423B]' : 'text-slate-700'}`}>
                          {tx.note}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : isWarm ? 'text-[#8A8175]' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" />
                        {tx.date} {tx.time ? `• ${tx.time}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold tracking-tight block ${
                        isExpense
                          ? isDark ? 'text-rose-400' : 'text-rose-600'
                          : isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                    {tx.currency === 'KHR' && (
                      <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        ≈ ${(tx.amount / settings.exchangeRate).toFixed(2)}
                      </span>
                    )}
                    {tx.currency === 'USD' && (
                      <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        ≈ {(tx.amount * settings.exchangeRate).toLocaleString()} ៛
                      </span>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                      title={isKm ? 'កែសម្រួល' : 'Edit'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            isKm
                              ? 'តើអ្នកប្រាកដជាចង់លុបប្រតិបត្តិការនេះមែនទេ?'
                              : 'Are you sure you want to delete this transaction?'
                          )
                        ) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={isKm ? 'លុប' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
