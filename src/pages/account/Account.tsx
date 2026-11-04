import { LogOut, Pencil, Ticket as TicketIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/feedback';
import { Eyebrow, Field, LineReveal } from '../../components/primitives';
import { SECTIONS } from '../../data/seed';
import { useStore } from '../../data/store';
import { usePageTitle } from '../../lib/hooks';
import { batchesFor, formatDateLong, formatDateShort, formatMoney, initials, ticketTotal } from '../../lib/utils';

export default function Account() {
  const { user, data, logOut, updateProfile, update } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('My account');
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({ fullName: user?.fullName ?? '', batch: String(user?.batch ?? ''), section: user?.section ?? '', occupation: user?.occupation ?? '', city: user?.city ?? '', bio: user?.bio ?? '' });
  const [err, setErr] = useState<Record<string, string>>({});

  if (!user) return <Navigate to="/account/login?next=/account" replace />;

  const regs = data.registrations.filter((r) => r.userId === user.id || r.email.toLowerCase() === user.email);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const save = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.fullName.trim().length < 3) er.fullName = 'Enter your full name.';
    if (f.bio.length > 200) er.bio = 'Keep your note under 200 characters.';
    setErr(er);
    if (Object.keys(er).length) return;
    const patch = { fullName: f.fullName.trim(), batch: Number(f.batch), section: f.section, occupation: f.occupation.trim() || undefined, city: f.city.trim() || undefined, bio: f.bio.trim() || undefined };
    updateProfile(patch);
    // keep directory listing in sync with the profile
    update((d) => ({ ...d, registrations: d.registrations.map((r) => (r.userId === user.id ? { ...r, fullName: patch.fullName, occupation: patch.occupation, city: patch.city, bio: patch.bio } : r)) }));
    setEditing(false);
    toast('Profile updated.');
  };

  return (
    <>
      <header className="account-head on-dark grain grain--dark">
        <div className="container account-head__inner">
          <div className="account-head__avatar display" aria-hidden="true">{initials(user.fullName)}</div>
          <div>
            <Eyebrow num={`Class of ${user.batch}`} className="gold-on-dark">My account</Eyebrow>
            <LineReveal as="h1" className="display account-head__title" lines={[<>{user.fullName.split(' ')[0]}’s <em className="gold-on-dark">archive.</em></>]} />
          </div>
          <button className="btn btn--ghost btn--sm account-head__logout" onClick={() => { logOut(); toast('You have been logged out.', 'info'); navigate('/'); }}><LogOut size={15} /> Log out</button>
        </div>
      </header>

      <section className="section on-paper grain">
        <div className="container account">
          <div className="account__regs">
            <h2 className="h2">My registration</h2>
            {regs.length === 0 ? (
              <div className="account__none">
                <p className="ui">You haven’t registered for {data.event.eventTitle} yet.</p>
                <Link to="/register" className="btn btn--gold">Reserve your place</Link>
              </div>
            ) : regs.map((r) => (
              <article key={r.id} className="reg-card">
                <div className="reg-card__top">
                  <span className="mono">{r.id}</span>
                  <span className={`badge badge--${r.status}`}>{r.status}</span>
                </div>
                <p className="h3">{data.event.eventTitle}</p>
                <dl className="reg-card__dl ui">
                  <div><dt>Date</dt><dd>{formatDateLong(data.event.date)}</dd></div>
                  <div><dt>Registered</dt><dd>{formatDateShort(r.createdAt)}</dd></div>
                  <div><dt>Guests</dt><dd>{r.guests}</dd></div>
                  <div><dt>Amount due</dt><dd>{formatMoney(ticketTotal(r, data.event), data.event.currency)}</dd></div>
                  <div><dt>Attendance</dt><dd>{r.intent === 'yes' ? 'Attending' : 'Probably attending'}</dd></div>
                  <div><dt>Check-in</dt><dd><span className={`badge badge--${r.attendance}`}>{r.attendance}</span></dd></div>
                </dl>
                <div className="reg-card__steps" aria-label="Registration status">
                  {['Submitted', 'Confirmed', 'Checked in'].map((step, i) => {
                    const done = i === 0 || (i === 1 && r.status === 'confirmed') || (i === 2 && r.attendance === 'present') || (i === 1 && r.attendance === 'present');
                    return <span key={step} className={done ? 'is-done' : ''}><i />{step}</span>;
                  })}
                </div>
                <Link to={`/ticket/${r.id}`} className="btn btn--sm"><TicketIcon size={15} /> View ticket</Link>
              </article>
            ))}
          </div>

          <div className="account__profile">
            <div className="account__profile-head">
              <h2 className="h2">Profile</h2>
              {!editing && <button className="btn btn--line btn--sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>}
            </div>
            {editing ? (
              <form className="form-grid" onSubmit={save} noValidate>
                <Field label="Full name" id="a-name" required error={err.fullName} className="span-2"><input id="a-name" className="input" value={f.fullName} onChange={set('fullName')} /></Field>
                <Field label="Batch" id="a-batch"><select id="a-batch" className="select" value={f.batch} onChange={set('batch')}>{batchesFor(data.event).map((b) => <option key={b}>{b}</option>)}</select></Field>
                <Field label="Class" id="a-sec"><select id="a-sec" className="select" value={f.section} onChange={set('section')}>{SECTIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Occupation" id="a-occ" optional><input id="a-occ" className="input" value={f.occupation} onChange={set('occupation')} /></Field>
                <Field label="City" id="a-city" optional><input id="a-city" className="input" value={f.city} onChange={set('city')} /></Field>
                <Field label="A note for classmates" id="a-bio" optional error={err.bio} hint={`${f.bio.length}/200`} className="span-2"><textarea id="a-bio" className="textarea" rows={3} value={f.bio} onChange={set('bio')} /></Field>
                <div className="span-2 form-actions"><button type="button" className="btn btn--line" onClick={() => setEditing(false)}>Cancel</button><button className="btn btn--gold">Save changes</button></div>
              </form>
            ) : (
              <dl className="profile-dl">
                <div><dt className="label muted">Name</dt><dd>{user.fullName}</dd></div>
                <div><dt className="label muted">Email</dt><dd>{user.email} <span className="mono muted">(private)</span></dd></div>
                <div><dt className="label muted">Batch</dt><dd>Class of {user.batch}</dd></div>
                <div><dt className="label muted">Class</dt><dd>{user.section}</dd></div>
                <div><dt className="label muted">Occupation</dt><dd>{user.occupation || '—'}</dd></div>
                <div><dt className="label muted">City</dt><dd>{user.city || '—'}</dd></div>
                <div className="span-2"><dt className="label muted">Note</dt><dd className="serif-em">{user.bio ? `“${user.bio}”` : '—'}</dd></div>
              </dl>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
