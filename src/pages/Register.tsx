import { AlertTriangle, ArrowRight, Lock, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/feedback';
import { Eyebrow, Field, LineReveal } from '../components/primitives';
import { SECTIONS } from '../data/seed';
import { useStore } from '../data/store';
import type { AttendanceIntent, Dietary } from '../data/types';
import { usePageTitle } from '../lib/hooks';
import { batchesFor, cx, formatDateLong, formatDateShort, formatMoney, formatTime, isEmail, isPhone } from '../lib/utils';

interface FormState {
  fullName: string; email: string; phone: string; batch: string; section: string; occupation: string;
  intent: AttendanceIntent | ''; guests: number; dietary: Dietary; requests: string; showInDirectory: boolean; consent: boolean;
}
type Errors = Partial<Record<keyof FormState, string>>;

const DIETARY: [Dietary, string][] = [['none', 'No preference'], ['vegetarian', 'Vegetarian'], ['vegan', 'Vegan'], ['halal', 'Halal'], ['gluten-free', 'Gluten-free'], ['other', 'Other (add below)']];

export default function Register() {
  const { data, user, createRegistration } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('Register');
  const e = data.event;
  const s = data.registration;

  const [f, setF] = useState<FormState>({
    fullName: user?.fullName ?? '', email: user?.email ?? '', phone: '', batch: user ? String(user.batch) : '', section: user?.section ?? '', occupation: user?.occupation ?? '',
    intent: '', guests: 0, dietary: 'none', requests: '', showInDirectory: true, consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const lock = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);

  const deadlinePassed = new Date(`${s.deadline}T23:59:59`) < new Date();
  const active = data.registrations.filter((r) => r.status !== 'cancelled');
  const full = active.length + active.reduce((t, r) => t + r.guests, 0) >= s.capacity;
  const closed = !s.open || deadlinePassed || full;
  const existing = useMemo(() => {
    const em = f.email.trim().toLowerCase();
    return em ? data.registrations.find((r) => r.email.toLowerCase() === em && r.status !== 'cancelled') : undefined;
  }, [f.email, data.registrations]);
  const myReg = user ? data.registrations.find((r) => (r.userId === user.id || r.email === user.email) && r.status !== 'cancelled') : undefined;

  const validate = (st: FormState): Errors => {
    const er: Errors = {};
    if (st.fullName.trim().length < 3 || !/\s/.test(st.fullName.trim())) er.fullName = 'Please enter your first and last name.';
    if (!isEmail(st.email)) er.email = 'Enter a valid email address, e.g. name@example.com.';
    else if (existing) er.email = 'This email is already registered.';
    if (!isPhone(st.phone)) er.phone = 'Enter a valid phone number with at least 9 digits.';
    if (!st.batch) er.batch = 'Select the year you graduated (or would have).';
    if (!st.section) er.section = 'Select your class or section.';
    if (!st.intent) er.intent = 'Let us know whether you will attend.';
    if (st.dietary === 'other' && st.requests.trim().length < 3) er.requests = 'Please describe your dietary requirement.';
    if (!st.consent) er.consent = 'Please confirm the details are correct.';
    return er;
  };

  useEffect(() => {
    // re-validate touched fields live
    const all = validate(f);
    setErrors(Object.fromEntries(Object.entries(all).filter(([k]) => touched[k as keyof FormState])) as Errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, touched, existing]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
  const blur = (k: keyof FormState) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (lock.current || closed) return; // prevents double submission
    const er = validate(f);
    setErrors(er);
    setAttempted(true);
    setTouched(Object.fromEntries(Object.keys(f).map((k) => [k, true])));
    if (Object.keys(er).length) {
      setTimeout(() => errorSummary.current?.focus(), 30);
      return;
    }
    lock.current = true;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1300)); // simulated network latency
      const reg = createRegistration({
        fullName: f.fullName.trim(), email: f.email.trim().toLowerCase(), phone: f.phone.trim(), batch: Number(f.batch), section: f.section,
        occupation: f.occupation.trim() || undefined, intent: f.intent as AttendanceIntent, guests: f.guests, dietary: f.dietary,
        requests: f.requests.trim() || undefined, showInDirectory: f.showInDirectory, userId: user?.id, city: user?.city, bio: user?.bio,
      });
      try {
        const mine = JSON.parse(localStorage.getItem('reunion-archive:mine') ?? '[]') as string[];
        localStorage.setItem('reunion-archive:mine', JSON.stringify([reg.id, ...mine]));
      } catch { /* ignore */ }
      toast(`Registration complete — your ID is ${reg.id}`);
      navigate(`/register/confirmed/${reg.id}`, { replace: true });
    } catch {
      toast('Something went wrong while saving. Please try again.', 'error');
      lock.current = false;
      setSubmitting(false);
    }
  };

  const total = e.ticketAlumni + f.guests * e.ticketGuest;
  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <div className="register">
      <aside className="register__aside on-dark grain grain--dark">
        <div className="register__aside-inner">
          <Eyebrow num="R.S.V.P." className="gold-on-dark">Registration</Eyebrow>
          <LineReveal as="h1" className="display register__title" lines={[<>Reserve</>, <><em className="gold-on-dark">your place.</em></>]} />
          <p className="register__intro">Three minutes, three short sections. You’ll receive your registration ID and a printable archive pass immediately.</p>
          <dl className="register__facts">
            <div><dt className="label">Event</dt><dd>{e.eventTitle}</dd></div>
            <div><dt className="label">When</dt><dd>{formatDateLong(e.date)}<br />{formatTime(e.startTime)} — {formatTime(e.endTime)}</dd></div>
            <div><dt className="label">Where</dt><dd>{e.venue}, {e.city}</dd></div>
            <div><dt className="label">Closes</dt><dd>{formatDateShort(s.deadline)}</dd></div>
          </dl>
          <div className="register__total" aria-live="polite">
            <div className="register__line"><span>Alumni ticket</span><span>{formatMoney(e.ticketAlumni, e.currency)}</span></div>
            <div className="register__line"><span>Guests × {f.guests}</span><span>{formatMoney(f.guests * e.ticketGuest, e.currency)}</span></div>
            <div className="register__line register__line--total"><span>Due on the day</span><span className="display">{formatMoney(total, e.currency)}</span></div>
            <p className="mono register__note">Demo: no payment is collected online.</p>
          </div>
        </div>
      </aside>

      <section className="register__main on-paper grain">
        {closed ? (
          <div className="reg-closed">
            <Lock size={28} className="gold" />
            <h2 className="h2">Registration is <em>closed.</em></h2>
            <p className="ui">{full ? 'All places have been reserved. ' : deadlinePassed ? 'The registration deadline has passed. ' : 'The committee has paused new registrations. '}Contact the organisers to join the waiting list.</p>
            <Link to="/contact" className="btn">Contact the committee</Link>
          </div>
        ) : myReg ? (
          <div className="reg-closed">
            <h2 className="h2">You’re <em>already registered.</em></h2>
            <p className="ui">Your registration <strong className="mono">{myReg.id}</strong> is {myReg.status}. You can view or print your archive pass any time.</p>
            <div className="hero__ctas"><Link to={`/ticket/${myReg.id}`} className="btn btn--gold">View my pass</Link><Link to="/account" className="btn btn--line">My account</Link></div>
          </div>
        ) : (
          <form className="reg-form" onSubmit={submit} noValidate aria-describedby="req-note">
            <p id="req-note" className="ui muted reg-form__req">Fields marked <span className="field__req">*</span> are required.</p>
            {!user && <p className="reg-form__login ui">Have an account? <Link to="/account/login?next=/register" className="underline">Log in</Link> to prefill your details and keep your pass in one place.</p>}

            {errorList.length > 0 && attempted && (
              <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummary}>
                <p><AlertTriangle size={18} /> Please correct {errorList.length} field{errorList.length > 1 ? 's' : ''}:</p>
                <ul>{errorList.map(([k, v]) => <li key={k}><a href={`#r-${k}`}>{v}</a></li>)}</ul>
              </div>
            )}

            <fieldset className="reg-sec">
              <legend><span className="reg-sec__num display">I.</span><span className="h3">About you</span></legend>
              <div className="form-grid">
                <Field label="Full name" id="r-fullName" required error={errors.fullName} className="span-2">
                  <input id="r-fullName" className="input" value={f.fullName} onChange={(x) => set('fullName', x.target.value)} onBlur={blur('fullName')} autoComplete="name" aria-invalid={!!errors.fullName} aria-required="true" />
                </Field>
                <Field label="Email address" id="r-email" required error={errors.email} hint="Used only by the committee — never shown publicly.">
                  <input id="r-email" type="email" className="input" value={f.email} onChange={(x) => set('email', x.target.value)} onBlur={blur('email')} autoComplete="email" aria-invalid={!!errors.email} aria-required="true" />
                </Field>
                <Field label="Phone number" id="r-phone" required error={errors.phone} hint="Include country code if abroad.">
                  <input id="r-phone" type="tel" className="input" value={f.phone} onChange={(x) => set('phone', x.target.value)} onBlur={blur('phone')} autoComplete="tel" placeholder="+94 77 123 4567" aria-invalid={!!errors.phone} aria-required="true" />
                </Field>
                {existing && <p className="span-2 inline-note ui">Already registered with this email? <Link className="underline" to={`/ticket/${existing.id}`}>View that pass</Link>.</p>}
                <Field label="Graduation batch" id="r-batch" required error={errors.batch}>
                  <select id="r-batch" className="select" value={f.batch} onChange={(x) => set('batch', x.target.value)} onBlur={blur('batch')} aria-invalid={!!errors.batch} aria-required="true">
                    <option value="">Select year…</option>
                    {batchesFor(e).map((b) => <option key={b} value={b}>Class of {b}</option>)}
                  </select>
                </Field>
                <Field label="Class / section" id="r-section" required error={errors.section}>
                  <select id="r-section" className="select" value={f.section} onChange={(x) => set('section', x.target.value)} onBlur={blur('section')} aria-invalid={!!errors.section} aria-required="true">
                    <option value="">Select class…</option>
                    {SECTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Current occupation" id="r-occupation" optional className="span-2">
                  <input id="r-occupation" className="input" value={f.occupation} onChange={(x) => set('occupation', x.target.value)} placeholder="e.g. Architect, Medical student, Entrepreneur" />
                </Field>
              </div>
            </fieldset>

            <fieldset className="reg-sec">
              <legend><span className="reg-sec__num display">II.</span><span className="h3">The day itself</span></legend>
              <div className="form-grid">
                <div className={cx('field span-2', errors.intent && 'field--invalid')} id="r-intent">
                  <p className="field__label">Confirm attendance <span className="field__req" aria-hidden="true">*</span></p>
                  <div className="choice-row" role="radiogroup" aria-label="Confirm attendance">
                    <label className="choice"><input type="radio" name="intent" value="yes" aria-label="Yes, I’ll be there" checked={f.intent === 'yes'} onChange={() => { set('intent', 'yes'); blur('intent')(); }} /> Yes, I’ll be there</label>
                    <label className="choice"><input type="radio" name="intent" value="maybe" aria-label="Probably — hold my place" checked={f.intent === 'maybe'} onChange={() => { set('intent', 'maybe'); blur('intent')(); }} /> Probably — hold my place</label>
                  </div>
                  {errors.intent && <p className="field__error" role="alert">{errors.intent}</p>}
                </div>
                <div className="field">
                  <p className="field__label" id="guests-label">Additional guests</p>
                  <div className="stepper" role="group" aria-labelledby="guests-label">
                    <button type="button" onClick={() => set('guests', Math.max(0, f.guests - 1))} disabled={f.guests === 0} aria-label="Remove a guest"><Minus size={16} /></button>
                    <output aria-live="polite">{f.guests}</output>
                    <button type="button" onClick={() => set('guests', Math.min(s.maxGuests, f.guests + 1))} disabled={f.guests >= s.maxGuests} aria-label="Add a guest"><Plus size={16} /></button>
                  </div>
                  <p className="field__hint">Up to {s.maxGuests} · {formatMoney(e.ticketGuest, e.currency)} each</p>
                </div>
                <Field label="Dietary preference" id="r-dietary">
                  <select id="r-dietary" className="select" value={f.dietary} onChange={(x) => set('dietary', x.target.value as Dietary)}>
                    {DIETARY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Special requests" id="r-requests" optional={f.dietary !== 'other'} required={f.dietary === 'other'} error={errors.requests} className="span-2" hint="Accessibility needs, allergies, or anything we should know.">
                  <textarea id="r-requests" className="textarea" rows={3} value={f.requests} onChange={(x) => set('requests', x.target.value)} onBlur={blur('requests')} maxLength={500} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="reg-sec">
              <legend><span className="reg-sec__num display">III.</span><span className="h3">The directory</span></legend>
              <label className="switch">
                <input type="checkbox" checked={f.showInDirectory} onChange={(x) => set('showInDirectory', x.target.checked)} />
                <span className="switch__track" aria-hidden="true" />
                Show my name, batch, class and occupation in the classmates directory
              </label>
              <label className={cx('check', errors.consent && 'is-invalid')} id="r-consent">
                <input type="checkbox" checked={f.consent} onChange={(x) => { set('consent', x.target.checked); blur('consent')(); }} aria-invalid={!!errors.consent} />
                <span>I confirm these details are correct and agree to be contacted by the organising committee about this event. <span className="field__req">*</span></span>
              </label>
              {errors.consent && <p className="field__error" role="alert">{errors.consent}</p>}
            </fieldset>

            <div className="reg-submit">
              <p className="display reg-submit__total">{formatMoney(total, e.currency)} <span className="mono">due on the day</span></p>
              <button type="submit" className="btn btn--gold" disabled={submitting} aria-busy={submitting}>
                {submitting ? <><span className="spinner" /> Reserving your place…</> : <>Complete registration <ArrowRight className="arrow" /></>}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
