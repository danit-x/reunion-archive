import { Plus, Save, Trash2, Undo2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/feedback';
import { Field } from '../../components/primitives';
import { useStore } from '../../data/store';
import type { EventDetails } from '../../data/types';
import { AdminHeader, Panel } from './ui';

export default function EventAdmin() {
  const { data, update } = useStore();
  const toast = useToast();
  const [f, setF] = useState<EventDetails>(data.event);
  const [err, setErr] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(f) !== JSON.stringify(data.event);
  const set = <K extends keyof EventDetails>(k: K, v: EventDetails[K]) => setF((p) => ({ ...p, [k]: v }));
  const txt = (k: keyof EventDetails) => ({ value: f[k] as string, onChange: (e: { target: { value: string } }) => set(k, e.target.value as never) });

  const save = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.eventTitle.trim()) er.eventTitle = 'Event title is required.';
    if (!f.date) er.date = 'Choose a date.';
    if (f.endTime <= f.startTime) er.endTime = 'End time must be after the start time.';
    if (!f.venue.trim()) er.venue = 'Venue is required.';
    if (f.ticketAlumni < 0 || f.ticketGuest < 0) er.ticket = 'Prices cannot be negative.';
    setErr(er);
    if (Object.keys(er).length) { toast('Please fix the highlighted fields.', 'error'); return; }
    update((d) => ({ ...d, event: { ...f, instructions: f.instructions.filter((i) => i.trim()), faqs: f.faqs.filter((q) => q.q.trim()) } }));
    toast('Event details saved — the public site has been updated.');
  };

  return (
    <form onSubmit={save} noValidate>
      <AdminHeader kicker="Configure" title="Event details">
        {dirty && <span className="a-dirty">Unsaved changes</span>}
        <button type="button" className="btn btn--line btn--sm" onClick={() => setF(data.event)} disabled={!dirty}><Undo2 size={15} /> Discard</button>
        <button className="btn btn--gold btn--sm" disabled={!dirty}><Save size={15} /> Save changes</button>
      </AdminHeader>

      <div className="a-form-cols">
        <Panel title="The essentials">
          <div className="form-grid">
            <Field label="Event title" id="ev-title" required error={err.eventTitle} className="span-2"><input id="ev-title" className="input" {...txt('eventTitle')} /></Field>
            <Field label="Date" id="ev-date" required error={err.date}><input id="ev-date" type="date" className="input" {...txt('date')} /></Field>
            <Field label="Time zone offset" id="ev-tz" hint="e.g. +05:30 for Sri Lanka"><input id="ev-tz" className="input" {...txt('timezoneOffset')} /></Field>
            <Field label="Starts" id="ev-start"><input id="ev-start" type="time" className="input" {...txt('startTime')} /></Field>
            <Field label="Ends" id="ev-end" error={err.endTime}><input id="ev-end" type="time" className="input" {...txt('endTime')} /></Field>
            <Field label="Description" id="ev-desc" className="span-2" hint="Shown on the homepage and event page."><textarea id="ev-desc" className="textarea" rows={4} {...txt('description')} /></Field>
          </div>
        </Panel>
        <Panel title="Venue">
          <div className="form-grid">
            <Field label="Venue" id="ev-venue" required error={err.venue} className="span-2"><input id="ev-venue" className="input" {...txt('venue')} /></Field>
            <Field label="Street address" id="ev-addr" className="span-2"><input id="ev-addr" className="input" {...txt('address')} /></Field>
            <Field label="City" id="ev-city"><input id="ev-city" className="input" {...txt('city')} /></Field>
            <Field label="Country" id="ev-country"><input id="ev-country" className="input" {...txt('country')} /></Field>
            <Field label="Map search query" id="ev-map" className="span-2" hint="Used for the embedded Google Map."><input id="ev-map" className="input" {...txt('mapQuery')} /></Field>
          </div>
        </Panel>
        <Panel title="Dress code & tickets">
          <div className="form-grid">
            <Field label="Dress code" id="ev-dress"><input id="ev-dress" className="input" {...txt('dressCode')} /></Field>
            <Field label="Currency" id="ev-cur"><input id="ev-cur" className="input" {...txt('currency')} /></Field>
            <Field label="Dress code note" id="ev-dnote" className="span-2"><textarea id="ev-dnote" className="textarea" rows={2} {...txt('dressCodeNote')} /></Field>
            <Field label="Alumni ticket price" id="ev-pa" error={err.ticket}><input id="ev-pa" type="number" min={0} step={100} className="input" value={f.ticketAlumni} onChange={(e) => set('ticketAlumni', Number(e.target.value))} /></Field>
            <Field label="Guest ticket price" id="ev-pg"><input id="ev-pg" type="number" min={0} step={100} className="input" value={f.ticketGuest} onChange={(e) => set('ticketGuest', Number(e.target.value))} /></Field>
            <Field label="Ticket includes (one per line)" id="ev-inc" className="span-2"><textarea id="ev-inc" className="textarea" rows={4} value={f.ticketIncludes.join('\n')} onChange={(e) => set('ticketIncludes', e.target.value.split('\n'))} /></Field>
          </div>
        </Panel>
        <Panel title="Logistics">
          <div className="form-grid">
            <Field label="Food arrangements" id="ev-food" className="span-2"><textarea id="ev-food" className="textarea" rows={3} {...txt('food')} /></Field>
            <Field label="Transportation" id="ev-tr" className="span-2"><textarea id="ev-tr" className="textarea" rows={3} {...txt('transport')} /></Field>
            <Field label="Parking" id="ev-park" className="span-2"><textarea id="ev-park" className="textarea" rows={3} {...txt('parking')} /></Field>
          </div>
        </Panel>
        <Panel title="Important instructions" action={<button type="button" className="a-link" onClick={() => set('instructions', [...f.instructions, ''])}><Plus size={14} /> Add</button>}>
          <ol className="a-editable-list">
            {f.instructions.map((ins, i) => (
              <li key={i}>
                <span className="mono">{i + 1}</span>
                <input className="input" aria-label={`Instruction ${i + 1}`} value={ins} onChange={(e) => set('instructions', f.instructions.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" className="icon-btn icon-btn--danger" aria-label={`Remove instruction ${i + 1}`} onClick={() => set('instructions', f.instructions.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="FAQs" action={<button type="button" className="a-link" onClick={() => set('faqs', [...f.faqs, { q: '', a: '' }])}><Plus size={14} /> Add</button>}>
          <div className="a-faqs">
            {f.faqs.map((q, i) => (
              <div key={i} className="a-faq">
                <input className="input" aria-label={`Question ${i + 1}`} placeholder="Question" value={q.q} onChange={(e) => set('faqs', f.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                <textarea className="textarea" rows={2} aria-label={`Answer ${i + 1}`} placeholder="Answer" value={q.a} onChange={(e) => set('faqs', f.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
                <button type="button" className="a-link a-link--danger" onClick={() => set('faqs', f.faqs.filter((_, j) => j !== i))}><Trash2 size={14} /> Remove</button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <p className="a-muted" style={{ marginTop: '1.5rem' }}>School name, batches and organiser contacts live in <Link to="/admin/settings" className="underline">Settings</Link>.</p>
    </form>
  );
}
