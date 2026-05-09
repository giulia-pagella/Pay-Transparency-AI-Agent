export function formatDateIT(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return 'Data non disponibile';
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
