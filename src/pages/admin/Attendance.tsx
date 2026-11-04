import { CheckCircle2, RotateCcw, ScanLine, Search, UserX, XCircle } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useToast } from '../../components/feedback';
import { Empty } from '../../components/primitives';
import { useStore } from '../../data/store';
import type { AttendanceMark, Registration } from '../../data/types';
import { batchesFor, cx } from '../../lib/utils';
import { AdminHeader, Panel, Progress, Stat, StatusBadge } from './ui';

export default function Attendance() {
  const { data, update } = useStore();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [found, setFound] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [batch, setBatch] = useState('all');
  const [filter, setFilter] = useState<'all' | AttendanceMark>('all');
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const eligible = data.registrations.filter((r) => r.status === 'confirmed');
  const present = eligible.filter((r) => r.attendance === 'present').length;
  const absent = eligible.filter((r) => r.attendance === 'absent').length;
  const unmarked = eligible.length - present - absent;
  const presentGuests = eligible.filter((r) => r.attendance === 'present').reduce((s, r) => s + r.guests, 0);

  const mark = (r: Registration, a: AttendanceMark) => {
    update((d) => ({ ...d, registrations: d.registrations.map((x) => (x.id === r.id ? { ...x, attendance: a, checkedInAt: a === 'present' ? new Date().toISOString() : undefined } : x)) }));
    toast(a === 'present' ? `${r.fullName} checked in${r.guests ? ` with ${r.guests} guest${r.guests > 1 ? 's' : ''}` : ''}.` : a === 'absent' ? `${r.fullName} marked absent.` : `${r.fullName} reset.`, a === 'present' ? 'success' : 'info');
  };

  const lookup = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    const id = c.startsWith('TRA-') ? c : `TRA-26-${c}`;
    const r = data.registrations.find((x) => x.id === id);
    if (!r) { setFound(null); setLookupError(`No registration found for “${c}”.`); return; }
    setLookupError(''); setFound(r.id);
  };
  const foundReg = data.registrations.find((r) => r.id === found);

  const list = useMemo(() => eligible
    .filter((r) => (batch === 'all' || r.batch === Number(batch)) && (filter === 'all' || r.attendance === filter) && (!q || r.fullName.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q.toUpperCase())))
    .sort((a, b) => a.fullName.localeCompare(b.fullName)), [eligible, batch, filter, q]);

  const byBatch = batchesFor(data.event).map((b) => {
    const rs = eligible.filter((r) => r.batch === b);
    return { b, total: rs.length, present: rs.filter((r) => r.attendance === 'present').length };
  }).filter((x) => x.total);

  return (
    <>
      <AdminHeader kicker="On the day" title="Attendance">
        <span className="a-muted">Only confirmed registrations can be checked in</span>
      </AdminHeader>

      <div className="a-stats a-stats--4">
        <Stat label="Present" value={present} sub={`+ ${presentGuests} guests on site`} icon={CheckCircle2} tone="green" />
        <Stat label="Absent" value={absent} icon={UserX} tone="amber" />
        <Stat label="Not yet marked" value={unmarked} icon={ScanLine} />
        <Stat label="Check-in progress" value={`${eligible.length ? Math.round((present / eligible.length) * 100) : 0}%`} sub={<Progress value={present} max={eligible.length} label="Check-in progress" />} tone="ink" />
      </div>

      <div className="a-grid a-grid--main">
        <div className="a-stack">
          <Panel title="Check-in desk">
            <form className="a-checkin" onSubmit={lookup}>
              <label htmlFor="ci" className="field__label">Registration ID</label>
              <div className="a-checkin__row">
                <input id="ci" ref={input} className="input mono" placeholder="TRA-26-XXXX or last 4 characters" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
                <button className="btn btn--sm" disabled={!code.trim()}><Search size={15} /> Find</button>
              </div>
              {lookupError && <p className="field__error" role="alert">{lookupError}</p>}
            </form>
            {foundReg && (
              <div className={cx('a-found', `a-found--${foundReg.attendance}`)}>
                <div className="a-found__who">
                  {foundReg.photo && <img src={foundReg.photo} alt="" />}
                  <div>
                    <strong>{foundReg.fullName}</strong>
                    <span className="a-sub">{foundReg.id} · Class of {foundReg.batch} · {foundReg.guests} guest{foundReg.guests === 1 ? '' : 's'}</span>
                  </div>
                </div>
                <div className="a-found__state">Registration <StatusBadge s={foundReg.status} /> · Attendance <StatusBadge s={foundReg.attendance} /></div>
                {foundReg.status !== 'confirmed' ? (
                  <p className="field__error">This registration is {foundReg.status}. Confirm it in Registrations before checking in.</p>
                ) : (
                  <div className="a-found__actions">
                    <button className="btn btn--gold btn--sm" onClick={() => { mark(foundReg, 'present'); setCode(''); input.current?.focus(); }} disabled={foundReg.attendance === 'present'}><CheckCircle2 size={15} /> Mark present</button>
                    <button className="btn btn--line btn--sm" onClick={() => mark(foundReg, 'absent')} disabled={foundReg.attendance === 'absent'}><XCircle size={15} /> Mark absent</button>
                    {foundReg.attendance !== 'unmarked' && <button className="btn btn--line btn--sm" onClick={() => mark(foundReg, 'unmarked')}><RotateCcw size={15} /> Reset</button>}
                  </div>
                )}
              </div>
            )}
          </Panel>
          <Panel title="By batch">
            <ul className="a-batches">
              {byBatch.map((x) => (
                <li key={x.b}><span>Class of {x.b}</span><Progress value={x.present} max={x.total} label={`Class of ${x.b}`} /><span className="mono">{x.present}/{x.total}</span></li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Attendance register">
          <div className="a-filters">
            <label className="a-search"><Search size={16} /><input type="search" aria-label="Search register" placeholder="Name or ID…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <select className="select a-select" value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch"><option value="all">All batches</option>{batchesFor(data.event).map((b) => <option key={b} value={b}>Class of {b}</option>)}</select>
            <select className="select a-select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter by attendance"><option value="all">Everyone</option><option value="unmarked">Unmarked</option><option value="present">Present</option><option value="absent">Absent</option></select>
          </div>
          {list.length === 0 ? <Empty title="Nobody here" /> : (
            <ul className="a-register">
              {list.map((r) => (
                <li key={r.id} className={`is-${r.attendance}`}>
                  <div><strong>{r.fullName}</strong><span className="a-sub mono">{r.id} · {r.batch}{r.checkedInAt ? ` · in at ${new Date(r.checkedInAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}</span></div>
                  <div className="a-seg" role="group" aria-label={`Attendance for ${r.fullName}`}>
                    <button className={r.attendance === 'present' ? 'is-on is-present' : ''} aria-pressed={r.attendance === 'present'} onClick={() => mark(r, 'present')}>Present</button>
                    <button className={r.attendance === 'absent' ? 'is-on is-absent' : ''} aria-pressed={r.attendance === 'absent'} onClick={() => mark(r, 'absent')}>Absent</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
