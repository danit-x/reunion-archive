import { CalendarClock, CalendarDays, ClipboardCheck, ExternalLink, Images, LayoutDashboard, LogOut, Megaphone, Menu, Settings as SettingsIcon, Ticket, Users, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Logo } from '../../components/primitives';
import { useToast } from '../../components/feedback';
import { useStore } from '../../data/store';
import { cx, formatDateShort } from '../../lib/utils';
import Overview from './Overview';
import Registrations from './Registrations';
import AttendeesAdmin from './AttendeesAdmin';
import Attendance from './Attendance';
import EventAdmin from './EventAdmin';
import ScheduleAdmin from './ScheduleAdmin';
import AnnouncementsAdmin from './AnnouncementsAdmin';
import GalleryAdmin from './GalleryAdmin';
import Settings from './Settings';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/registrations', label: 'Registrations', icon: Ticket },
  { to: '/admin/attendees', label: 'Attendees', icon: Users },
  { to: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/admin/event', label: 'Event Details', icon: CalendarDays },
  { to: '/admin/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/gallery', label: 'Memories Gallery', icon: Images },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

function AdminLogin() {
  const { adminLogIn, data } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { document.title = 'Organiser sign-in — The Reunion Archive'; }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    if (!adminLogIn(code)) { setError('That passcode is not correct.'); setBusy(false); }
  };
  return (
    <div className="a-login">
      <div className="a-login__card">
        <Logo tone="dark" />
        <div>
          <p className="a-kicker">Organiser dashboard</p>
          <h1 className="a-title">{data.event.eventTitle}</h1>
        </div>
        <form onSubmit={submit} className="a-login__form" noValidate>
          <div className={cx('field', error && 'field--invalid')}>
            <label className="field__label" htmlFor="pc">Committee passcode</label>
            <input id="pc" type="password" className="input" value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} autoFocus autoComplete="off" />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>
          <button className="btn btn--block" disabled={busy || !code}>{busy ? <><span className="spinner" /> Checking…</> : 'Enter dashboard'}</button>
        </form>
        <p className="a-login__hint mono">Demo passcode: <strong>reunion2026</strong> — simulated access control only.</p>
        <Link to="/" className="link-arrow">← Back to public site</Link>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const { isAdmin, adminLogOut, data, persistError } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const n = NAV.find((x) => (x.end ? pathname === x.to || pathname === `${x.to}/` : pathname.startsWith(x.to)));
    document.title = `${n?.label ?? 'Dashboard'} — Organiser · The Reunion Archive`;
  }, [pathname]);

  if (!isAdmin) return <AdminLogin />;
  const pending = data.registrations.filter((r) => r.status === 'pending').length;
  const review = data.gallery.filter((g) => g.status === 'pending').length;

  return (
    <div className="admin">
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <aside className={cx('a-side', open && 'is-open')} aria-label="Dashboard navigation">
        <div className="a-side__brand">
          <Link to="/admin"><Logo /></Link>
          <button className="a-side__close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <p className="a-side__event">{data.event.eventTitle}<span>{formatDateShort(data.event.date)}</span></p>
        <nav className="a-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('a-nav__link', isActive && 'is-active')}>
              <n.icon size={18} aria-hidden="true" />
              <span>{n.label}</span>
              {n.label === 'Registrations' && pending > 0 && <span className="a-nav__count" aria-label={`${pending} pending`}>{pending}</span>}
              {n.label === 'Memories Gallery' && review > 0 && <span className="a-nav__count" aria-label={`${review} awaiting review`}>{review}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="a-side__foot">
          <div className="a-side__user">
            <span className="a-side__avatar">{data.admin.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
            <span><strong>{data.admin.name}</strong><small>{data.admin.role}</small></span>
          </div>
          <Link to="/" className="a-nav__link" target="_blank"><ExternalLink size={17} /> View public site</Link>
          <button className="a-nav__link" onClick={() => { adminLogOut(); toast('Signed out of the dashboard.', 'info'); }}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>
      {open && <div className="a-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="a-main">
        <div className="a-topbar">
          <button className="a-burger" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <span className="a-topbar__title">Organiser dashboard</span>
          <span className="a-topbar__demo mono">Demo · data stored in this browser</span>
        </div>
        {persistError && <div className="a-alert" role="alert">{persistError}</div>}
        <main id="admin-main" className="a-content">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="attendees" element={<AttendeesAdmin />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="event" element={<EventAdmin />} />
            <Route path="schedule" element={<ScheduleAdmin />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
