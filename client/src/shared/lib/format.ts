export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest.toString().padStart(2, '0')}` : `${hours} h`;
}

export function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatDay(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  );
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}
