import { format, isValid } from 'date-fns';

const MARATHI_MONTHS: { [key: string]: string } = {
  'Jan': 'जाने',
  'Feb': 'फेब्रु',
  'Mar': 'मार्च',
  'Apr': 'एप्रिल',
  'May': 'मे',
  'Jun': 'जून',
  'Jul': 'जुलै',
  'Aug': 'ऑगस्ट',
  'Sep': 'सप्टें',
  'Oct': 'ऑक्टो',
  'Nov': 'नोव्हें',
  'Dec': 'डिसें',
  'January': 'जानेवारी',
  'February': 'फेब्रुवारी',
  'March': 'मार्च',
  'April': 'एप्रिल',
  'June': 'जून',
  'July': 'जुलै',
  'August': 'ऑगस्ट',
  'September': 'सप्टेंबर',
  'October': 'ऑक्टोबर',
  'November': 'नोव्हेंबर',
  'December': 'डिसेंबर',
};

const MARATHI_DAYS: { [key: string]: string } = {
  'Mon': 'सोम',
  'Tue': 'मंगळ',
  'Wed': 'बुध',
  'Thu': 'गुरू',
  'Fri': 'शुक्र',
  'Sat': 'शनि',
  'Sun': 'रवि',
  'Monday': 'सोमवार',
  'Tuesday': 'मंगळवार',
  'Wednesday': 'बुधवार',
  'Thursday': 'गुरुवार',
  'Friday': 'शुक्रवार',
  'Saturday': 'शनिवार',
  'Sunday': 'रविवार',
};

function parseDateInput(dateInput?: string | number | Date | null): Date | null {
  if (!dateInput) return null;
  try {
    const d = typeof dateInput === 'number' || typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

/**
 * Format timestamp into user-friendly Marathi date-time string using date-fns pattern.
 * e.g., 'dd MMM yyyy, hh:mm a' -> '२२ ऑगस्ट २०२६, ०१:१५ PM'
 */
export function formatMarathiDateTime(
  dateInput?: string | number | Date | null,
  pattern: string = 'dd MMM yyyy, hh:mm a'
): string {
  const date = parseDateInput(dateInput);
  if (!date) return 'काही वेळापूर्वी';

  try {
    const rawFormatted = format(date, pattern);
    // Translate month names and day names if present in formatted output
    let result = rawFormatted;
    Object.entries(MARATHI_MONTHS).forEach(([en, mr]) => {
      result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), mr);
    });
    Object.entries(MARATHI_DAYS).forEach(([en, mr]) => {
      result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), mr);
    });
    // Localize AM / PM
    result = result.replace(/\bAM\b/g, 'सकाळी').replace(/\bPM\b/g, 'संध्याकाळी');
    return result;
  } catch {
    return formatMarathiTime(dateInput);
  }
}

/**
 * Ultra-lightweight native Marathi relative time formatter.
 * Zero lag, 0ms overhead, localized.
 */
export function formatMarathiTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'काही वेळापूर्वी';
  try {
    const date = parseDateInput(dateInput);
    if (!date) return 'काही वेळापूर्वी';
    const time = date.getTime();
    
    const diffSeconds = Math.floor((Date.now() - time) / 1000);
    if (diffSeconds < 60) return 'आत्ताच';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} मिनिटांपूर्वी`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} तासांपूर्वी`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'काल';
    if (diffDays < 30) return `${diffDays} दिवसांपूर्वी`;
    
    return date.toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });
  } catch {
    return 'काही वेळापूर्वी';
  }
}

export function formatMarathiFullDate(dateInput?: string | number | Date | null): string {
  const date = parseDateInput(dateInput);
  if (!date) return '';
  try {
    return date.toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
}

export function formatMarathiDateOnly(dateInput?: string | number | Date | null): string {
  const date = parseDateInput(dateInput);
  if (!date) return '';
  try {
    return date.toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

