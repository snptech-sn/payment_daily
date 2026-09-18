import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppSettings, Transaction } from '../types';
import { batchMigrateTransactions } from '../services/firestoreService';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  localTransactions: Transaction[];
  cloudTransactionsCount: number;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  settings,
  localTransactions,
  cloudTransactionsCount,
}) => {
  const { user, loading, error, signInWithGoogle, signOutUser, clearError } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState(false);

  if (!isOpen) return null;

  const isKm = settings.language === 'km';
  const isDark = settings.theme === 'dark';
  const isWarm = settings.theme === 'warm';

  const handleMigrate = async () => {
    if (!user || localTransactions.length === 0) return;
    setIsMigrating(true);
    try {
      await batchMigrateTransactions(user.uid, localTransactions);
      setMigrateSuccess(true);
      setTimeout(() => setMigrateSuccess(false), 3500);
    } catch (err) {
      console.error('Migration error:', err);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#151E2E] border-slate-700 text-slate-100'
            : isWarm
            ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-slate-800' : isWarm ? 'border-[#EAE3D6]' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold">
              {user
                ? isKm
                  ? 'គណនីផ្ទាល់ខ្លួន'
                  : 'User Account'
                : isKm
                ? 'ចូលគណនីគ្រប់គ្រងផ្ទាល់ខ្លួន'
                : 'Sign In to Your Account'}
            </h2>
          </div>
          <button
            onClick={() => {
              clearError();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {user ? (
            /* Signed-In State */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  isDark
                    ? 'bg-slate-800/60 border-slate-700'
                    : isWarm
                    ? 'bg-[#F7F3EB] border-[#E5DFD3]'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full border-2 border-emerald-500 shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm truncate">{user.displayName || 'User'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{isKm ? 'បានភ្ជាប់ Cloud ដោយសុវត្ថិភាព' : 'Cloud Connected'}</span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  isDark
                    ? 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                    : isWarm
                    ? 'bg-[#FAF7F2] border-[#E7E1D4] text-[#5C554E]'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-emerald-500" />
                    <span>{isKm ? 'ប្រតិបត្តិការក្នុងគណនី:' : 'Transactions on Cloud:'}</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {cloudTransactionsCount} {isKm ? 'ប្រតិបត្តិការ' : 'items'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span>{isKm ? 'សិទ្ធិគ្រប់គ្រង:' : 'Access Level:'}</span>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isKm ? 'ផ្ទាល់ខ្លួន (ដាច់ដោយឡែក)' : 'Private Account'}
                  </span>
                </div>
              </div>

              {/* Local Data Migration Card if user has offline transactions */}
              {localTransactions.length > 0 && cloudTransactionsCount === 0 && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isDark
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : isWarm
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <UploadCloud className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {isKm ? 'បញ្ចូលទិន្នន័យចាស់មកកាន់គណនីថ្មី' : 'Import local data to your account'}
                      </h4>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                        {isKm
                          ? `លោកអ្នកមានទិន្នន័យ ${localTransactions.length} ប្រតិបត្តិការលើឧបករណ៍នេះ។ ចុចខាងក្រោមដើម្បីបញ្ចូលទៅគណនី Cloud របស់អ្នក។`
                          : `You have ${localTransactions.length} offline transactions. Sync them to your account now.`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating || migrateSuccess}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {migrateSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isKm ? 'បញ្ចូលជោគជ័យ!' : 'Imported Successfully!'}</span>
                      </>
                    ) : isMigrating ? (
                      <span>{isKm ? 'កំពុងបញ្ចូល...' : 'Importing...'}</span>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{isKm ? 'បញ្ចូលទិន្នន័យឥឡូវនេះ' : 'Sync Offline Data Now'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sign Out Button */}
              <button
                id="sign-out-btn"
                onClick={async () => {
                  await signOutUser();
                  onClose();
                }}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isKm ? 'ចាកចេញពីគណនី (Sign Out)' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            /* Signed-Out State */
            <div className="space-y-4">
              <div className="text-center space-y-2 py-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base">
                  {isKm ? 'គ្រប់គ្រងហិរញ្ញវត្ថុផ្ទាល់ខ្លួនរបស់អ្នក' : 'Manage Your Own Finances'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {isKm
                    ? 'ចូលគណនីដើម្បីគ្រប់គ្រងទិន្នន័យចំណូល-ចំណាយដាច់ដោយឡែកពីគេ រក្សាទុកលើ Cloud ដោយសុវត្ថិភាព និងមិនបាត់បង់ទិន្នន័យឡើយ។'
                    : 'Sign in to manage your individual income and expenses separately with secure cloud persistence.'}
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                id="google-sign-in-btn"
                onClick={async () => {
                  await signInWithGoogle();
                }}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 border border-slate-300 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {/* Google "G" Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {loading
                    ? isKm
                      ? 'កំពុងភ្ជាប់...'
                      : 'Connecting...'
                    : isKm
                    ? 'ចូលគណនីជាមួយ Google'
                    : 'Sign in with Google'}
                </span>
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isKm
                    ? 'ទិន្នន័យរបស់អ្នកត្រូវបានការពារជាឯកជនភាព និងដាច់ដោយឡែកពីគណនីដទៃ'
                    : 'Your financial data is private and separated from other accounts'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
