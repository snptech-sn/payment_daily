import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Check,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Building2,
  HelpCircle,
  QrCode,
  Landmark,
  Wallet,
} from 'lucide-react';
import {
  AppSettings,
  Category,
  Currency,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
  defaultDate?: string;
  settings: AppSettings;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultDate,
  settings,
}) => {
  const isKm = settings.language === 'km';

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [categoryId, setCategoryId] = useState<string>('food');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Pre-fill or reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCurrency(editingTransaction.currency);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '');
      setNote(editingTransaction.note || '');
      setPaymentMethod(editingTransaction.paymentMethod);
    } else {
      // New transaction defaults
      setType('expense');
      setAmount('');
      setCurrency(settings.primaryCurrency === 'KHR' ? 'KHR' : 'USD');
      setCategoryId('food');
      const now = new Date();
      setDate(defaultDate || now.toISOString().slice(0, 10));
      setTime(now.toTimeString().slice(0, 5));
      setNote('');
      setPaymentMethod('bank');
    }
    setErrorMessage('');
  }, [isOpen, editingTransaction, defaultDate, settings.primaryCurrency]);

  if (!isOpen) return null;

  // Filter categories by selected type
  const availableCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  // Switch category if current category does not match type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = DEFAULT_CATEGORIES.find((c) => c.type === newType);
    if (firstCat) {
      setCategoryId(firstCat.id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage(
        isKm ? 'សូមបញ្ចូលចំនួនទឹកប្រាក់ដែលត្រឹមត្រូវ' : 'Please enter a valid amount greater than 0'
      );
      return;
    }

    onSave(
      {
        type,
        amount: numAmount,
        currency,
        categoryId,
        date: date || new Date().toISOString().slice(0, 10),
        time: time || undefined,
        note: note.trim() || undefined,
        paymentMethod,
      },
      editingTransaction ? editingTransaction.id : undefined
    );
    onClose();
  };

  // Quick amount chip presets
  const quickUsdPresets = [1, 2, 5, 10, 20, 50];
  const quickKhrPresets = [5000, 10000, 20000, 50000, 100000];

  // Quick note suggestions
  const quickNoteChips =
    type === 'expense'
      ? ['អាហារពេលព្រឹក', 'អាហារថ្ងៃត្រង់', 'កាហ្វេ', 'សាំងម៉ូតូ', 'ទិញម្ហូប', 'ថ្លៃភ្លើងទឹក']
      : ['ប្រាក់ខែ', 'លក់ទំនិញ', 'ការងារបន្ថែម', 'ប្រាក់រង្វាន់', 'ការប្រាក់'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {editingTransaction
                ? isKm
                  ? 'កែប្រែប្រតិបត្តិការ'
                  : 'Edit Transaction'
                : isKm
                ? 'កត់ត្រាចំណូល / ចំណាយថ្មី'
                : 'Record New Transaction'}
            </h3>
            <p className="text-xs text-slate-500">
              {isKm ? 'បំពេញព័ត៌មានលម្អិតខាងក្រោម' : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isKm ? 'ចំណាយ (Expense)' : 'Expense'}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isKm ? 'ចំណូល (Income)' : 'Income'}
            </button>
          </div>

          {/* Amount & Currency Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isKm ? 'ចំនួនទឹកប្រាក់' : 'Amount'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={currency === 'USD' ? '0.00' : '0'}
                  className="w-full text-xl sm:text-2xl font-bold px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Currency Selector */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    currency === 'USD'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('KHR')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    currency === 'KHR'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  KHR (៛)
                </button>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400 font-medium">
                {isKm ? 'រហ័ស:' : 'Quick:'}
              </span>
              {(currency === 'USD' ? quickUsdPresets : quickKhrPresets).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  {currency === 'USD' ? `$${val}` : `${val.toLocaleString()}៛`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isKm ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={15} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {isKm ? cat.nameKm : cat.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isKm ? 'កាលបរិច្ឆេទ' : 'Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isKm ? 'ពេលវេលា (ម៉ោង)' : 'Time'}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isKm ? 'វិធីទូទាត់' : 'Payment Method'}
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                {isKm ? 'ជ្រើសរើសជម្រើសទូទាត់' : 'Select payment option'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'khqr' as PaymentMethod,
                  labelKm: 'KHQR',
                  labelEn: 'KHQR',
                  subKm: 'ស្កេន QR',
                  subEn: 'Scan QR',
                  icon: QrCode,
                  isKhqr: true,
                },
                {
                  id: 'bank' as PaymentMethod,
                  labelKm: 'ធនាគារ ABA/Bakong',
                  labelEn: 'ABA / Bakong',
                  subKm: 'ផ្ទេរប្រាក់',
                  subEn: 'Bank Transfer',
                  icon: Building2,
                },
                {
                  id: 'acleda' as PaymentMethod,
                  labelKm: 'ធនាគារ អេស៊ីលីដា',
                  labelEn: 'ACLEDA Bank',
                  subKm: 'អេស៊ីលីដាម៉ូបាល',
                  subEn: 'ACLEDA Mobile',
                  icon: Landmark,
                },
                {
                  id: 'wing' as PaymentMethod,
                  labelKm: 'ធនាគារ វីង',
                  labelEn: 'Wing Bank',
                  subKm: 'វីងប៊ែង ម៉ូបាល',
                  subEn: 'Wing Bank App',
                  icon: Wallet,
                },
                {
                  id: 'cash' as PaymentMethod,
                  labelKm: 'សាច់ប្រាក់',
                  labelEn: 'Cash',
                  subKm: 'លុយសុទ្ធ',
                  subEn: 'Cash in hand',
                  icon: Banknote,
                },
                {
                  id: 'card' as PaymentMethod,
                  labelKm: 'កាតធនាគារ',
                  labelEn: 'Card',
                  subKm: 'Visa / Master',
                  subEn: 'Debit/Credit',
                  icon: CreditCard,
                },
              ].map((pm) => {
                const isSelected = paymentMethod === pm.id;
                const IconComponent = pm.icon;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-200/80 text-emerald-800'
                            : pm.isKhqr
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-600 text-white">
                          ✓
                        </span>
                      ) : pm.isKhqr ? (
                        <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-rose-600 text-white tracking-wider">
                          KHQR
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold truncate leading-tight">
                        {isKm ? pm.labelKm : pm.labelEn}
                      </span>
                      <span
                        className={`block text-[10px] mt-0.5 truncate ${
                          isSelected ? 'text-emerald-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {isKm ? pm.subKm : pm.subEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isKm ? 'កំណត់ចំណាំបន្ថែម' : 'Note / Description'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isKm ? 'ឧទាហរណ៍៖ បាយថ្ងៃត្រង់, ទិញសាំងម៉ូតូ, etc.' : 'e.g. Lunch with team, Fuel, etc.'
              }
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {/* Quick chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
              {quickNoteChips.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNote(n)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
                >
                  + {n}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {editingTransaction
                ? isKm
                  ? 'រក្សាទុកការកែប្រែ'
                  : 'Save Changes'
                : isKm
                ? 'រក្សាទុកប្រតិបត្តិការ'
                : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
