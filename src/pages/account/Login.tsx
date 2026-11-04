import { Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../components/feedback';
import { Field } from '../../components/primitives';
import { useStore } from '../../data/store';
import { usePageTitle } from '../../lib/hooks';
import { isEmail } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function Login() {
  const { logIn, user } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/account';
  usePageTitle('Log in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!isEmail(email)) er.email = 'Enter the email you signed up with.';
    if (!password) er.password = 'Enter your password.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const u = await logIn(email, password);
      toast(`Welcome back, ${u.fullName.split(' ')[0]}.`);
      navigate(next, { replace: true });
    } catch (err) {
      setErrors({ form: (err as Error).message });
      setBusy(false);
    }
  };

  return (
    <AuthShell kicker="Welcome back" title={[<>Log in to</>, <><em>your archive.</em></>]}>
      <form className="auth__form" onSubmit={submit} noValidate>
        {errors.form && <div className="error-summary" role="alert"><p>{errors.form}</p></div>}
        <Field label="Email address" id="l-email" required error={errors.email}>
          <input id="l-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Password" id="l-pw" required error={errors.password}>
          <div className="pw">
            <input id="l-pw" type={show ? 'text' : 'password'} className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </Field>
        <button className="btn btn--gold btn--block" disabled={busy}>{busy ? <><span className="spinner" /> Logging in…</> : 'Log in'}</button>
        <p className="ui auth__switch">New here? <Link to={`/account/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`} className="underline">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
