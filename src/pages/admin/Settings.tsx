import { Download, RotateCcw, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useConfirm, useToast } from '../../components/feedback';
import { Field } from '../../components/primitives';
import { useStore } from '../../data/store';
import { isEmail } from '../../lib/utils';
import { AdminHeader, Panel } from './ui';

export default function Settings() {
  const { data, update, resetDemo } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [school, setSchool] = useState({ schoolName: data.event.schoolName, schoolMotto: data.event.schoolMotto, batchFrom: data.event.batchFrom, batchTo: data.event.batchTo });
  const [org, setOrg] = useState(data.organizer);
  const [reg, setReg] = useState(data.registration);
  const [admin, setAdmin] = useState(data.admin);
  const [err, setErr] = useState<Record<string, string>>({});

  const save = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!school.schoolName.trim()) er.schoolName = 'School name is required.';
    if (school.batchTo < school.batchFrom) er.batchTo = 'Last batch must be after the first.';
    if (!isEmail(org.email)) er.orgEmail = 'Enter a valid email.';
    if (!isEmail(admin.email)) er.adminEmail = 'Enter a valid email.';
    if (reg.maxGuests < 0 || reg.maxGuests > 10) er.maxGuests = 'Between 0 and 10.';
    if (reg.capacity < 1) er.capacity = 'Capacity must be at least 1.';
    setErr(er);
    if (Object.keys(er).length) { toast('Please fix the highlighted fields.', 'error'); return; }
    update((d) => ({ ...d, event: { ...d.event, ...school }, organizer: org, registration: reg, admin }));
    toast('Settings saved.');
  };

  const reset = async () => {
    if (await confirm({ title: 'Reset all demo data?', message: 'Every registration, account, announcement, schedule change and uploaded photo will be replaced with the original demo data. This cannot be undone.', confirmLabel: 'Reset demo data', danger: true })) {
      resetDemo();
      toast('Demo data restored.', 'info');
      setTimeout(() => window.location.reload(), 400);
    }
  };

  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `reunion-archive-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <form onSubmit={save} noValidate>
      <AdminHeader kicker="Configure" title="Settings">
        <button className="btn btn--gold btn--sm"><Save size={15} /> Save settings</button>
      </AdminHeader>
      <div className="a-form-cols">
        <Panel title="School information">
          <div className="form-grid">
            <Field label="School name" id="st-school" required error={err.schoolName} className="span-2"><input id="st-school" className="input" value={school.schoolName} onChange={(e) => setSchool({ ...school, schoolName: e.target.value })} /></Field>
            <Field label="Motto" id="st-motto" className="span-2"><input id="st-motto" className="input" value={school.schoolMotto} onChange={(e) => setSchool({ ...school, schoolMotto: e.target.value })} /></Field>
            <Field label="First batch" id="st-from"><input id="st-from" type="number" className="input" value={school.batchFrom} onChange={(e) => setSchool({ ...school, batchFrom: Number(e.target.value) })} /></Field>
            <Field label="Last batch" id="st-to" error={err.batchTo}><input id="st-to" type="number" className="input" value={school.batchTo} onChange={(e) => setSchool({ ...school, batchTo: Number(e.target.value) })} /></Field>
          </div>
        </Panel>
        <Panel title="Registration settings">
          <div className="form-grid">
            <label className="switch span-2"><input type="checkbox" checked={reg.open} onChange={(e) => setReg({ ...reg, open: e.target.checked })} /><span className="switch__track" />Registration is open</label>
            <label className="switch span-2"><input type="checkbox" checked={reg.autoConfirm} onChange={(e) => setReg({ ...reg, autoConfirm: e.target.checked })} /><span className="switch__track" />Automatically confirm new registrations</label>
            <Field label="Registration deadline" id="st-dl"><input id="st-dl" type="date" className="input" value={reg.deadline} onChange={(e) => setReg({ ...reg, deadline: e.target.value })} /></Field>
            <Field label="Max guests per alumnus" id="st-mg" error={err.maxGuests}><input id="st-mg" type="number" min={0} max={10} className="input" value={reg.maxGuests} onChange={(e) => setReg({ ...reg, maxGuests: Number(e.target.value) })} /></Field>
            <Field label="Venue capacity (people)" id="st-cap" error={err.capacity}><input id="st-cap" type="number" min={1} className="input" value={reg.capacity} onChange={(e) => setReg({ ...reg, capacity: Number(e.target.value) })} /></Field>
          </div>
        </Panel>
        <Panel title="Organiser details">
          <div className="form-grid">
            <Field label="Organisation" id="st-on" className="span-2"><input id="st-on" className="input" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} /></Field>
            <Field label="Email" id="st-oe" error={err.orgEmail}><input id="st-oe" className="input" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} /></Field>
            <Field label="Phone" id="st-op"><input id="st-op" className="input" value={org.phone} onChange={(e) => setOrg({ ...org, phone: e.target.value })} /></Field>
            <Field label="Address" id="st-oa" className="span-2"><input id="st-oa" className="input" value={org.address} onChange={(e) => setOrg({ ...org, address: e.target.value })} /></Field>
            {(['instagram', 'facebook', 'linkedin', 'youtube'] as const).map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)} id={`st-${k}`}><input id={`st-${k}`} className="input" value={org[k]} onChange={(e) => setOrg({ ...org, [k]: e.target.value })} /></Field>
            ))}
          </div>
        </Panel>
        <Panel title="Admin profile">
          <div className="form-grid">
            <Field label="Name" id="st-an"><input id="st-an" className="input" value={admin.name} onChange={(e) => setAdmin({ ...admin, name: e.target.value })} /></Field>
            <Field label="Role" id="st-ar"><input id="st-ar" className="input" value={admin.role} onChange={(e) => setAdmin({ ...admin, role: e.target.value })} /></Field>
            <Field label="Email" id="st-ae" error={err.adminEmail} className="span-2"><input id="st-ae" className="input" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} /></Field>
          </div>
        </Panel>
        <Panel title="Data" className="a-danger-zone">
          <p className="a-muted">All demo data lives in this browser’s localStorage. Download a backup, or restore the original sample data.</p>
          <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
            <button type="button" className="btn btn--line btn--sm" onClick={backup}><Download size={15} /> Download JSON backup</button>
            <button type="button" className="btn btn--danger btn--sm" onClick={reset}><RotateCcw size={15} /> Reset demo data</button>
          </div>
        </Panel>
      </div>
    </form>
  );
}
