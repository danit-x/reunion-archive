import { useState, type FormEvent } from 'react';
import { Field } from '../../components/primitives';
import { SECTIONS } from '../../data/seed';
import type { Dietary, EventDetails, Registration } from '../../data/types';
import { batchesFor, isEmail, isPhone } from '../../lib/utils';

export default function RegistrationForm({ reg, event, maxGuests, onSave, onCancel }: { reg: Registration; event: EventDetails; maxGuests: number; onSave: (r: Registration) => void; onCancel: () => void }) {
  const [f, setF] = useState(reg);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = <K extends keyof Registration>(k: K, v: Registration[K]) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.fullName.trim().length < 3) er.fullName = 'Name is required.';
    if (!isEmail(f.email)) er.email = 'Valid email required.';
    if (!isPhone(f.phone)) er.phone = 'Valid phone required.';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...f, fullName: f.fullName.trim(), email: f.email.trim().toLowerCase() });
  };
  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Field label="Full name" id="e-name" required error={err.fullName} className="span-2"><input id="e-name" className="input" value={f.fullName} onChange={(e) => set('fullName', e.target.value)} /></Field>
      <Field label="Email" id="e-email" required error={err.email}><input id="e-email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
      <Field label="Phone" id="e-phone" required error={err.phone}><input id="e-phone" className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
      <Field label="Batch" id="e-batch"><select id="e-batch" className="select" value={f.batch} onChange={(e) => set('batch', Number(e.target.value))}>{batchesFor(event).map((b) => <option key={b}>{b}</option>)}</select></Field>
      <Field label="Class" id="e-sec"><select id="e-sec" className="select" value={f.section} onChange={(e) => set('section', e.target.value)}>{Array.from(new Set([...SECTIONS, f.section])).map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Occupation" id="e-occ" optional><input id="e-occ" className="input" value={f.occupation ?? ''} onChange={(e) => set('occupation', e.target.value || undefined)} /></Field>
      <Field label="Guests" id="e-guests"><input id="e-guests" type="number" min={0} max={maxGuests} className="input" value={f.guests} onChange={(e) => set('guests', Math.max(0, Math.min(maxGuests, Number(e.target.value) || 0)))} /></Field>
      <Field label="Status" id="e-status"><select id="e-status" className="select" value={f.status} onChange={(e) => set('status', e.target.value as Registration['status'])}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></Field>
      <Field label="Attendance" id="e-att"><select id="e-att" className="select" value={f.attendance} onChange={(e) => set('attendance', e.target.value as Registration['attendance'])}><option value="unmarked">Unmarked</option><option value="present">Present</option><option value="absent">Absent</option></select></Field>
      <Field label="Dietary" id="e-diet"><select id="e-diet" className="select" value={f.dietary} onChange={(e) => set('dietary', e.target.value as Dietary)}>{['none', 'vegetarian', 'vegan', 'halal', 'gluten-free', 'other'].map((d) => <option key={d}>{d}</option>)}</select></Field>
      <Field label="Intent" id="e-intent"><select id="e-intent" className="select" value={f.intent} onChange={(e) => set('intent', e.target.value as Registration['intent'])}><option value="yes">Attending</option><option value="maybe">Probably</option></select></Field>
      <Field label="Special requests" id="e-req" optional className="span-2"><textarea id="e-req" className="textarea" rows={2} value={f.requests ?? ''} onChange={(e) => set('requests', e.target.value || undefined)} /></Field>
      <label className="switch span-2"><input type="checkbox" checked={f.showInDirectory} onChange={(e) => set('showInDirectory', e.target.checked)} /><span className="switch__track" />Listed in the public directory</label>
      <div className="span-2 form-actions"><button type="button" className="btn btn--line btn--sm" onClick={onCancel}>Cancel</button><button className="btn btn--gold btn--sm">Save changes</button></div>
    </form>
  );
}
