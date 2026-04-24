export const GEMINI_API_KEY_REGEX = /^AIza[0-9A-Za-z_-]{35}$/;
export const DISCLAIMER =
  "Questo documento è stato generato da un tool di assessment basato su intelligenza artificiale e non costituisce consulenza legale né dichiarazione di conformità normativa. I contenuti prodotti si basano esclusivamente sui dati forniti dall'utente e sulle fonti normative integrate nel sistema. Per valutazioni vincolanti è necessario il supporto di consulenti legali e del lavoro qualificati.";

export function sanitizeFilename(name: string) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return normalized.slice(0, 80);
}
