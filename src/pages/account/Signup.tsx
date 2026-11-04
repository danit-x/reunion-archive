import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../components/feedback';
import { Field } from '../../components/primitives';
import { PHOTO } from '../../data/images';
import { SECTIONS } from '../../data/seed';
import { useStore } from '../../data/store';
import { usePageTitle } from '../../lib/hooks';
import { batchesFor, isEmail } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function Signup() {
  const { signUp, user, data } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/account';
  usePageTitle('Create account');
  const [f, setF] = useState({ fullName: '', email: '', password: '', confirm: '', batch: '', section: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  if (user && !busy) return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.fullName.trim().length < 3) er.fullName = 'Enter your full name.';
    if (!isEmail(f.email)) er.email = 'Enter a valid email address.';
    if (f.password.length < 8) er.password = 'Use at least 8 characters.';
    else if (!/\d/.test(f.password) || !/[a-z]/i.test(f.password)) er.password = 'Include at least one letter and one number.';
    if (f.confirm !== f.password) er.confirm = 'Passwords do not match.';
    if (!f.batch) er.batch = 'Select your batch.';
    if (!f.section) er.section = 'Select your class.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      await signUp({ fullName: f.fullName.trim(), email: f.email, password: f.password, batch: Number(f.batch), section: f.section });
      toast('Account created — welcome to the archive.');
      navigate(next, { replace: true });
    } catch (err) {
      setErrors({ form: (err as Error).message });
      setBusy(false);
    }
  };

  return (
    <AuthShell kicker="Join the archive" title={[<>Create</>, <><em>your account.</em></>]} photo={PHOTO.friendsLaugh}>
      <form className="auth__form form-grid" onSubmit={submit} noValidate>
        {errors.form && <div className="error-summary span-2" role="alert"><p>{errors.form}</p></div>}
        <Field label="Full name" id="s-name" required error={errors.fullName} className="span-2"><input id="s-name" className="input" value={f.fullName} onChange={set('fullName')} autoComplete="name" /></Field>
        <Field label="Email address" id="s-email" required error={errors.email} className="span-2"><input id="s-email" type="email" className="input" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Batch" id="s-batch" required error={errors.batch}>
          <select id="s-batch" className="select" value={f.batch} onChange={set('batch')}><option value="">Select…</option>{batchesFor(data.event).map((b) => <option key={b} value={b}>{b}</option>)}</select>
        </Field>
        <Field label="Class" id="s-sec" required error={errors.section}>
          <select id="s-sec" className="select" value={f.section} onChange={set('section')}><option value="">Select…</option>{SECTIONS.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Password" id="s-pw" required error={errors.password} hint="8+ characters with a letter and a number."><input id="s-pw" type="password" className="input" value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <Field label="Confirm password" id="s-pw2" required error={errors.confirm}><input id="s-pw2" type="password" className="input" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" /></Field>
        <button className="btn btn--gold btn--block span-2" disabled={busy}>{busy ? <><span className="spinner" /> Creating account…</> : 'Create account'}</button>
        <p className="ui auth__switch span-2">Already have an account? <Link to="/account/login" className="underline">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
