import React from 'react';
import { X, Check, Palette, Sparkles, Moon, Sun, Compass } from 'lucide-react';
import { AppSettings, UITheme } from '../types';
import { THEMES_LIST } from '../utils/theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSelectTheme: (theme: UITheme) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const isKm = settings.language === 'km';
  const currentTheme = settings.theme || 'emerald';
  const isDark = currentTheme === 'dark';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden my-6 transition-all ${
          isDark
            ? 'bg-[#151E2E] border-slate-700 text-slate-100'
            : currentTheme === 'warm'
            ? 'bg-[#FFFEFC] border-[#E7E1D4] text-[#2C2825]'
            : 'bg-white border-slate-100 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4.5 border-b flex items-center justify-between ${
            isDark
              ? 'border-slate-800 bg-[#0F172A]/70'
              : currentTheme === 'warm'
              ? 'border-[#E7E1D4] bg-[#F7F4EE]/70'
              : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isKm ? 'ប្តូរផ្ទៃ UI & រូបរាង' : 'Change UI Surface & Theme'}
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {isKm
                  ? 'ជ្រើសរើសស្ទីលផ្ទៃខាងក្រោយ និងពណ៌ដែលអ្នកពេញចិត្ត'
                  : 'Customize your canvas appearance and visual comfort'}
              </p>
            </div>
          </div>
          <button
            id="close-theme-modal-btn"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="p-6 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {THEMES_LIST.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`group relative text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 ring-4 ring-emerald-500/15 shadow-md'
                      : isDark
                      ? 'border-slate-800 hover:border-slate-700 bg-[#0F172A]/50'
                      : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {/* Top Preview Palette & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Visual miniature mockup */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-white/5 border-slate-300/40">
                      <div
                        className={`w-4 h-4 rounded-full ${theme.previewAccent}`}
                      />
                      <div className="w-8 h-2 rounded-full bg-slate-400/40" />
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {theme.badge}
                    </span>
                  </div>

                  {/* Theme Info */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold">
                        {isKm ? theme.nameKm : theme.nameEn}
                      </h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {isKm ? theme.descKm : theme.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Helpful Tip */}
          <div
            className={`p-3.5 rounded-2xl flex items-start gap-3 text-xs leading-relaxed ${
              isDark
                ? 'bg-slate-800/60 border border-slate-700/60 text-slate-300'
                : 'bg-emerald-50/60 border border-emerald-100 text-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">
                {isKm ? 'ចំណាំ:' : 'Tip:'}
              </span>{' '}
              {isKm
                ? 'ផ្ទៃ UI ថ្មីដែលបានជ្រើសរើសនឹងត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ។ អ្នកក៏អាចប្តូរផ្ទៃ UI យ៉ាងរហ័សពីរបារផ្នែកខាងលើបានគ្រប់ពេល។'
                : 'Your selected UI theme is preserved across sessions. You can also toggle themes directly from the header anytime.'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-end ${
            isDark
              ? 'border-slate-800 bg-[#0F172A]/50'
              : currentTheme === 'warm'
              ? 'border-[#E7E1D4] bg-[#F7F4EE]/50'
              : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <button
            id="done-theme-modal-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            {isKm ? 'យល់ព្រម & រួចរាល់' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
