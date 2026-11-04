import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLink, Eyebrow, Img, LineReveal, Reveal, pad, useCountdown } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import { batchesFor, formatDateShort, formatTime, roman } from '../lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Intro curtain (first visit per session) ─────────────── */
function IntroCurtain({ from, to }: { from: number; to: number }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem('tra-intro'); } catch { return false; }
  });
  const [year, setYear] = useState(from);
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('tra-intro', '1'); } catch { /* ignore */ }
    if (reduce) { setShow(false); return; }
    const step = setInterval(() => setYear((y) => (y < to ? y + 1 : y)), 85);
    const done = setTimeout(() => setShow(false), 1900);
    return () => { clearInterval(step); clearTimeout(done); };
  }, [show, reduce, to]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="curtain" aria-hidden="true" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}>
          <motion.div className="curtain__inner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .6 }}>
            <span className="label gold-on-dark">The Reunion Archive</span>
            <span className="curtain__year display">{year}</span>
            <span className="curtain__bar"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} /></span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Hero ──────────────────────────────────────────────── */
function Hero() {
  const { data } = useStore();
  const e = data.event;
  const cd = useCountdown(e);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, reduce ? 1.08 : 1.2]);
  const year = new Date(e.date).getFullYear();
  const dateObj = new Date(`${e.date}T12:00:00`);
  const weekday = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
  const dayMonth = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const [delay] = useState(() => { if (reduce) return 0; try { return sessionStorage.getItem('tra-intro-done') ? 0.1 : 1.9; } catch { return 0.1; } });
  useEffect(() => { try { sessionStorage.setItem('tra-intro-done', '1'); } catch { /* ignore */ } }, []);

  const headline = [
    <>Years apart.</>,
    <><em className="gold-on-dark">One place.</em></>,
    <>A thousand</>,
    <>memories.</>,
  ];

  return (
    <section ref={ref} className="hero on-dark" aria-labelledby="hero-title">
      <motion.div className="hero__bg" style={{ y: bgY, scale: bgScale }} aria-hidden="true">
        <img src={unsplash(PHOTO.auditorium, 2000)} srcSet={`${unsplash(PHOTO.auditorium, 900)} 900w, ${unsplash(PHOTO.auditorium, 1600)} 1600w, ${unsplash(PHOTO.auditorium, 2400)} 2400w`} sizes="100vw" alt="" {...{ fetchpriority: 'high' }} />
      </motion.div>
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__grain grain grain--dark" aria-hidden="true" />

      <div className="hero__frame container">
        <motion.div className="hero__meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 1 }}>
          <span className="mono">Vol. {roman(year - 2010)} — {e.schoolName}</span>
          <span className="mono hero__meta-mid">Batches {e.batchFrom} — {e.batchTo}</span>
          <span className="mono">{e.city}, {e.country}</span>
        </motion.div>

        <div className="hero__grid">
          <div className="hero__copy">
            <motion.p className="label gold-on-dark hero__kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + .1, duration: .8, ease }}>
              {e.eventTitle}
            </motion.p>
            <h1 id="hero-title" className="display hero__title">
              {headline.map((l, i) => (
                <span key={i} className="line-mask">
                  <motion.span className="line-mask__inner" initial={reduce ? { opacity: 0 } : { y: '110%' }} animate={reduce ? { opacity: 1 } : { y: '0%' }} transition={{ delay: delay + .15 + i * .12, duration: 1.2, ease }}>
                    {l}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div className="hero__ctas" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + .75, duration: .9, ease }}>
              <Link to="/register" className="btn btn--gold">Reserve Your Place <ArrowRight className="arrow" /></Link>
              <Link to="/memories" className="btn btn--ghost">Explore Our Memories</Link>
            </motion.div>
          </div>

          <motion.aside className="invite" aria-label="Invitation details" initial={{ opacity: 0, y: 40, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} transition={{ delay: delay + .55, duration: 1.3, ease }}>
            <div className="invite__border">
              <p className="invite__school label">{e.schoolName}</p>
              <p className="invite__req">requests the pleasure of your company at</p>
              <p className="invite__title display">The Grand<br /><em>Reunion</em></p>
              <p className="invite__roman mono">MMXXVI</p>
              <div className="invite__rule" aria-hidden="true"><span>✦</span></div>
              <dl className="invite__facts">
                <div><dt className="label">Date</dt><dd>{weekday}, {dayMonth} {year}</dd></div>
                <div><dt className="label">From</dt><dd>{formatTime(e.startTime)} — {formatTime(e.endTime)}</dd></div>
                <div><dt className="label">Venue</dt><dd>{e.venue}<br /><span className="muted"><MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {e.city}</span></dd></div>
              </dl>
              <div className="invite__count" aria-label={`${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes to go`}>
                {[['Days', cd.days], ['Hrs', cd.hours], ['Min', cd.minutes], ['Sec', cd.seconds]].map(([l, v]) => (
                  <div key={l as string}><span className="invite__num">{pad(v as number)}</span><span className="label">{l}</span></div>
                ))}
              </div>
              <p className="invite__rsvp mono">R.S.V.P. before {formatDateShort(data.registration.deadline)}</p>
            </div>
          </motion.aside>
        </div>

        <motion.a href="#introduction" className="hero__scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 1.2 }}>
          <span className="mono">Scroll to open the archive</span>
          <ArrowDown size={16} />
        </motion.a>
      </div>
    </section>
  );
}

function YearMarquee() {
  const { data } = useStore();
  const years = batchesFor(data.event);
  const row = [...years, ...years];
  return (
    <div className="marquee on-dark" aria-hidden="true">
      <div className="marquee__track">
        {row.map((y, i) => (
          <span key={i} className="marquee__item display">
            <span className={i % 2 ? 'outline' : ''}>{y}</span> <span className="marquee__star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Introduction ──────────────────────────────────────── */
function Introduction() {
  const { data } = useStore();
  const e = data.event;
  return (
    <section id="introduction" className="intro section on-paper grain" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div className="intro__text">
          <Eyebrow num="No. 01">The Introduction</Eyebrow>
          <LineReveal className="display intro__title" lines={[<>Some places</>, <><em>never leave</em> us.</>]} />
          <Reveal className="intro__cols prose" delay={0.15}>
            <p className="dropcap">
              There is a corridor somewhere in Colombo that still smells of chalk dust and rain. A bench under the mara tree where friendships were sworn, and a gate we once walked through every morning without a second thought.
            </p>
            <p>
              A decade on, we are scattered across cities and continents, careers and families. The Grand Reunion is our reason to come back — eleven batches, one auditorium, and a single day to remember who we were before the world got busy.
            </p>
            <p>{e.description}</p>
          </Reveal>
          <Reveal delay={.2}><ArrowLink to="/story">Read our story</ArrowLink></Reveal>
          <div className="intro__years display" aria-hidden="true">
            <span>{e.batchFrom}</span>
            <span className="intro__dash">—</span>
            <span>{e.batchTo}</span>
          </div>
        </div>
        <div className="intro__visual">
          <Reveal className="intro__photo-main">
            <Img src={unsplash(PHOTO.schoolBuilding, 1200)} alt="The main school building across a green lawn" sizes="(max-width: 900px) 100vw, 40vw" />
            <figcaption className="caption"><span className="mono">Fig. 01</span> The Main Building, from the cricket grounds.</figcaption>
          </Reveal>
          <Reveal className="intro__photo-small" delay={.25}>
            <Img src={unsplash(PHOTO.classroomDesks, 700)} alt="Rows of wooden desks in an empty classroom" sizes="300px" />
          </Reveal>
          <Reveal className="intro__quote" delay={.35}>
            <blockquote>
              <p>“We didn’t know we were making memories. We just knew we were having fun.”</p>
              <footer className="label">— Batch of 2014, Class Prefect</footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Memories ──────────────────────────────────────────── */
const MEMORY_TILES = [
  { key: 'classrooms', label: 'Old Classrooms', fig: '02', photo: PHOTO.classroomKids, cat: 'Classrooms', year: '2012' },
  { key: 'friends', label: 'School Friends', fig: '03', photo: PHOTO.friendsBehind, cat: 'School Days', year: '2016' },
  { key: 'sports', label: 'Sports Days', fig: '04', photo: PHOTO.cricketGround, cat: 'Sports Days', year: '2015' },
  { key: 'trips', label: 'School Trips', fig: '05', photo: PHOTO.roadTrip, cat: 'Trips and Adventures', year: '2017' },
  { key: 'teachers', label: 'Our Teachers', fig: '06', photo: PHOTO.teacher, cat: 'Teachers', year: '2013' },
  { key: 'moments', label: 'Special Moments', fig: '07', photo: PHOTO.gradCaps, cat: 'School Events', year: '2020' },
];

function Memories() {
  return (
    <section className="memories section on-dark grain grain--dark" aria-labelledby="memories-title">
      <div className="container">
        <div className="memories__head">
          <Eyebrow num="No. 02" className="gold-on-dark">The Archive, Opened</Eyebrow>
          <LineReveal className="display memories__title" lines={[<>Every frame,</>, <><em className="gold-on-dark">a way back.</em></>]} />
          <Reveal className="memories__intro lead" delay={.2}>
            Six chapters of the life we shared — pulled from shoeboxes, phone backups and the school’s own albums.
          </Reveal>
        </div>
        <div className="memories__grid">
          {MEMORY_TILES.map((m, i) => (
            <Reveal key={m.key} className={`mem mem--${i + 1}`} delay={(i % 3) * .08}>
              <Link to={`/memories?category=${encodeURIComponent(m.cat)}`} className="mem__link">
                <Img src={unsplash(m.photo, 1100)} alt={`${m.label} — archive photograph`} sizes="(max-width: 900px) 100vw, 40vw" className="mem__img" />
                <span className="mem__meta">
                  <span className="mono">Fig. {m.fig} · {m.year}</span>
                  <span className="mem__label display">{m.label}</span>
                </span>
                <span className="mem__arrow" aria-hidden="true"><ArrowRight size={18} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="memories__foot">
          <Link to="/memories" className="btn btn--ghost">Enter the full archive <ArrowRight className="arrow" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Highlights ─────────────────────────────────────────── */
const HIGHLIGHTS = [
  { t: 'Reconnect with classmates', d: 'Batch tables, old seating plans and a “find your desk” challenge to break the ice in ten seconds.', p: PHOTO.friendsLaugh },
  { t: 'Meet old teachers', d: 'Fourteen former teachers return as guests of honour — finally, the chance to say what we never did.', p: PHOTO.classroomTeacher },
  { t: 'Celebrate unforgettable memories', d: 'A slideshow built from your own submissions, screened on the auditorium’s big screen.', p: PHOTO.audience },
  { t: 'Entertainment & activities', d: 'An alumni band, a batch cricket match, tug-of-war and a fiercely competitive school trivia quiz.', p: PHOTO.stageLights },
  { t: 'Capture new moments', d: 'One great group photograph of every batch, plus portrait sessions on the auditorium steps.', p: PHOTO.graduatesLawn },
  { t: 'Celebrate the school legacy', d: 'Seal a time capsule for the class of 2036 and sing the school song together — one more time.', p: PHOTO.schoolHall },
];

function Highlights() {
  const [active, setActive] = useState(0);
  return (
    <section className="highlights section on-paper grain" aria-labelledby="hl-title">
      <div className="container highlights__grid">
        <div className="highlights__aside">
          <Eyebrow num="No. 03">What the Day Holds</Eyebrow>
          <LineReveal className="display highlights__title" lines={[<>Six reasons</>, <>to walk back</>, <><em>through the gate.</em></>]} />
          <div className="highlights__visual" aria-hidden="true">
            <AnimatePresence mode="popLayout">
              <motion.img key={active} src={unsplash(HIGHLIGHTS[active].p, 900)} alt="" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9, ease }} />
            </AnimatePresence>
            <span className="highlights__count mono">{pad(active + 1)} / {pad(HIGHLIGHTS.length)}</span>
          </div>
        </div>
        <ol className="highlights__list">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal as="li" key={h.t} delay={i * .05}>
              <button className={`hl ${active === i ? 'is-active' : ''}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-pressed={active === i}>
                <span className="hl__num display">{pad(i + 1)}</span>
                <span className="hl__body">
                  <span className="hl__title">{h.t}</span>
                  <span className="hl__desc">{h.d}</span>
                </span>
                <ArrowRight className="hl__arrow" size={20} aria-hidden="true" />
              </button>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Countdown band ─────────────────────────────────────── */
function CountdownBand() {
  const { data } = useStore();
  const cd = useCountdown(data.event);
  const units: [string, number][] = [['Days', cd.days], ['Hours', cd.hours], ['Minutes', cd.minutes], ['Seconds', cd.seconds]];
  return (
    <section className="countdown on-dark" aria-labelledby="cd-title">
      <div className="countdown__bg" aria-hidden="true"><img src={unsplash(PHOTO.stadiumNight, 1800)} alt="" loading="lazy" /></div>
      <div className="container countdown__inner">
        <div className="countdown__head">
          <Eyebrow num="No. 04" className="gold-on-dark">Until the Gates Open</Eyebrow>
          <h2 id="cd-title" className="h2">{cd.done ? <>The day is <em>here.</em></> : <>The bell rings <em className="gold-on-dark">again</em> in</>}</h2>
        </div>
        <div className="countdown__units" role="timer" aria-live="off">
          {units.map(([label, v]) => (
            <div className="countdown__unit" key={label}>
              <span className="countdown__num display">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={v} initial={{ y: '-40%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '40%', opacity: 0 }} transition={{ duration: .45, ease }}>
                    {label === 'Days' ? String(v).padStart(2, '0') : pad(v)}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="label">{label}</span>
            </div>
          ))}
        </div>
        <div className="countdown__foot">
          <p className="mono">{formatDateShort(data.event.date)} · Doors at {formatTime(data.event.startTime)} · {data.event.venue}</p>
          <Link to="/register" className="btn btn--gold btn--sm">Reserve your place</Link>
        </div>
      </div>
    </section>
  );
}

/* ── Schedule preview ───────────────────────────────────── */
function SchedulePreview() {
  const { data } = useStore();
  const items = useMemo(() => [...data.schedule].sort((a, b) => a.time.localeCompare(b.time)), [data.schedule]);
  const preview = items.filter((_, i) => i % 2 === 0 || i === items.length - 1).slice(0, 5);
  return (
    <section className="sched-prev section on-paper-deep grain" aria-labelledby="sp-title">
      <div className="container sched-prev__grid">
        <div className="sched-prev__head">
          <Eyebrow num="No. 05">The Order of the Day</Eyebrow>
          <LineReveal className="display sched-prev__title" lines={[<>From the first</>, <>bell to the</>, <><em>last song.</em></>]} />
          <Reveal delay={.2}><p className="muted ui sched-prev__note">{items.length} moments, {formatTime(data.event.startTime)} — {formatTime(data.event.endTime)}</p></Reveal>
          <Reveal delay={.25}><ArrowLink to="/schedule">See the full schedule</ArrowLink></Reveal>
        </div>
        <ol className="sched-prev__list">
          {preview.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * .06} className="sp-row">
              <span className="sp-row__time mono">{formatTime(s.time)}</span>
              <span className="sp-row__title h3">{s.title}</span>
              <span className="sp-row__loc ui">{s.location}</span>
              <span className="badge badge--gold badge--plain">{s.category}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Attendee preview ───────────────────────────────────── */
function AttendeePreview() {
  const { data } = useStore();
  const active = data.registrations.filter((r) => r.status !== 'cancelled');
  const batches = new Set(active.map((r) => r.batch)).size;
  const guests = active.reduce((s, r) => s + r.guests, 0);
  const featured = data.registrations.filter((r) => r.showInDirectory && r.status === 'confirmed' && r.photo).slice(0, 6);
  return (
    <section className="att-prev section on-paper grain" aria-labelledby="ap-title">
      <div className="container">
        <div className="att-prev__top">
          <div>
            <Eyebrow num="No. 06">Who’s Coming</Eyebrow>
            <LineReveal className="display att-prev__title" lines={[<>The class</>, <><em>is filling up.</em></>]} />
          </div>
          <dl className="att-prev__stats">
            <Reveal><dt className="label">Alumni registered</dt><dd className="display">{active.length}</dd></Reveal>
            <Reveal delay={.08}><dt className="label">Batches represented</dt><dd className="display">{batches}<span className="muted">/{batchesFor(data.event).length}</span></dd></Reveal>
            <Reveal delay={.16}><dt className="label">Guests joining</dt><dd className="display">{guests}</dd></Reveal>
          </dl>
        </div>
        <div className="att-prev__strip">
          {featured.map((p, i) => (
            <Reveal key={p.id} className={`ap-card ap-card--${i % 3}`} delay={i * .07}>
              <Link to={`/attendees?profile=${p.id}`}>
                <Img src={p.photo!} alt={`Portrait of ${p.fullName}`} sizes="200px" ratio="3/4" />
                <p className="ap-card__name">{p.fullName}</p>
                <p className="mono ap-card__meta">Class of {p.batch} · {p.section}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="att-prev__foot">
          <ArrowLink to="/attendees">Explore the classmates directory</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Latest news strip ──────────────────────────────────── */
function NewsStrip() {
  const { data } = useStore();
  const sorted = [...data.announcements].sort((a, b) => b.date.localeCompare(a.date));
  const featured = sorted.find((a) => a.featured) ?? sorted[0];
  const rest = sorted.filter((a) => a.id !== featured?.id).slice(0, 3);
  if (!featured) return null;
  return (
    <section className="news-strip on-dark grain grain--dark" aria-labelledby="ns-title">
      <div className="container news-strip__grid">
        <div className="news-strip__feature">
          <Eyebrow num="No. 07" className="gold-on-dark">From the Committee</Eyebrow>
          <Link to={`/announcements/${featured.id}`} className="news-strip__link">
            <p className="mono gold-on-dark">{formatDateShort(featured.date)} · {featured.category}</p>
            <h2 id="ns-title" className="h2">{featured.title}</h2>
            <p className="news-strip__excerpt">{featured.excerpt}</p>
          </Link>
        </div>
        <ul className="news-strip__list">
          {rest.map((a) => (
            <li key={a.id}>
              <Link to={`/announcements/${a.id}`}>
                <span className="mono">{formatDateShort(a.date)}</span>
                <span className="news-strip__t">{a.title}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li><ArrowLink to="/announcements" className="news-strip__all">All announcements</ArrowLink></li>
        </ul>
      </div>
    </section>
  );
}

/* ── Final CTA ─────────────────────────────────────────── */
function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-10%', '10%']);
  return (
    <section ref={ref} className="final-cta on-dark" aria-labelledby="fc-title">
      <motion.div className="final-cta__bg" style={{ y }} aria-hidden="true"><img src={unsplash(PHOTO.gradCaps, 2000)} alt="" loading="lazy" /></motion.div>
      <div className="container final-cta__inner">
        <Eyebrow num="Fin." className="gold-on-dark">An Invitation</Eyebrow>
        <LineReveal className="display final-cta__title" lines={[<>Let’s make another</>, <><em className="gold-on-dark">memory worth</em></>, <>remembering.</>]} />
        <Reveal delay={.3} className="final-cta__actions">
          <Link to="/register" className="btn btn--gold">Join the Reunion <ArrowRight className="arrow" /></Link>
          <Link to="/event" className="link-arrow">Event details</Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { data } = useStore();
  useEffect(() => { document.title = `The Reunion Archive — ${data.event.eventTitle}`; }, [data.event.eventTitle]);
  return (
    <>
      <IntroCurtain from={data.event.batchFrom} to={data.event.batchTo} />
      <Hero />
      <YearMarquee />
      <Introduction />
      <Memories />
      <Highlights />
      <CountdownBand />
      <SchedulePreview />
      <AttendeePreview />
      <NewsStrip />
      <FinalCTA />
    </>
  );
}
