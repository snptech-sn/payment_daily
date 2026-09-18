import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'food',
    nameKm: 'ម្ហូបអាហារ & ភេសជ្ជៈ',
    nameEn: 'Food & Dining',
    type: 'expense',
    icon: 'Utensils',
    color: '#ea580c', // orange-600
    bgColor: '#ffedd5', // orange-100
  },
  {
    id: 'transport',
    nameKm: 'ការធ្វើដំណើរ & សាំង',
    nameEn: 'Transportation',
    type: 'expense',
    icon: 'Car',
    color: '#0284c7', // sky-600
    bgColor: '#e0f2fe', // sky-100
  },
  {
    id: 'housing',
    nameKm: 'ថ្លៃផ្ទះ & បន្ទប់',
    nameEn: 'Housing & Rent',
    type: 'expense',
    icon: 'Home',
    color: '#4f46e5', // indigo-600
    bgColor: '#e0e7ff', // indigo-100
  },
  {
    id: 'utilities',
    nameKm: 'ទឹកភ្លើង & អ៊ីនធឺណិត',
    nameEn: 'Bills & Utilities',
    type: 'expense',
    icon: 'Zap',
    color: '#ca8a04', // yellow-600
    bgColor: '#fef9c3', // yellow-100
  },
  {
    id: 'shopping',
    nameKm: 'ទិញទំនិញ & សម្លៀកបំពាក់',
    nameEn: 'Shopping',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#db2777', // pink-600
    bgColor: '#fce7f3', // pink-100
  },
  {
    id: 'health',
    nameKm: 'សុខភាព & ថ្នាំពេទ្យ',
    nameEn: 'Healthcare',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#e11d48', // rose-600
    bgColor: '#ffe4e6', // rose-100
  },
  {
    id: 'entertainment',
    nameKm: 'ការកម្សាន្ត & ដំណើរកម្សាន្ត',
    nameEn: 'Entertainment',
    type: 'expense',
    icon: 'Gamepad2',
    color: '#9333ea', // purple-600
    bgColor: '#f3e8ff', // purple-100
  },
  {
    id: 'education',
    nameKm: 'ការសិក្សា & សៀវភៅ',
    nameEn: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#059669', // emerald-600
    bgColor: '#d1fae5', // emerald-100
  },
  {
    id: 'family',
    nameKm: 'គ្រួសារ & ផ្ទាល់ខ្លួន',
    nameEn: 'Family & Personal',
    type: 'expense',
    icon: 'Users',
    color: '#0d9488', // teal-600
    bgColor: '#ccfbf1', // teal-100
  },
  {
    id: 'other_expense',
    nameKm: 'ចំណាយផ្សេងៗ',
    nameEn: 'Other Expense',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b', // slate-600
    bgColor: '#f1f5f9', // slate-100
  },

  // Income Categories
  {
    id: 'salary',
    nameKm: 'ប្រាក់ខែ / ប្រាក់បៀវត្សរ៍',
    nameEn: 'Salary & Wage',
    type: 'income',
    icon: 'Briefcase',
    color: '#16a34a', // green-600
    bgColor: '#dcfce7', // green-100
  },
  {
    id: 'business',
    nameKm: 'អាជីវកម្ម & លក់ដូរ',
    nameEn: 'Business & Sales',
    type: 'income',
    icon: 'Store',
    color: '#0891b2', // cyan-600
    bgColor: '#cffafe', // cyan-100
  },
  {
    id: 'freelance',
    nameKm: 'ការងារក្រៅម៉ោង (Freelance)',
    nameEn: 'Freelance & Gig',
    type: 'income',
    icon: 'Laptop',
    color: '#7c3aed', // violet-600
    bgColor: '#ede9fe', // violet-100
  },
  {
    id: 'investment',
    nameKm: 'ការវិនិយោគ & ការប្រាក់',
    nameEn: 'Investments',
    type: 'income',
    icon: 'TrendingUp',
    color: '#2563eb', // blue-600
    bgColor: '#dbeafe', // blue-100
  },
  {
    id: 'gift',
    nameKm: 'អំណោយ & ប្រាក់ឧបត្ថម្ភ',
    nameEn: 'Gift & Bonus',
    type: 'income',
    icon: 'Gift',
    color: '#d97706', // amber-600
    bgColor: '#fef3c7', // amber-100
  },
  {
    id: 'other_income',
    nameKm: 'ចំណូលផ្សេងៗ',
    nameEn: 'Other Income',
    type: 'income',
    icon: 'PlusCircle',
    color: '#059669', // emerald-600
    bgColor: '#d1fae5', // emerald-100
  },
];
