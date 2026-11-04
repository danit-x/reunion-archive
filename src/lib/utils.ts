import type { EventDetails, Registration } from '../data/types';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const randomCode = (len = 4) => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
};

export const uid = (prefix = '') => `${prefix}${Date.now().toString(36)}${randomCode(3).toLowerCase()}`;

export const eventStart = (e: EventDetails) => new Date(`${e.date}T${e.startTime}:00${e.timezoneOffset}`);

export const formatDateLong = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateShort = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${String(hr).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatMoney = (n: number, currency = 'LKR') => `${currency} ${n.toLocaleString('en-US')}`;

const ROMAN: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
export const roman = (n: number) => ROMAN.reduce((acc, [v, s]) => { while (n >= v) { acc += s; n -= v; } return acc; }, '');

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

export const ticketTotal = (r: Pick<Registration, 'guests'>, e: EventDetails) => e.ticketAlumni + r.guests * e.ticketGuest;

/** Demo-only password hashing (SHA-256). NOT production authentication. */
export async function hashPassword(pw: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`tra-demo::${pw}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const isPhone = (s: string) => /^[+()\d\s-]{7,20}$/.test(s.trim()) && s.replace(/\D/g, '').length >= 9;

export function downloadCSV(filename: string, rows: Record<string, string | number | boolean | undefined>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read an image file and downscale it so it fits comfortably in localStorage. */
export function fileToDataUrl(file: File, maxSide = 1400, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    if (file.size > 12 * 1024 * 1024) return reject(new Error('Image is larger than 12 MB.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file does not look like a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const batchesFor = (e: EventDetails) => Array.from({ length: e.batchTo - e.batchFrom + 1 }, (_, i) => e.batchFrom + i);
