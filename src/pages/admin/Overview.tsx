import { ArrowRight, CalendarCheck2, ClipboardCheck, Download, Hourglass, Mail, Megaphone, Ticket, UserPlus, Users, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../data/store';
import { batchesFor, downloadCSV, formatDateShort, formatMoney, ticketTotal } from '../../lib/utils';
import { AdminHeader, Panel, Progress, Stat, StatusBadge } from './ui';
import { registrationRows } from './Registrations';

const tooltipStyle = { background: '#0d1424', border: 'none', borderRadius: 2, color: '#f4eee2', fontFamily: 'Manrope', fontSize: 12 };

export default function Overview() {
  const { data, update } = useStore();
  const regs = data.registrations;
  const active = regs.filter((r) => r.status !== 'cancelled');
  const confirmed = regs.filter((r) => r.status === 'confirmed');
  const pending = regs.filter((r) => r.status === 'pending');
  const guests = active.reduce((s, r) => s + r.guests, 0);
  const revenue = confirmed.reduce((s, r) => s + ticketTotal(r, data.event), 0);
  const projected = active.reduce((s, r) => s + ticketTotal(r, data.event), 0);
  const batches = batchesFor(data.event);
  const represented = new Set(active.map((r) => r.batch)).size;
  const headcount = active.length + guests;

  const trend = useMemo(() => {
    if (!regs.length) return [];
    const sorted = [...regs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const start = new Date(sorted[0].createdAt);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date();
    const out: { week: string; registrations: number; total: number }[] = [];
    let total = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const next = new Date(d); next.setDate(next.getDate() + 7);
      const n = sorted.filter((r) => { const t = new Date(r.createdAt); return t >= d && t < next; }).length;
      total += n;
      out.push({ week: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), registrations: n, total });
    }
    return out;
  }, [regs]);

  const byBatch = useMemo(() => batches.map((b) => ({
    batch: `’${String(b).slice(2)}`, full: b,
    confirmed: confirmed.filter((r) => r.batch === b).length,
    pending: pending.filter((r) => r.batch === b).length,
  })), [batches, confirmed, pending]);

  const recent = [...regs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const news = [...data.announcements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const unread = data.messages.filter((m) => !m.read);

  return (
    <>
      <AdminHeader kicker={`${data.event.schoolName} · ${formatDateShort(data.event.date)}`} title="Overview">
        <button className="btn btn--line btn--sm" onClick={() => downloadCSV('registrations.csv', registrationRows(regs, data.event))}><Download size={15} /> Export CSV</button>
        <Link to="/admin/attendance" className="btn btn--sm"><ClipboardCheck size={15} /> Check-in desk</Link>
      </AdminHeader>

      <div className="a-stats">
        <Stat label="Total registrations" value={regs.length} sub={`${active.length} active · ${regs.length - active.length} cancelled`} icon={Ticket} tone="ink" />
        <Stat label="Confirmed attendees" value={confirmed.length} sub={<Progress value={confirmed.length} max={active.length || 1} label="Confirmed share" />} icon={CalendarCheck2} tone="green" />
        <Stat label="Pending registrations" value={pending.length} sub={pending.length ? <Link to="/admin/registrations?status=pending" className="underline">Review now</Link> : 'All caught up'} icon={Hourglass} tone="amber" />
        <Stat label="Additional guests" value={guests} sub={`Headcount ${headcount} / ${data.registration.capacity}`} icon={Users} />
        <Stat label="Est. ticket revenue" value={<><small>{data.event.currency} </small>{revenue.toLocaleString('en-US')}</>} sub={`Projected ${formatMoney(projected, data.event.currency)}`} icon={Wallet} tone="gold" />
        <Stat label="Batch participation" value={<>{represented}<small>/{batches.length}</small></>} sub={<Progress value={represented} max={batches.length} label="Batches represented" />} icon={UserPlus} />
      </div>

      <div className="a-grid a-grid--charts">
        <Panel title="Registration trend" action={<span className="a-muted">Cumulative, by week</span>}>
          <div className="a-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c5a36c" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#c5a36c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(36,34,31,.08)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#857e73' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#857e73' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d6bb88' }} formatter={(v: number, n: string) => [v, n === 'total' ? 'Total registered' : 'New this week']} />
                <Area type="monotone" dataKey="total" stroke="#8e6d3c" strokeWidth={2} fill="url(#gold)" />
                <Area type="monotone" dataKey="registrations" stroke="#1f2b48" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Batch distribution" action={<span className="a-legend"><i className="ink" />Confirmed <i className="gold" />Pending</span>}>
          <div className="a-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBatch} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="rgba(36,34,31,.08)" vertical={false} />
                <XAxis dataKey="batch" tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#857e73' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Manrope', fill: '#857e73' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(197,163,108,.12)' }} labelFormatter={(_, p) => `Class of ${p?.[0]?.payload?.full ?? ''}`} />
                <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#1f2b48" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#c5a36c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="a-grid a-grid--main">
        <Panel title="Recent registrations" action={<Link to="/admin/registrations" className="a-link">View all <ArrowRight size={14} /></Link>}>
          <div className="a-table-wrap">
            <table className="a-table a-table--compact">
              <thead><tr><th>Name</th><th>Batch</th><th>Guests</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Name"><strong>{r.fullName}</strong><span className="a-sub mono">{r.id}</span></td>
                    <td data-label="Batch">{r.batch}</td>
                    <td data-label="Guests">{r.guests}</td>
                    <td data-label="Received">{formatDateShort(r.createdAt)}</td>
                    <td data-label="Status"><StatusBadge s={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="a-stack">
          <Panel title="Quick actions">
            <div className="a-quick">
              <Link to="/admin/announcements?new=1"><Megaphone size={18} /> New announcement</Link>
              <Link to="/admin/registrations?status=pending"><Hourglass size={18} /> Review pending</Link>
              <Link to="/admin/attendance"><ClipboardCheck size={18} /> Open check-in</Link>
              <Link to="/admin/gallery"><Ticket size={18} /> Review photos</Link>
            </div>
          </Panel>
          <Panel title="Recent announcements" action={<Link to="/admin/announcements" className="a-link">Manage <ArrowRight size={14} /></Link>}>
            <ul className="a-list">
              {news.map((a) => (
                <li key={a.id}><span className="mono a-muted">{formatDateShort(a.date)}</span><span>{a.title}{a.featured && <span className="badge badge--gold badge--plain" style={{ marginLeft: 8 }}>Featured</span>}</span></li>
              ))}
            </ul>
          </Panel>
          <Panel title={`Inbox${unread.length ? ` · ${unread.length} new` : ''}`}>
            {data.messages.length === 0 ? <p className="a-muted">No messages yet.</p> : (
              <ul className="a-list">
                {data.messages.slice(0, 3).map((m) => (
                  <li key={m.id} className={m.read ? '' : 'is-unread'}>
                    <Mail size={15} />
                    <span><strong>{m.name}</strong> — {m.subject}<span className="a-sub">{m.message}</span></span>
                    {!m.read && <button className="a-link" onClick={() => update((d) => ({ ...d, messages: d.messages.map((x) => (x.id === m.id ? { ...x, read: true } : x)) }))}>Mark read</button>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
