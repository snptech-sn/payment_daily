import { Currency, PaymentMethod } from '../types';

export const KHMER_MONTHS = [
  'មករា', // January
  'កុម្ភៈ', // February
  'មីនា', // March
  'មេសា', // April
  'ឧសភា', // May
  'មិថុនា', // June
  'កក្កដា', // July
  'សីហា', // August
  'កញ្ញា', // September
  'តុលា', // October
  'វិច្ឆិកា', // November
  'ធ្នូ', // December
];

export const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const KHMER_DAYS = [
  'អាទិត្យ', // Sunday
  'ចន្ទ', // Monday
  'អង្គារ', // Tuesday
  'ពុធ', // Wednesday
  'ព្រហស្បតិ៍', // Thursday
  'សុក្រ', // Friday
  'សៅរ៍', // Saturday
];

export const ENGLISH_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Format currency amount cleanly
 */
export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    // KHR
    const rounded = Math.round(amount);
    return `${new Intl.NumberFormat('en-US').format(rounded)} ៛`;
  }
}

/**
 * Convert between USD and KHR
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRate: number = 4100
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'KHR') {
    return amount * exchangeRate;
  }
  if (from === 'KHR' && to === 'USD') {
    return amount / exchangeRate;
  }
  return amount;
}

/**
 * Format Date cleanly according to selected language
 */
export function formatDate(dateString: string, lang: 'km' | 'en'): string {
  // dateString is YYYY-MM-DD
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, monthIdx, day);
  const dayOfWeekIdx = dateObj.getDay();

  if (lang === 'km') {
    const dayName = KHMER_DAYS[dayOfWeekIdx] || '';
    const monthName = KHMER_MONTHS[monthIdx] || '';
    return `ថ្ងៃ${dayName} ទី ${day} ខែ${monthName} ឆ្នាំ ${year}`;
  } else {
    const dayName = ENGLISH_DAYS[dayOfWeekIdx] || '';
    const monthName = ENGLISH_MONTHS[monthIdx] || '';
    return `${dayName}, ${monthName} ${day}, ${year}`;
  }
}

/**
 * Format Month & Year for Period header
 */
export function formatMonthYear(year: number, month: number, lang: 'km' | 'en'): string {
  if (lang === 'km') {
    const monthName = KHMER_MONTHS[month - 1] || '';
    return `ខែ${monthName} ឆ្នាំ ${year}`;
  } else {
    const monthName = ENGLISH_MONTHS[month - 1] || '';
    return `${monthName} ${year}`;
  }
}

/**
 * Format Year for Period header
 */
export function formatYear(year: number, lang: 'km' | 'en'): string {
  if (lang === 'km') {
    return `ឆ្នាំ ${year}`;
  } else {
    return `Year ${year}`;
  }
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method: PaymentMethod, lang: 'km' | 'en'): string {
  const labels: Record<PaymentMethod, { km: string; en: string }> = {
    khqr: { km: 'KHQR', en: 'KHQR' },
    bank: { km: 'ធនាគារ ABA / Bakong', en: 'ABA / Bakong' },
    acleda: { km: 'ធនាគារ អេស៊ីលីដា', en: 'ACLEDA Bank' },
    wing: { km: 'ធនាគារ វីង', en: 'Wing Bank' },
    cash: { km: 'សាច់ប្រាក់', en: 'Cash' },
    card: { km: 'កាតធនាគារ', en: 'Card' },
    other: { km: 'ផ្សេងៗ', en: 'Other' },
  };
  return labels[method] ? labels[method][lang] : method;
}
