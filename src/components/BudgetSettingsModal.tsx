import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Coins,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  Check,
  Globe,
} from 'lucide-react';
import { AppSettings, Transaction } from '../types';
import { exportDataAsCsv, exportDataAsJson } from '../utils/storage';
import { SAMPLE_TRANSACTIONS } from '../data/sampleData';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  transactions: Transaction[];
  onResetSampleData: () => void;
  onClearAllData: () => void;
  mode?: 'budget' | 'settings';
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  transactions,
  onResetSampleData,
  onClearAllData,
  mode = 'settings',
}) => {
  const isKm = settings.language === 'km';
  const [budgetInput, setBudgetInput] = useState<string>(settings.monthlyBudget.toString());
  const [exchangeRateInput, setExchangeRateInput] = useState<string>(settings.exchangeRate.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = parseFloat(budgetInput) || 0;
    const rateVal = parseFloat(exchangeRateInput) || 4100;

    onUpdateSettings({
      monthlyBudget: Math.max(0, budgetVal),
      exchangeRate: Math.max(1, rateVal),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {mode === 'budget'
                ? isKm
                  ? 'កំណត់ថវិកាប្រចាំខែ'
                  : 'Monthly Budget Setting'
                : isKm
                ? 'ការកំណត់ និងការគ្រប់គ្រងទិន្នន័យ'
                : 'Settings & Data Management'}
            </h3>
            <p className="text-xs text-slate-500">
              {isKm ? 'គ្រប់គ្រងគោលដៅចំណាយ និងទិន្នន័យរបស់អ្នក' : 'Manage your financial targets and backups'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Monthly Budget Goal */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <label className="text-xs sm:text-sm font-bold text-indigo-950">
                {isKm ? 'គោលដៅថវិកាចំណាយប្រចាំខែ ($)' : 'Monthly Expense Budget Target ($)'}
              </label>
            </div>
            <p className="text-xs text-indigo-800/80 mb-3">
              {isKm
                ? 'កំណត់កម្រិតកំណត់ចំណាយអតិបរមាក្នុងខែនីមួយៗ ដើម្បីជួយអ្នកសន្សំប្រាក់បានកាន់តែច្រើន'
                : 'Set a monthly expenditure limit to monitor savings and prevent overspending'}
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                $
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="500"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Exchange Rate Setting */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <label className="text-xs sm:text-sm font-bold text-slate-800">
                {isKm ? 'អត្រាប្តូរប្រាក់ ($1 = ? ៛)' : 'Exchange Rate ($1 = ? KHR)'}
              </label>
            </div>
            <input
              type="number"
              min="1000"
              step="10"
              value={exchangeRateInput}
              onChange={(e) => setExchangeRateInput(e.target.value)}
              placeholder="4100"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Currency Display Preference */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              {isKm ? 'ការបង្ហាញរូបិយប័ណ្ណសំខាន់' : 'Display Currency Preference'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'BOTH', label: isKm ? 'ទាំងពីរ (USD/៛)' : 'Both (USD/៛)' },
                { id: 'USD', label: 'USD ($)' },
                { id: 'KHR', label: 'KHR (៛)' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onUpdateSettings({ primaryCurrency: c.id as any })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    settings.primaryCurrency === c.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Export & Backup Section */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2">
              {isKm ? 'ការនាំចេញ និងបម្រុងទុកទិន្នន័យ' : 'Backup & Data Export'}
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => exportDataAsCsv(transactions)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isKm ? 'ទាញយក CSV (Excel)' : 'Export CSV'}</span>
              </button>
              <button
                type="button"
                onClick={() => exportDataAsJson(transactions, settings)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>{isKm ? 'បម្រុងទុក JSON' : 'Backup JSON'}</span>
              </button>
            </div>

            {/* Reset / Clear Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      isKm
                        ? 'តើអ្នកចង់ផ្ទុកទិន្នន័យគំរូម្តងទៀតមែនទេ?'
                        : 'Reset to realistic sample data?'
                    )
                  ) {
                    onResetSampleData();
                    onClose();
                  }
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isKm ? 'ផ្ទុកទិន្នន័យគំរូ' : 'Load Sample Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      isKm
                        ? 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យប្រតិបត្តិការទាំងអស់មែនទេ?'
                        : 'Clear all transaction data?'
                    )
                  ) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isKm ? 'លុបទិន្នន័យទាំងអស់' : 'Clear All Data'}</span>
              </button>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isKm ? 'បានរក្សាទុក' : 'Saved!'}</span>
                </>
              ) : (
                <span>{isKm ? 'រក្សាទុកការកំណត់' : 'Save Settings'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
