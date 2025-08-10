export function detectIntent(text) {
  if (!text) return "SMALLTALK";
  const t = text.toLowerCase();
  if (/(programare|întâlnire|meeting|program)/.test(t)) return "APPOINTMENT";
  if (/(comand[aă]|plasez|vânzare|cumpăr)/.test(t)) return "ORDER";
  if (/(ofert[aă]|preț|deviz|cost)/.test(t)) return "QUOTE";
  return "SMALLTALK";
}

export function extractEntities(text) {
  if (!text) return {};
  const out = {};
  // naive email
  const email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  if (email) out.email = email[0];
  // naive date time (examples like '12 septembrie ora 10' or 'marti la 14:30')
  const dt = text.match(/(\d{1,2}\s*(ian|feb|mart|mar|apr|mai|iun|iul|aug|sep|sept|oct|noi|dec)[a-z]*\s*(la|ora)\s*\d{1,2}[:.]?\d{0,2})|(luni|marti|miercuri|joi|vineri|sâmbătă|duminică)\s*(la|ora)\s*\d{1,2}[:.]?\d{0,2}/i);
  if (dt) out.datetime = dt[0];
  // name & company placeholders to be refined later
  return out;
}
