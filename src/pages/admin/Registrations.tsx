import { Download, Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Modal, useConfirm, useToast } from '../../components/feedback';
import { Empty } from '../../components/primitives';
import { useStore } from '../../data/store';
import type { EventDetails, Registration, RegistrationStatus } from '../../data/types';
import { batchesFor, downloadCSV, formatDateShort, formatMoney, ticketTotal } from '../../lib/utils';
import RegistrationForm from './RegistrationForm';
import { AdminHeader, Panel, StatusBadge } from './ui';

export const registrationRows = (regs: Registration[], e: EventDetails) => regs.map((r) => ({
  id: r.id, name: r.fullName, email: r.email, phone: r.phone, batch: r.batch, class: r.section, occupation: r.occupation ?? '',
  intent: r.intent, guests: r.guests, dietary: r.dietary, requests: r.requests ?? '', status: r.status, attendance: r.attendance,
  amount: ticketTotal(r, e), registered: r.createdAt, in_directory: r.showInDirectory,
}));

export default function Registrations() {
  const { data, update } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [batch, setBatch] = useState('all');
  const status = (params.get('status') ?? 'all') as RegistrationStatus | 'all';
  const [viewing, setViewing] = useState<Registration | null>(null);
  const [editing, setEditing] = useState<Registration | null>(null);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return [...data.registrations]
      .filter((r) => (!n || r.fullName.toLowerCase().includes(n) || r.id.toLowerCase().includes(n) || r.email.includes(n)) && (batch === 'all' || r.batch === Number(batch)) && (status === 'all' || r.status === status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data.registrations, q, batch, status]);

  const setStatus = (s: string) => { const p = new URLSearchParams(params); if (s === 'all') p.delete('status'); else p.set('status', s); setParams(p, { replace: true }); };
  const patch = (id: string, changes: Partial<Registration>) => update((d) => ({ ...d, registrations: d.registrations.map((r) => (r.id === id ? { ...r, ...changes } : r)) }));
  const remove = async (r: Registration) => {
    if (await confirm({ title: 'Delete registration?', message: `This permanently removes ${r.fullName}’s registration (${r.id}) and their directory listing. This cannot be undone.`, confirmLabel: 'Delete', danger: true })) {
      update((d) => ({ ...d, registrations: d.registrations.filter((x) => x.id !== r.id) }));
      setViewing(null);
      toast(`Registration ${r.id} deleted.`);
    }
  };
  const counts = { all: data.registrations.length, pending: 0, confirmed: 0, cancelled: 0 } as Record<string, number>;
  data.registrations.forEach((r) => counts[r.status]++);

  return (
    <>
      <AdminHeader kicker="Manage" title="Registrations">
        <button className="btn btn--line btn--sm" onClick={() => { downloadCSV(`registrations-${status}.csv`, registrationRows(list, data.event)); toast(`Exported ${list.length} registrations.`); }} disabled={!list.length}><Download size={15} /> Export CSV ({list.length})</button>
      </AdminHeader>

      <div className="a-tabs" role="tablist" aria-label="Filter by status">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((s) => (
          <button key={s} role="tab" aria-selected={status === s} className={status === s ? 'is-active' : ''} onClick={() => setStatus(s)}>{s} <span>{counts[s]}</span></button>
        ))}
      </div>

      <Panel>
        <div className="a-filters">
          <label className="a-search"><Search size={16} /><span className="sr-only">Search</span><input type="search" placeholder="Search name, email or ID…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <select className="select a-select" value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch">
            <option value="all">All batches</option>
            {batchesFor(data.event).map((b) => <option key={b} value={b}>Class of {b}</option>)}
          </select>
        </div>
        {list.length === 0 ? <Empty title="No registrations found">Try clearing your search or filters.</Empty> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Registrant</th><th>Batch / Class</th><th>Guests</th><th>Amount</th><th>Received</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Registrant"><button className="a-name" onClick={() => setViewing(r)}>{r.fullName}</button><span className="a-sub mono">{r.id}</span></td>
                    <td data-label="Batch / Class">{r.batch}<span className="a-sub">{r.section}</span></td>
                    <td data-label="Guests">{r.guests}</td>
                    <td data-label="Amount">{formatMoney(ticketTotal(r, data.event), data.event.currency)}</td>
                    <td data-label="Received">{formatDateShort(r.createdAt)}</td>
                    <td data-label="Status">
                      <select className={`a-status a-status--${r.status}`} value={r.status} aria-label={`Status for ${r.fullName}`} onChange={(e) => { patch(r.id, { status: e.target.value as RegistrationStatus }); toast(`${r.fullName} marked ${e.target.value}.`); }}>
                        <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="a-actions">
                      <button className="icon-btn" onClick={() => setViewing(r)} aria-label={`View ${r.fullName}`}><Eye size={16} /></button>
                      <button className="icon-btn" onClick={() => setEditing(r)} aria-label={`Edit ${r.fullName}`}><Pencil size={16} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => remove(r)} aria-label={`Delete ${r.fullName}`}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Registration details" wide
        footer={viewing && <>
          <button className="btn btn--danger btn--sm" onClick={() => remove(viewing)}><Trash2 size={14} /> Delete</button>
          <Link to={`/ticket/${viewing.id}`} target="_blank" className="btn btn--line btn--sm">Open ticket</Link>
          <button className="btn btn--gold btn--sm" onClick={() => { setEditing(viewing); setViewing(null); }}><Pencil size={14} /> Edit</button>
        </>}>
        {viewing && (
          <div className="a-detail">
            <div className="a-detail__head">
              {viewing.photo && <img src={viewing.photo} alt="" />}
              <div><p className="a-title" style={{ fontSize: '2rem' }}>{viewing.fullName}</p><p className="mono a-muted">{viewing.id}</p></div>
              <StatusBadge s={viewing.status} />
            </div>
            <dl className="a-dl">
              {[
                ['Email', viewing.email], ['Phone', viewing.phone], ['Batch', viewing.batch], ['Class', viewing.section], ['Occupation', viewing.occupation ?? '—'],
                ['Attendance intent', viewing.intent === 'yes' ? 'Attending' : 'Probably'], ['Guests', viewing.guests], ['Dietary', viewing.dietary],
                ['Amount due', formatMoney(ticketTotal(viewing, data.event), data.event.currency)], ['Check-in', viewing.attendance], ['Registered', new Date(viewing.createdAt).toLocaleString('en-GB')],
                ['Directory', viewing.showInDirectory ? 'Listed' : 'Hidden'], ['Requests', viewing.requests ?? '—'],
              ].map(([k, v]) => <div key={k as string}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.id ?? ''}`} wide>
        {editing && <RegistrationForm reg={editing} event={data.event} maxGuests={data.registration.maxGuests} onCancel={() => setEditing(null)} onSave={(r) => { patch(r.id, r); setEditing(null); toast('Registration updated.'); }} />}
      </Modal>
    </>
  );
}
