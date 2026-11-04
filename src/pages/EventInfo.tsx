import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bus, Car, Check, Clock, MapPin, Minus, Plus, Shirt, Ticket, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow, PageHeader, Reveal } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import { usePageTitle } from '../lib/hooks';
import { formatDateLong, formatMoney, formatTime } from '../lib/utils';

const INDEX = [
  ['venue', 'Venue & Map'],
  ['tickets', 'Tickets'],
  ['dress', 'Dress Code'],
  ['dining', 'Food'],
  ['travel', 'Getting There'],
  ['parking', 'Parking'],
  ['instructions', 'Important'],
  ['faq', 'Questions'],
];

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <div className={`faq ${open ? 'is-open' : ''}`}>
      <h3>
        <button className="faq__q" aria-expanded={open} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setOpen((o) => !o)}>
          <span className="mono gold">{String(i + 1).padStart(2, '0')}</span>
          <span>{q}</span>
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
            <p className="faq__a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventInfo() {
  const { data } = useStore();
  const e = data.event;
  usePageTitle('The Event');
  const facts = [
    { icon: Clock, label: 'Date & Time', value: formatDateLong(e.date), sub: `${formatTime(e.startTime)} — ${formatTime(e.endTime)}` },
    { icon: MapPin, label: 'Venue', value: e.venue, sub: `${e.city}, ${e.country}` },
    { icon: Shirt, label: 'Dress Code', value: e.dressCode, sub: 'A touch of navy or gold' },
    { icon: Ticket, label: 'Alumni Ticket', value: formatMoney(e.ticketAlumni, e.currency), sub: `Guests ${formatMoney(e.ticketGuest, e.currency)}` },
  ];
  return (
    <>
      <PageHeader num="III" kicker="The Event" title={[<>Everything you</>, <><em className="gold-on-dark">need to know.</em></>]} image={unsplash(PHOTO.audience, 1800)}
        intro={e.description} />

      <section className="facts-band on-paper-deep">
        <div className="container facts-band__grid">
          {facts.map((f, i) => (
            <Reveal key={f.label} className="fact" delay={i * .06}>
              <f.icon size={20} className="gold" aria-hidden="true" />
              <p className="label muted">{f.label}</p>
              <p className="fact__value">{f.value}</p>
              <p className="ui fact__sub">{f.sub}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section on-paper grain">
        <div className="container info-layout">
          <nav className="info-index" aria-label="On this page">
            <p className="label muted">On this page</p>
            <ol>
              {INDEX.map(([id, label], i) => (
                <li key={id}><a href={`#${id}`}><span className="mono">{String(i + 1).padStart(2, '0')}</span>{label}</a></li>
              ))}
            </ol>
            <Link to="/register" className="btn btn--block">Register now</Link>
          </nav>

          <div className="info-body">
            <section id="venue" className="info-sec">
              <Eyebrow num="01">Venue & Map</Eyebrow>
              <h2 className="h2">{e.venue}</h2>
              <p className="info-lead">{e.address}, {e.city}, {e.country}</p>
              <div className="map-frame">
                <iframe title={`Map showing ${e.venue}`} src={`https://www.google.com/maps?q=${encodeURIComponent(e.mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <a className="map-frame__link mono" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapQuery)}`} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
              </div>
            </section>

            <section id="tickets" className="info-sec">
              <Eyebrow num="02">Tickets</Eyebrow>
              <div className="ticket-tiers">
                <div className="tier">
                  <p className="label muted">Alumni</p>
                  <p className="tier__price display">{formatMoney(e.ticketAlumni, e.currency)}</p>
                  <p className="ui muted">Per former student</p>
                </div>
                <div className="tier tier--alt">
                  <p className="label muted">Guest</p>
                  <p className="tier__price display">{formatMoney(e.ticketGuest, e.currency)}</p>
                  <p className="ui muted">Partners & family, up to {data.registration.maxGuests}</p>
                </div>
              </div>
              <ul className="ticks">
                {e.ticketIncludes.map((t) => <li key={t}><Check size={16} aria-hidden="true" />{t}</li>)}
              </ul>
            </section>

            <section id="dress" className="info-sec">
              <Eyebrow num="03">Dress Code</Eyebrow>
              <h2 className="h2"><em>{e.dressCode}</em></h2>
              <p className="info-text">{e.dressCodeNote}</p>
            </section>

            <section id="dining" className="info-sec info-sec--icon">
              <Eyebrow num="04">Food Arrangements</Eyebrow>
              <p className="info-text"><UtensilsCrossed size={20} className="gold inline-ico" aria-hidden="true" />{e.food}</p>
            </section>

            <section id="travel" className="info-sec">
              <Eyebrow num="05">Getting There</Eyebrow>
              <p className="info-text"><Bus size={20} className="gold inline-ico" aria-hidden="true" />{e.transport}</p>
            </section>

            <section id="parking" className="info-sec">
              <Eyebrow num="06">Parking</Eyebrow>
              <p className="info-text"><Car size={20} className="gold inline-ico" aria-hidden="true" />{e.parking}</p>
            </section>

            <section id="instructions" className="info-sec">
              <Eyebrow num="07">Important Instructions</Eyebrow>
              <ol className="instructions">
                {e.instructions.map((t, i) => <li key={i}><span className="display">{String(i + 1).padStart(2, '0')}</span><p>{t}</p></li>)}
              </ol>
            </section>

            <section id="faq" className="info-sec">
              <Eyebrow num="08">Frequently Asked</Eyebrow>
              <h2 className="h2">Questions, <em>answered.</em></h2>
              <div className="faqs">
                {e.faqs.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} i={i} />)}
              </div>
              <p className="ui muted" style={{ marginTop: '2rem' }}>Something else? <Link to="/contact" className="link-arrow" style={{ marginLeft: '.5rem' }}>Ask the committee <ArrowRight /></Link></p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
