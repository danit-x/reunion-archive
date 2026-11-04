import type { EventDetails, Registration } from '../data/types';
import { formatDateLong, formatMoney, formatTime, ticketTotal } from '../lib/utils';

/** Deterministic check-in matrix generated from the registration ID. */
export function codeMatrix(id: string, n = 17) {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  const cells: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd() > 0.52));
  const finder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      const edge = i === 0 || i === 6 || j === 0 || j === 6;
      const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      cells[r + i][c + j] = edge || core;
    }
    for (let i = -1; i <= 7; i++) for (const [a, b] of [[r - 1, c + i], [r + 7, c + i], [r + i, c - 1], [r + i, c + 7]]) if (cells[a]?.[b] !== undefined) cells[a][b] = false;
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  return cells;
}

export function CheckInCode({ id, size = 112 }: { id: string; size?: number }) {
  const m = codeMatrix(id);
  const n = m.length;
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} role="img" aria-label={`Check-in code for ${id}`} shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fbf8f2" />
      {m.flatMap((row, r) => row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0d1424" /> : null)))}
    </svg>
  );
}

export default function Ticket({ reg, event, schoolName }: { reg: Registration; event: EventDetails; schoolName: string }) {
  const total = ticketTotal(reg, event);
  return (
    <article className="ticket" aria-label={`Archive pass for ${reg.fullName}`}>
      <div className="ticket__main">
        <div className="ticket__head">
          <span className="label">{schoolName}</span>
          <span className="mono">Archive Pass · {reg.status === 'confirmed' ? 'Confirmed' : reg.status === 'pending' ? 'Awaiting confirmation' : 'Cancelled'}</span>
        </div>
        <p className="ticket__event display">The Grand <em>Reunion</em></p>
        <p className="ticket__admit mono">Admit {1 + reg.guests} · {reg.guests ? `Alumnus + ${reg.guests} guest${reg.guests > 1 ? 's' : ''}` : 'Alumnus'}</p>
        <div className="ticket__name">
          <span className="label">Presented to</span>
          <span className="display">{reg.fullName}</span>
        </div>
        <dl className="ticket__grid">
          <div><dt className="label">Batch</dt><dd>Class of {reg.batch}</dd></div>
          <div><dt className="label">Class</dt><dd>{reg.section}</dd></div>
          <div><dt className="label">Date</dt><dd>{formatDateLong(event.date)}</dd></div>
          <div><dt className="label">Doors</dt><dd>{formatTime(event.startTime)}</dd></div>
          <div className="span-2"><dt className="label">Venue</dt><dd>{event.venue}, {event.city}</dd></div>
          <div><dt className="label">Amount</dt><dd>{formatMoney(total, event.currency)}</dd></div>
          <div><dt className="label">Dietary</dt><dd style={{ textTransform: 'capitalize' }}>{reg.dietary === 'none' ? 'No preference' : reg.dietary}</dd></div>
        </dl>
      </div>
      <div className="ticket__stub">
        <span className="ticket__notch ticket__notch--top" aria-hidden="true" />
        <span className="ticket__notch ticket__notch--bottom" aria-hidden="true" />
        <CheckInCode id={reg.id} />
        <span className="label">Registration ID</span>
        <span className="ticket__id mono">{reg.id}</span>
        <span className="ticket__seal display" aria-hidden="true">RA</span>
      </div>
    </article>
  );
}
