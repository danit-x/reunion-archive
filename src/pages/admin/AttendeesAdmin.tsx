import { Pencil, Search } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Modal, useToast } from '../../components/feedback';
import { Empty, Field } from '../../components/primitives';
import { useStore } from '../../data/store';
import type { Registration } from '../../data/types';
import { batchesFor, fileToDataUrl, initials } from '../../lib/utils';
import { AdminHeader, Panel, StatusBadge } from './ui';

function ProfileEditor({ reg, onSave, onCancel }: { reg: Registration; onSave: (p: Partial<Registration>) => void; onCancel: () => void }) {
  const [f, setF] = useState({ occupation: reg.occupation ?? '', city: reg.city ?? '', bio: reg.bio ?? '', photo: reg.photo ?? '' });
  const [err, setErr] = useState('');
  const submit = (e: FormEvent) => { e.preventDefault(); onSave({ occupation: f.occupation || undefined, city: f.city || undefined, bio: f.bio || undefined, photo: f.photo || undefined }); };
  return (
    <form className="form-grid" onSubmit={submit}>
      <div className="span-2 a-photo-edit">
        {f.photo ? <img src={f.photo} alt="" /> : <span className="a-avatar a-avatar--lg">{initials(reg.fullName)}</span>}
        <div className="a-photo-edit__ctl">
          <label className="btn btn--line btn--sm">Upload photo<input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF((p) => ({ ...p, photo: '' })); const url = await fileToDataUrl(file, 500, .8); setF((p) => ({ ...p, photo: url })); setErr(''); } catch (x) { setErr((x as Error).message); } }} /></label>
          {f.photo && <button type="button" className="btn btn--line btn--sm" onClick={() => setF((p) => ({ ...p, photo: '' }))}>Remove</button>}
          {err && <p className="field__error">{err}</p>}
        </div>
      </div>
      <Field label="Occupation" id="p-occ" optional><input id="p-occ" className="input" value={f.occupation} onChange={(e) => setF({ ...f, occupation: e.target.value })} /></Field>
      <Field label="City" id="p-city" optional><input id="p-city" className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
      <Field label="Profile note" id="p-bio" optional className="span-2"><textarea id="p-bio" className="textarea" rows={3} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></Field>
      <div className="span-2 form-actions"><button type="button" className="btn btn--line btn--sm" onClick={onCancel}>Cancel</button><button className="btn btn--gold btn--sm">Save profile</button></div>
    </form>
  );
}

export default function AttendeesAdmin() {
  const { data, update } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [batch, setBatch] = useState('all');
  const [vis, setVis] = useState<'all' | 'listed' | 'hidden'>('all');
  const [editing, setEditing] = useState<Registration | null>(null);
  const people = useMemo(() => data.registrations
    .filter((r) => r.status !== 'cancelled')
    .filter((r) => (!q || r.fullName.toLowerCase().includes(q.toLowerCase())) && (batch === 'all' || r.batch === Number(batch)) && (vis === 'all' || (vis === 'listed') === r.showInDirectory))
    .sort((a, b) => a.fullName.localeCompare(b.fullName)), [data.registrations, q, batch, vis]);
  const patch = (id: string, p: Partial<Registration>) => update((d) => ({ ...d, registrations: d.registrations.map((r) => (r.id === id ? { ...r, ...p } : r)) }));
  const listed = data.registrations.filter((r) => r.showInDirectory && r.status !== 'cancelled').length;

  return (
    <>
      <AdminHeader kicker="Directory" title="Attendees">
        <span className="a-muted">{listed} listed publicly</span>
      </AdminHeader>
      <Panel>
        <div className="a-filters">
          <label className="a-search"><Search size={16} /><input type="search" aria-label="Search attendees" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <select className="select a-select" value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch"><option value="all">All batches</option>{batchesFor(data.event).map((b) => <option key={b} value={b}>Class of {b}</option>)}</select>
          <select className="select a-select" value={vis} onChange={(e) => setVis(e.target.value as typeof vis)} aria-label="Filter by visibility"><option value="all">All visibility</option><option value="listed">Listed</option><option value="hidden">Hidden</option></select>
        </div>
        {people.length === 0 ? <Empty title="No attendees match" /> : (
          <ul className="a-people">
            {people.map((p) => (
              <li key={p.id} className="a-person">
                {p.photo ? <img src={p.photo} alt="" className="a-avatar" /> : <span className="a-avatar">{initials(p.fullName)}</span>}
                <div className="a-person__body">
                  <strong>{p.fullName}</strong>
                  <span className="a-sub">Class of {p.batch} · {p.section}{p.occupation ? ` · ${p.occupation}` : ''}</span>
                </div>
                <StatusBadge s={p.status} />
                <label className="switch a-person__toggle" title="Show in public directory">
                  <input type="checkbox" checked={p.showInDirectory} onChange={(e) => { patch(p.id, { showInDirectory: e.target.checked }); toast(`${p.fullName} ${e.target.checked ? 'listed in' : 'hidden from'} the directory.`); }} />
                  <span className="switch__track" /><span className="sr-only">Listed in directory</span>
                </label>
                <button className="icon-btn" onClick={() => setEditing(p)} aria-label={`Edit profile of ${p.fullName}`}><Pencil size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Directory profile · ${editing?.fullName ?? ''}`} wide>
        {editing && <ProfileEditor reg={editing} onCancel={() => setEditing(null)} onSave={(p) => { patch(editing.id, p); setEditing(null); toast('Profile saved — the public directory is updated.'); }} />}
      </Modal>
    </>
  );
}
