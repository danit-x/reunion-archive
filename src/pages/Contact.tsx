import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useToast } from '../components/feedback';
import { Eyebrow, Field, PageHeader, Reveal } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import { usePageTitle } from '../lib/hooks';
import { isEmail, uid } from '../lib/utils';

export default function Contact() {
  const { data, update, user } = useStore();
  const toast = useToast();
  usePageTitle('Contact');
  const o = data.organizer;
  const [form, setForm] = useState({ name: user?.fullName ?? '', email: user?.email ?? '', subject: 'General question', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (state === 'sending') return;
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Please tell us your name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email address so we can reply.';
    if (form.message.trim().length < 10) e.message = 'Your message should be at least 10 characters.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setState('sending');
    await new Promise((r) => setTimeout(r, 900));
    update((d) => ({ ...d, messages: [{ id: uid('m_'), ...form, createdAt: new Date().toISOString(), read: false }, ...d.messages] }));
    setState('sent');
    toast('Message delivered to the organising committee.');
  };

  return (
    <>
      <PageHeader num="VIII" kicker="Contact" title={[<>Write to</>, <><em className="gold-on-dark">the committee.</em></>]} image={unsplash(PHOTO.books, 1800)}
        intro="Questions about tickets, guests, access or volunteering — we read every message." />
      <section className="section on-paper grain">
        <div className="container contact">
          <div className="contact__info">
            <Eyebrow num="01">Organisers</Eyebrow>
            <p className="h2">{o.name}</p>
            <ul className="contact__list ui">
              <li><Mail size={18} /><a href={`mailto:${o.email}`}>{o.email}</a></li>
              <li><Phone size={18} /><a href={`tel:${o.phone.replace(/\s/g, '')}`}>{o.phone}</a></li>
              <li><MapPin size={18} /><span>{o.address}</span></li>
            </ul>
            <p className="ui muted">Office hours: weekdays 4 — 7 p.m., Saturdays 9 a.m. — 1 p.m.</p>
          </div>
          <Reveal className="contact__form-wrap">
            {state === 'sent' ? (
              <div className="contact__sent">
                <CheckCircle2 size={36} className="gold" />
                <p className="h2">Thank you, <em>{form.name.split(' ')[0]}.</em></p>
                <p className="ui">Your message is with the committee. We usually reply within two working days.</p>
                <button className="btn btn--line" onClick={() => { setForm((f) => ({ ...f, message: '' })); setState('idle'); }}>Send another message</button>
              </div>
            ) : (
              <form className="form-grid" onSubmit={submit} noValidate>
                <Field label="Your name" id="c-name" required error={errors.name}><input id="c-name" className="input" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} /></Field>
                <Field label="Email address" id="c-email" required error={errors.email}><input id="c-email" type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} /></Field>
                <Field label="Subject" id="c-subj" className="span-2">
                  <select id="c-subj" className="select" value={form.subject} onChange={set('subject')}>
                    {['General question', 'Tickets & payment', 'Guests', 'Accessibility', 'Volunteering', 'Sponsorship'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Message" id="c-msg" required error={errors.message} className="span-2"><textarea id="c-msg" className="textarea" rows={6} value={form.message} onChange={set('message')} aria-invalid={!!errors.message} /></Field>
                <div className="span-2 form-actions">
                  <p className="mono muted">Demo form · stored locally and visible in the organiser dashboard.</p>
                  <button className="btn btn--gold" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <><span className="spinner" /> Sending…</> : 'Send message'}</button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
