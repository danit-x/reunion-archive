import type { EventDetails, Registration } from '../data/types';
import { codeMatrix } from '../components/Ticket';
import { formatDateLong, formatMoney, formatTime, ticketTotal } from './utils';

/** Draws the archive pass as a vector PDF with jsPDF (loaded on demand). */
export async function downloadTicketPdf(reg: Registration, e: EventDetails, schoolName: string) {
  const { jsPDF } = await import('jspdf');
  const W = 210, H = 99; // DL landscape, mm
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
  const ink: [number, number, number] = [13, 20, 36];
  const gold: [number, number, number] = [176, 139, 82];
  const ivory: [number, number, number] = [244, 238, 226];
  const stone: [number, number, number] = [100, 94, 85];

  // Paper
  doc.setFillColor(...ivory); doc.rect(0, 0, W, H, 'F');
  // Frames
  doc.setDrawColor(...gold); doc.setLineWidth(0.5); doc.rect(5, 5, W - 10, H - 10);
  doc.setLineWidth(0.2); doc.rect(7, 7, W - 14, H - 14);

  // Stub
  const stubX = 152;
  doc.setFillColor(...ink); doc.rect(stubX, 5, W - 5 - stubX, H - 10, 'F');
  doc.setLineDashPattern([1, 1.2], 0); doc.setDrawColor(...gold); doc.line(stubX, 7, stubX, H - 7); doc.setLineDashPattern([], 0);

  // Header
  doc.setTextColor(...gold); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
  doc.text(schoolName.toUpperCase(), 14, 16, { charSpace: 0.8 });
  doc.setFont('courier', 'normal'); doc.setTextColor(...stone); doc.setFontSize(6.5);
  doc.text(`ARCHIVE PASS · ${reg.status.toUpperCase()}`, stubX - 6, 16, { align: 'right' });

  // Title
  doc.setTextColor(...ink); doc.setFont('times', 'normal'); doc.setFontSize(26);
  doc.text('The Grand', 14, 29);
  doc.setFont('times', 'italic'); doc.setTextColor(...gold);
  doc.text('Reunion', 14 + doc.getTextWidth('The Grand '), 29);
  doc.setFont('courier', 'normal'); doc.setFontSize(7); doc.setTextColor(...stone);
  doc.text(`ADMIT ${1 + reg.guests} · ${reg.guests ? `ALUMNUS + ${reg.guests} GUEST${reg.guests > 1 ? 'S' : ''}` : 'ALUMNUS'}`, 14, 35);

  // Name
  doc.setDrawColor(...gold); doc.setLineWidth(0.2); doc.line(14, 39, stubX - 8, 39);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(...stone);
  doc.text('PRESENTED TO', 14, 44, { charSpace: 0.6 });
  doc.setFont('times', 'normal'); doc.setFontSize(19); doc.setTextColor(...ink);
  doc.text(reg.fullName, 14, 52, { maxWidth: stubX - 24 });
  doc.line(14, 56, stubX - 8, 56);

  // Grid
  const cells: [string, string][] = [
    ['BATCH', `Class of ${reg.batch}`], ['CLASS', reg.section], ['DOORS', formatTime(e.startTime)],
    ['DATE', formatDateLong(e.date)], ['AMOUNT', formatMoney(ticketTotal(reg, e), e.currency)], ['DIETARY', reg.dietary === 'none' ? 'No preference' : reg.dietary],
  ];
  const colW = (stubX - 22) / 3;
  cells.forEach(([k, v], i) => {
    const x = 14 + (i % 3) * colW; const y = 63 + Math.floor(i / 3) * 12;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(...stone); doc.text(k, x, y, { charSpace: 0.6 });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...ink); doc.text(v, x, y + 4.5, { maxWidth: colW - 3 });
  });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(...stone); doc.text('VENUE', 14, 88, { charSpace: 0.6 });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...ink); doc.text(`${e.venue}, ${e.city}, ${e.country}`, 28, 88);

  // Check-in code
  const m = codeMatrix(reg.id); const n = m.length; const size = 30; const cell = size / n;
  const cx = stubX + (W - 5 - stubX - size) / 2; const cy = 16;
  doc.setFillColor(...ivory); doc.rect(cx - 1.5, cy - 1.5, size + 3, size + 3, 'F');
  doc.setFillColor(...ink);
  m.forEach((row, r) => row.forEach((on, c) => on && doc.rect(cx + c * cell, cy + r * cell, cell + 0.02, cell + 0.02, 'F')));
  const mid = stubX + (W - 5 - stubX) / 2;
  doc.setTextColor(...gold); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5);
  doc.text('REGISTRATION ID', mid, 58, { align: 'center', charSpace: 0.6 });
  doc.setTextColor(...ivory); doc.setFont('courier', 'bold'); doc.setFontSize(11);
  doc.text(reg.id, mid, 65, { align: 'center' });
  doc.setFont('times', 'italic'); doc.setFontSize(22); doc.setTextColor(...gold);
  doc.text('RA', mid, 84, { align: 'center' });

  doc.save(`Reunion-Archive-Pass-${reg.id}.pdf`);
}

/** Creates an .ics calendar file for the event. */
export function downloadIcs(e: EventDetails, reg?: Registration) {
  const toUtc = (time: string) => new Date(`${e.date}T${time}:00${e.timezoneOffset}`).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Reunion Archive//EN', 'BEGIN:VEVENT',
    `UID:${reg?.id ?? 'reunion'}@reunion-archive`, `DTSTAMP:${toUtc('00:00')}`,
    `DTSTART:${toUtc(e.startTime)}`, `DTEND:${toUtc(e.endTime)}`,
    `SUMMARY:${e.eventTitle}`, `LOCATION:${e.venue}\\, ${e.city}\\, ${e.country}`,
    `DESCRIPTION:${reg ? `Registration ID ${reg.id}. ` : ''}Bring your archive pass.`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = 'grand-reunion-2026.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
