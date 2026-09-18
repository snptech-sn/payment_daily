import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  Globe,
  Settings2,
  TrendingUp,
  Coins,
  Palette,
  FileText,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Layers,
  Plus,
  User as UserIcon,
  LogIn,
  LogOut,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { AppSettings } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenBudgetModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenNewTransaction: () => void;
  onOpenThemeModal: () => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenBudgetModal,
  onOpenSettingsModal,
  onOpenNewTransaction,
  onOpenThemeModal,
  onOpenReportModal,
  onOpenAuthModal,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const isKm = settings.language === 'km';
  const theme = settings.theme || 'emerald';
  const isDark = theme === 'dark';
  const isWarm = theme === 'warm';

  // Mobile menu dropdown state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  // Close mobile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Theme dot indicator color
  const themeColor =
    theme === 'dark'
      ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
      : theme === 'indigo'
      ? 'bg-indigo-600 ring-2 ring-indigo-600/30'
      : theme === 'warm'
      ? 'bg-amber-600 ring-2 ring-amber-600/30'
      : 'bg-emerald-500 ring-2 ring-emerald-500/30';

  const themeNameLabel =
    theme === 'dark'
      ? isKm
        ? 'រាត្រី'
        : 'Dark'
      : theme === 'indigo'
      ? isKm
        ? 'ខៀវ'
        : 'Indigo'
      : theme === 'warm'
      ? isKm
        ? 'ក្រដាស'
        : 'Warm'
      : isKm
      ? 'មរកត'
      : 'Emerald';

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-200 border-b backdrop-blur-md ${
        isDark
          ? 'bg-[#0F172A]/95 border-slate-800 text-slate-100 shadow-md shadow-black/20'
          : isWarm
          ? 'bg-[#FDFBF7]/95 border-[#E5DFD3] text-[#2C2825] shadow-xs'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 shadow-emerald-500/15'
                  : isWarm
                  ? 'bg-gradient-to-br from-amber-700 to-stone-800 text-white shadow-amber-900/15'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
              }`}
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className={`text-sm sm:text-base lg:text-lg font-extrabold truncate tracking-tight ${
                    isDark ? 'text-slate-100' : isWarm ? 'text-[#2C2825]' : 'text-slate-900'
                  }`}
                >
                  {isKm ? 'កម្មវិធីគ្រប់គ្រងចំណូលចំណាយ' : 'Income & Expense Tracker'}
                </h1>
                <span
                  className={`hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isDark
                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                      : isWarm
                      ? 'bg-amber-100/70 text-amber-900 border-amber-300/80'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isKm ? 'ងាយស្រួល & រហ័ស' : 'Simple & Fast'}
                </span>
              </div>
              <p
                className={`text-xs truncate hidden sm:block ${
                  isDark ? 'text-slate-400' : isWarm ? 'text-[#786F66]' : 'text-slate-500'
                }`}
              >
                {isKm
                  ? 'តាមដានប្រាក់ចំណូល និងចំណាយប្រចាំថ្ងៃ ប្រចាំខែ និងប្រចាំឆ្នាំ'
                  : 'Track your daily, monthly, and yearly cashflow effortlessly'}
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation (hidden on mobile < md) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
            {/* Currency Mode Switcher (visible on lg+) */}
            <div
              className={`hidden lg:flex items-center p-1 rounded-xl text-xs font-semibold h-9 ${
                isDark ? 'bg-slate-800/90 text-slate-300' : isWarm ? 'bg-[#EFE9DF] text-[#4A443E]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <button
                id="currency-both-btn"
                onClick={() => onUpdateSettings({ primaryCurrency: 'BOTH' })}
                className={`h-7 px-2.5 rounded-lg transition-all cursor-pointer flex items-center ${
                  settings.primaryCurrency === 'BOTH'
                    ? isDark
                      ? 'bg-[#151E2E] text-emerald-400 shadow-xs font-bold border border-slate-700'
                      : isWarm
                      ? 'bg-[#FFFEFC] text-amber-900 shadow-xs font-bold border border-[#E7E1D4]'
                      : 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'hover:opacity-80'
                }`}
              >
                {isKm ? 'ទាំងពីរ (USD/៛)' : 'Both ($/៛)'}
              </button>
              <button
                id="currency-usd-btn"
                onClick={() => onUpdateSettings({ primaryCurrency: 'USD' })}
                className={`h-7 px-2 rounded-lg transition-all cursor-pointer flex items-center ${
                  settings.primaryCurrency === 'USD'
                    ? isDark
                      ? 'bg-[#151E2E] text-emerald-400 shadow-xs font-bold border border-slate-700'
                      : isWarm
                      ? 'bg-[#FFFEFC] text-amber-900 shadow-xs font-bold border border-[#E7E1D4]'
                      : 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'hover:opacity-80'
                }`}
              >
                USD ($)
              </button>
              <button
                id="currency-khr-btn"
                onClick={() => onUpdateSettings({ primaryCurrency: 'KHR' })}
                className={`h-7 px-2 rounded-lg transition-all cursor-pointer flex items-center ${
                  settings.primaryCurrency === 'KHR'
                    ? isDark
                      ? 'bg-[#151E2E] text-emerald-400 shadow-xs font-bold border border-slate-700'
                      : isWarm
                      ? 'bg-[#FFFEFC] text-amber-900 shadow-xs font-bold border border-[#E7E1D4]'
                      : 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'hover:opacity-80'
                }`}
              >
                KHR (៛)
              </button>
            </div>

            {/* Exchange rate badge (hidden on md, visible on lg+) */}
            <div
              title={isKm ? 'អត្រាប្តូរប្រាក់បច្ចុប្បន្ន' : 'Current exchange rate'}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 h-9 rounded-xl border text-xs cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : isWarm
                  ? 'bg-[#FAF7F2] border-[#E7E1D4] text-[#5C554E] hover:bg-[#F3EFE7]'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              onClick={onOpenSettingsModal}
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold">$1 = {settings.exchangeRate.toLocaleString()} ៛</span>
            </div>

            {/* Reports Button */}
            <button
              id="header-report-btn"
              onClick={onOpenReportModal}
              className={`h-9 px-2.5 lg:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                  : isWarm
                  ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title={isKm ? 'របាយការណ៍ ប្រចាំថ្ងៃ ខែ ឆ្នាំ & បោះពុម្ព' : 'Financial Reports & Print'}
            >
              <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isKm ? 'របាយការណ៍' : 'Reports'}</span>
            </button>

            {/* Budget Button */}
            <button
              id="header-budget-btn"
              onClick={onOpenBudgetModal}
              className={`h-9 px-2.5 lg:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                  : isWarm
                  ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title={isKm ? 'កំណត់ថវិកាប្រចាំខែ' : 'Monthly Budget'}
            >
              <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{isKm ? 'ថវិកា' : 'Budget'}</span>
              {settings.monthlyBudget > 0 && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    isDark
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  ${settings.monthlyBudget}
                </span>
              )}
            </button>

            {/* UI Theme Switcher Button */}
            <button
              id="header-theme-btn"
              onClick={onOpenThemeModal}
              className={`h-9 px-2.5 lg:px-3 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-semibold text-xs shadow-xs ${
                isDark
                  ? 'border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:border-slate-600'
                  : isWarm
                  ? 'border-[#E2DCCE] bg-[#FAF7F2] hover:bg-[#F0EBE1] text-[#2C2825]'
                  : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800 hover:border-slate-300'
              }`}
              title={isKm ? 'ប្តូរផ្ទៃ UI & ស្ទីល' : 'Change UI Surface & Theme'}
            >
              <Palette className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isKm ? 'ផ្ទៃ UI' : 'Theme'}</span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${themeColor}`}></span>
                <span className="text-[11px] opacity-75 hidden xl:inline font-normal">
                  ({themeNameLabel})
                </span>
              </span>
            </button>

            {/* Settings Button */}
            <button
              id="header-settings-btn"
              onClick={onOpenSettingsModal}
              className={`h-9 px-2.5 lg:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                  : isWarm
                  ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title={isKm ? 'ការកំណត់ & បម្រុងទុក' : 'Settings & Backup'}
            >
              <Settings2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="hidden lg:inline">{isKm ? 'ការកំណត់' : 'Settings'}</span>
            </button>

            {/* Language Switcher */}
            <button
              id="header-language-toggle-btn"
              onClick={() => onUpdateSettings({ language: isKm ? 'en' : 'km' })}
              className={`h-9 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : isWarm
                  ? 'bg-[#EFE9DF] hover:bg-[#E5DFD3] text-[#4A443E]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="ប្តូរភាសា / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{isKm ? 'EN' : 'ខ្មែរ'}</span>
            </button>

            {/* User Account / Sign In Button */}
            {user ? (
              <button
                id="header-user-profile-btn"
                onClick={onOpenAuthModal}
                className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200'
                    : isWarm
                    ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title={user.email || 'User Account'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate hidden xl:inline">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Cloud Synced"></span>
              </button>
            ) : (
              <button
                id="header-sign-in-btn"
                onClick={onOpenAuthModal}
                className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                    : isWarm
                    ? 'border-[#E7E1D4] bg-[#FFFEFC] hover:bg-[#F3EFE7] text-[#2C2825]'
                    : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title={isKm ? 'ចូលគណនីគ្រប់គ្រងផ្ទាល់ខ្លួន' : 'Sign In'}
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>{isKm ? 'ចូលគណនី' : 'Sign In'}</span>
              </button>
            )}

            {/* Add Transaction Primary Button */}
            <button
              id="header-add-transaction-btn"
              onClick={onOpenNewTransaction}
              className={`h-9 px-3.5 lg:px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ml-0.5 ${
                isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : isWarm
                  ? 'bg-[#7C4A27] hover:bg-[#683C1E] text-white shadow-amber-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isKm ? 'កត់ត្រា' : 'Add New'}</span>
            </button>
          </div>

          {/* Mobile Action Controls (< md screen) */}
          <div className="flex md:hidden items-center gap-1.5 relative">
            {/* Mobile User Profile / Sign In */}
            <button
              id="mobile-user-auth-btn"
              onClick={onOpenAuthModal}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                  : isWarm
                  ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825]'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
              title={user ? user.displayName || user.email || 'User' : (isKm ? 'ចូលគណនី' : 'Sign In')}
            >
              {user ? (
                user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )
              ) : (
                <LogIn className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {/* Mobile Language Switcher */}
            <button
              id="mobile-language-toggle-btn"
              onClick={() => onUpdateSettings({ language: isKm ? 'en' : 'km' })}
              className={`h-9 px-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : isWarm
                  ? 'bg-[#FAF7F2] border-[#E5DFD3] text-[#4A443E]'
                  : 'bg-slate-100/90 border-slate-200 text-slate-700'
              }`}
              title="ប្តូរភាសា"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{isKm ? 'EN' : 'ខ្មែរ'}</span>
            </button>

            {/* Mobile Add New Transaction Button */}
            <button
              id="mobile-header-add-transaction-btn"
              onClick={onOpenNewTransaction}
              className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : isWarm
                  ? 'bg-[#7C4A27] hover:bg-[#683C1E] text-white shadow-amber-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isKm ? 'កត់ត្រា' : 'Add'}</span>
            </button>

            {/* Mobile Menu Dropdown Toggle Button */}
            <button
              ref={mobileMenuBtnRef}
              id="mobile-header-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                isMobileMenuOpen
                  ? isDark
                    ? 'bg-slate-700 border-slate-600 text-emerald-400'
                    : isWarm
                    ? 'bg-[#EAE3D6] border-[#DDD6C8] text-[#2C2825]'
                    : 'bg-slate-200 border-slate-300 text-slate-900'
                  : isDark
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                  : isWarm
                  ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825]'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
              title={isKm ? 'ម៉ឺនុយមុខងារ' : 'Tools Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Popover Drawer / Dropdown */}
            {isMobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                id="mobile-header-dropdown"
                className={`absolute right-0 top-11 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-fadeIn ${
                  isDark
                    ? 'bg-[#151E2E] border-slate-700/80 text-slate-100 shadow-black/60'
                    : isWarm
                    ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825] shadow-amber-950/10'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
                }`}
              >
                {/* Section 0: User Profile / Sign In in Mobile Drawer */}
                <div
                  className={`p-2 mb-1.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800/60 border-slate-700/60'
                      : isWarm
                      ? 'bg-[#FAF7F2] border-[#E5DFD3]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{user.displayName || 'User'}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {isKm ? 'Cloud Synced' : 'Synced'}
                        </span>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          {isKm ? 'គ្រប់គ្រង' : 'Manage'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isKm ? 'ចូលគណនីគ្រប់គ្រងផ្ទាល់ខ្លួន' : 'Sign In with Google'}</span>
                    </button>
                  )}
                </div>

                {/* Section 1: Major Tools */}
                <div className="p-1 space-y-1">
                  {/* Financial Reports */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenReportModal();
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      isDark
                        ? 'hover:bg-slate-800 text-slate-200'
                        : isWarm
                        ? 'hover:bg-[#F3EFE7] text-[#2C2825]'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold">{isKm ? 'របាយការណ៍ហិរញ្ញវត្ថុ' : 'Financial Reports'}</div>
                      <div className="text-[11px] opacity-70 truncate">
                        {isKm ? 'ប្រចាំថ្ងៃ ខែ ឆ្នាំ & បោះពុម្ព' : 'Daily, monthly, yearly & print'}
                      </div>
                    </div>
                  </button>

                  {/* Monthly Budget */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenBudgetModal();
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      isDark
                        ? 'hover:bg-slate-800 text-slate-200'
                        : isWarm
                        ? 'hover:bg-[#F3EFE7] text-[#2C2825]'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{isKm ? 'កំណត់ថវិកាប្រចាំខែ' : 'Monthly Budget'}</span>
                        {settings.monthlyBudget > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                            ${settings.monthlyBudget}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] opacity-70 truncate">
                        {isKm ? 'តាមដានការចំណាយប្រៀបធៀបគោលដៅ' : 'Track spend vs target'}
                      </div>
                    </div>
                  </button>

                  {/* Theme Switcher */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenThemeModal();
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      isDark
                        ? 'hover:bg-slate-800 text-slate-200'
                        : isWarm
                        ? 'hover:bg-[#F3EFE7] text-[#2C2825]'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{isKm ? 'ផ្ទៃ UI & ស្ទីល' : 'UI Surface & Theme'}</span>
                        <span className={`w-2 h-2 rounded-full ${themeColor}`}></span>
                      </div>
                      <div className="text-[11px] opacity-70 truncate">
                        {isKm ? `បច្ចុប្បន្ន: ${themeNameLabel}` : `Current: ${themeNameLabel}`}
                      </div>
                    </div>
                  </button>

                  {/* Settings & Backup */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSettingsModal();
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      isDark
                        ? 'hover:bg-slate-800 text-slate-200'
                        : isWarm
                        ? 'hover:bg-[#F3EFE7] text-[#2C2825]'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold">{isKm ? 'ការកំណត់ & បម្រុងទុក' : 'Settings & Backup'}</div>
                      <div className="text-[11px] opacity-70 truncate">
                        {isKm ? 'បម្រុងទុកទិន្នន័យ JSON/CSV & អត្រាប្តូរប្រាក់' : 'Manage backup & rates'}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Section 2: Currency & Exchange Rate Controls */}
                <div
                  className={`mt-1 pt-2 border-t px-2 py-1 space-y-2 ${
                    isDark ? 'border-slate-800' : isWarm ? 'border-[#EAE3D6]' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>{isKm ? 'រូបិយប័ណ្ណបង្ហាញ:' : 'Display Currency:'}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      $1 = {settings.exchangeRate.toLocaleString()} ៛
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => onUpdateSettings({ primaryCurrency: 'BOTH' })}
                      className={`py-1 rounded-lg transition-all text-center cursor-pointer ${
                        settings.primaryCurrency === 'BOTH'
                          ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {isKm ? 'ទាំងពីរ' : 'Both'}
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ primaryCurrency: 'USD' })}
                      className={`py-1 rounded-lg transition-all text-center cursor-pointer ${
                        settings.primaryCurrency === 'USD'
                          ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ primaryCurrency: 'KHR' })}
                      className={`py-1 rounded-lg transition-all text-center cursor-pointer ${
                        settings.primaryCurrency === 'KHR'
                          ? 'bg-white dark:bg-[#1E293B] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      KHR (៛)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
