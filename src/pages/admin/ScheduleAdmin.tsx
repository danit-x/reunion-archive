import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Modal, useConfirm, useToast } from '../../components/feedback';
import { Empty, Field } from '../../components/primitives';
import { useStore } from '../../data/store';
import type { ScheduleCategory, ScheduleItem } from '../../data/types';
import { formatTime, uid } from '../../lib/utils';
import { AdminHeader, Panel } from './ui';

const CATS: ScheduleCategory[] = ['Arrival', 'Ceremony', 'Community', 'Photography', 'Dining', 'Entertainment'];
const blank = (): ScheduleItem => ({ id: '', time: '09:00', endTime: '10:00', title: '', description: '', location: '', category: 'Community' });

function ItemForm({ item, onSave, onCancel }: { item: ScheduleItem; onSave: (i: ScheduleItem) => void; onCancel: () => void }) {
  const [f, setF] = useState(item);
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.title.trim()) er.title = 'Give the activity a title.';
    if (!f.time) er.time = 'Start time is required.';
    if (f.endTime && f.endTime <= f.time) er.endTime = 'End must be after start.';
    if (f.description.trim().length < 10) er.description = 'Add a short description (10+ characters).';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...f, title: f.title.trim(), description: f.description.trim(), location: f.location?.trim() || undefined });
  };
  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Field label="Activity" id="si-title" required error={err.title} className="span-2"><input id="si-title" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Starts" id="si-time" required error={err.time}><input id="si-time" type="time" className="input" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
      <Field label="Ends" id="si-end" optional error={err.endTime}><input id="si-end" type="time" className="input" value={f.endTime ?? ''} onChange={(e) => setF({ ...f, endTime: e.target.value || undefined })} /></Field>
      <Field label="Category" id="si-cat"><select id="si-cat" className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as ScheduleCategory })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Location" id="si-loc" optional><input id="si-loc" className="input" value={f.location ?? ''} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
      <Field label="Description" id="si-desc" required error={err.description} className="span-2"><textarea id="si-desc" className="textarea" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <div className="span-2 form-actions"><button type="button" className="btn btn--line btn--sm" onClick={onCancel}>Cancel</button><button className="btn btn--gold btn--sm">{item.id ? 'Save changes' : 'Add to schedule'}</button></div>
    </form>
  );
}

export default function ScheduleAdmin() {
  const { data, update } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const items = [...data.schedule].sort((a, b) => a.time.localeCompare(b.time));
  const shift = (it: ScheduleItem, mins: number) => {
    const add = (t: string) => { const [h, m] = t.split(':').map(Number); const total = Math.max(0, Math.min(23 * 60 + 59, h * 60 + m + mins)); return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; };
    update((d) => ({ ...d, schedule: d.schedule.map((s) => (s.id === it.id ? { ...s, time: add(s.time), endTime: s.endTime ? add(s.endTime) : undefined } : s)) }));
  };
  return (
    <>
      <AdminHeader kicker="Programme" title="Schedule">
        <button className="btn btn--gold btn--sm" onClick={() => setEditing(blank())}><Plus size={15} /> Add activity</button>
      </AdminHeader>
      <Panel>
        {items.length === 0 ? <Empty title="The schedule is empty" action={<button className="btn btn--sm" onClick={() => setEditing(blank())}>Add the first activity</button>} /> : (
          <ol className="a-sched">
            {items.map((s) => (
              <li key={s.id}>
                <div className="a-sched__time">
                  <strong>{formatTime(s.time)}</strong>
                  {s.endTime && <span className="a-sub">to {formatTime(s.endTime)}</span>}
                  <div className="a-sched__shift" role="group" aria-label={`Shift ${s.title}`}>
                    <button onClick={() => shift(s, -15)} aria-label="Move 15 minutes earlier">−15m</button>
                    <button onClick={() => shift(s, 15)} aria-label="Move 15 minutes later">+15m</button>
                  </div>
                </div>
                <div className="a-sched__body">
                  <span className="badge badge--gold badge--plain">{s.category}</span>
                  <strong>{s.title}</strong>
                  <p>{s.description}</p>
                  {s.location && <span className="a-sub"><MapPin size={12} /> {s.location}</span>}
                </div>
                <div className="a-actions">
                  <button className="icon-btn" onClick={() => setEditing(s)} aria-label={`Edit ${s.title}`}><Pencil size={16} /></button>
                  <button className="icon-btn icon-btn--danger" aria-label={`Delete ${s.title}`} onClick={async () => {
                    if (await confirm({ title: 'Delete activity?', message: `“${s.title}” will be removed from the public schedule.`, confirmLabel: 'Delete', danger: true })) {
                      update((d) => ({ ...d, schedule: d.schedule.filter((x) => x.id !== s.id) })); toast('Activity deleted.');
                    }
                  }}><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit activity' : 'New activity'} wide>
        {editing && <ItemForm item={editing} onCancel={() => setEditing(null)} onSave={(it) => {
          update((d) => ({ ...d, schedule: it.id ? d.schedule.map((s) => (s.id === it.id ? it : s)) : [...d.schedule, { ...it, id: uid('s_') }] }));
          toast(it.id ? 'Activity updated.' : 'Activity added to the schedule.');
          setEditing(null);
        }} />}
      </Modal>
    </>
  );
}
