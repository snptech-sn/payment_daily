import { UITheme } from '../types';

export interface ThemeConfig {
  id: UITheme;
  nameKm: string;
  nameEn: string;
  descKm: string;
  descEn: string;
  badge: string;
  previewBg: string;
  previewBorder: string;
  previewAccent: string;
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'emerald',
    nameKm: 'ត្បូងមរកត (Emerald Luxe)',
    nameEn: 'Emerald Luxe',
    descKm: 'ផ្ទៃពណ៌សស្រាល រំលេចដោយពណ៌បៃតងខ្ចីស្រស់ស្រាយ ទំនើប និងមានផាសុកភាព',
    descEn: 'Fresh mint & emerald highlights over a luminous clean surface',
    badge: '🌿 លំនាំដើម',
    previewBg: 'bg-emerald-50/70',
    previewBorder: 'border-emerald-200',
    previewAccent: 'bg-emerald-600',
  },
  {
    id: 'dark',
    nameKm: 'រាត្រីងងឹត (Midnight Obsidian)',
    nameEn: 'Midnight Dark',
    descKm: 'ផ្ទៃងងឹតរាត្រីទំនើប កាត់បន្ថយការចាំងភ្នែក សន្សំសំចៃថ្ម និងច្បាស់ស្រួលមើល',
    descEn: 'Sleek OLED obsidian surface with luminous accents and high-contrast text',
    badge: '🌙 ងងឹតទាន់សម័យ',
    previewBg: 'bg-[#0B0F19]',
    previewBorder: 'border-slate-700',
    previewAccent: 'bg-emerald-400',
  },
  {
    id: 'indigo',
    nameKm: 'សមុទ្រទំនើប (Ocean Indigo)',
    nameEn: 'Ocean Indigo',
    descKm: 'ផ្ទៃពណ៌ខៀវបែបហិរញ្ញវត្ថុទំនើប មានរបៀបរៀបរយ និងស្រស់ស្អាតបែប Fintech',
    descEn: 'Refined modern fintech canvas with cool blue-indigo surfaces',
    badge: '🌊 Fintech',
    previewBg: 'bg-indigo-50/80',
    previewBorder: 'border-indigo-200',
    previewAccent: 'bg-indigo-600',
  },
  {
    id: 'warm',
    nameKm: 'ក្រដាសកក់ក្តៅ (Warm Editorial)',
    nameEn: 'Warm Editorial',
    descKm: 'ផ្ទៃពណ៌ក្រដាសកក់ក្តៅ បែបសៀវភៅកត់ត្រា ស្រទន់និងមិនចាំងភ្នែក',
    descEn: 'Warm, cozy parchment tone with comforting earthy contrast',
    badge: '☕ កក់ក្តៅ',
    previewBg: 'bg-[#F5F1E8]',
    previewBorder: 'border-amber-200',
    previewAccent: 'bg-amber-700',
  },
];
