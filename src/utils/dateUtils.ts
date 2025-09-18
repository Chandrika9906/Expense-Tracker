export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

export function getCurrentMonth(): string {
  return getMonthName(new Date().getMonth());
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}