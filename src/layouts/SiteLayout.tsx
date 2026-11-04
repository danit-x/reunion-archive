import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Facebook, Instagram, Linkedin, Menu, UserRound, X, Youtube } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '../components/primitives';
import { useStore } from '../data/store';
import { cx, formatDateLong } from '../lib/utils';

export const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/story', label: 'Our Story' },
  { to: '/event', label: 'The Event' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/memories', label: 'Memories' },
  { to: '/attendees', label: 'Attendees' },
  { to: '/announcements', label: 'News' },
  { to: '/contact', label: 'Contact' },
];

function Nav() {
  const { data, user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const forceSolid = pathname === '/register' || pathname === '/account/login' || pathname === '/account/signup';
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className={cx('nav', (scrolled || forceSolid) && 'nav--solid', open && 'nav--open')}>
        <div className="nav__inner">
          <Link to="/" className="nav__brand" aria-label="The Reunion Archive — home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="nav__links">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('nav__link', isActive && 'is-active')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav__actions">
            <Link to={user ? '/account' : '/account/login'} className="nav__account" aria-label={user ? `Your account (${user.fullName})` : 'Log in'}>
              <UserRound size={18} aria-hidden="true" />
              <span className="nav__account-label">{user ? user.fullName.split(' ')[0] : 'Log in'}</span>
            </Link>
            <Link to="/register" className="btn btn--gold btn--sm nav__cta">Register</Link>
            <button className="nav__burger" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="menu on-dark grain grain--dark" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: .7, ease: [0.76, 0, 0.24, 1] }}>
            <nav aria-label="Mobile" className="menu__list">
              {NAV.map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 + i * .05, duration: .6, ease: [0.22, 1, 0.36, 1] }}>
                  <NavLink to={n.to} end={n.end} className={({ isActive }) => cx('menu__link', isActive && 'is-active')}>
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                    <span>{n.label}</span>
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <motion.div className="menu__foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7 }}>
              <p className="label gold-on-dark">{data.event.eventTitle}</p>
              <p className="menu__date">{formatDateLong(data.event.date)} · {data.event.city}</p>
              <div className="menu__btns">
                <Link to="/register" className="btn btn--gold btn--block">Reserve your place</Link>
                <Link to={user ? '/account' : '/account/login'} className="btn btn--ghost btn--block">{user ? 'My account' : 'Log in / Sign up'}</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  const { data } = useStore();
  const { event: e, organizer: o } = data;
  return (
    <footer className="footer on-dark grain grain--dark">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tag display"><em>Years apart.</em><br />One place.<br /><span className="gold-on-dark">A thousand memories.</span></p>
          </div>
          <nav aria-label="Footer" className="footer__col">
            <p className="label gold-on-dark">Explore</p>
            <ul>
              {NAV.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
              <li><Link to="/register">Register</Link></li>
            </ul>
          </nav>
          <div className="footer__col">
            <p className="label gold-on-dark">The Day</p>
            <ul className="footer__facts">
              <li>{e.eventTitle}</li>
              <li>{formatDateLong(e.date)}</li>
              <li>{e.venue}</li>
              <li>{e.city}, {e.country}</li>
            </ul>
          </div>
          <div className="footer__col">
            <p className="label gold-on-dark">Organisers</p>
            <ul className="footer__facts">
              <li>{o.name}</li>
              <li><a href={`mailto:${o.email}`}>{o.email}</a></li>
              <li><a href={`tel:${o.phone.replace(/\s/g, '')}`}>{o.phone}</a></li>
              <li>{o.address}</li>
            </ul>
            <div className="footer__social">
              <a href={o.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href={o.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
              <a href={o.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href={o.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>
        </div>
        <p className="footer__wordmark display" aria-hidden="true">The Reunion Archive</p>
        <div className="footer__bottom">
          <p className="mono">© {new Date().getFullYear()} {e.schoolName} · Old Students’ Reunion Committee. Demo content — all names fictional.</p>
          <div className="footer__bottom-links">
            <Link to="/admin" className="mono">Organiser dashboard <ArrowUpRight size={13} /></Link>
            <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
              <span className="mono">Back to top</span><ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" key={pathname}>
        <Suspense fallback={<div className="page-loader" role="status" aria-label="Loading page"><span className="spinner" /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
