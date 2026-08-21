/**
 * Ultra-lightweight native Marathi relative time formatter.
 * Zero external dependencies, 0ms overhead, perfectly localized.
 */
export function formatMarathiTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'काही वेळापूर्वी';
  try {
    const time = typeof dateInput === 'number' ? dateInput : new Date(dateInput).getTime();
    if (isNaN(time)) return 'काही वेळापूर्वी';
    
    const diffSeconds = Math.floor((Date.now() - time) / 1000);
    if (diffSeconds < 60) return 'आत्ताच';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} मिनिटांपूर्वी`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} तासांपूर्वी`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'काल';
    if (diffDays < 30) return `${diffDays} दिवसांपूर्वी`;
    
    return new Date(time).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' });
  } catch {
    return 'काही वेळापूर्वी';
  }
}
