import { CalendarPlus, Download, Printer, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useToast } from '../components/feedback';
import { Empty, Eyebrow, LineReveal, Reveal } from '../components/primitives';
import Ticket from '../components/Ticket';
import { useStore } from '../data/store';
import { usePageTitle } from '../lib/hooks';
import { downloadIcs, downloadTicketPdf } from '../lib/ticketPdf';
import { formatDateLong, formatTime } from '../lib/utils';

export default function Confirmation() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { data, user } = useStore();
  const toast = useToast();
  const [pdfBusy, setPdfBusy] = useState(false);
  const fresh = pathname.startsWith('/register/confirmed');
  const reg = data.registrations.find((r) => r.id === id);
  usePageTitle(fresh ? 'Registration confirmed' : 'Archive pass');
  const e = data.event;

  if (!reg) {
    return (
      <section className="section on-dark" style={{ paddingTop: 'calc(var(--nav-h) + 6rem)' }}>
        <div className="container">
          <Empty title="We couldn’t find that registration" action={<Link to="/register" className="btn btn--gold btn--sm">Register</Link>}>
            Check the registration ID, or contact the committee if you believe this is a mistake.
          </Empty>
        </div>
      </section>
    );
  }

  const pdf = async () => {
    setPdfBusy(true);
    try { await downloadTicketPdf(reg, e, data.event.schoolName); toast('Your archive pass PDF has been downloaded.'); }
    catch { toast('PDF generation failed — try printing instead.', 'error'); }
    finally { setPdfBusy(false); }
  };
  const first = reg.fullName.split(' ')[0];

  return (
    <>
      <header className="confirm-head on-dark grain grain--dark no-print">
        <div className="container confirm-head__inner">
          <Eyebrow num={reg.id} className="gold-on-dark">{fresh ? 'Registration complete' : 'Your archive pass'}</Eyebrow>
          <LineReveal as="h1" className="display confirm-head__title" lines={fresh ? [<>Welcome back,</>, <><em className="gold-on-dark">{first}.</em></>] : [<>Archive pass</>, <><em className="gold-on-dark">for {first}.</em></>]} />
          <Reveal delay={.3} className="lead confirm-head__lead">
            {fresh
              ? <>Your place at {e.eventTitle} is {reg.status === 'confirmed' ? 'confirmed' : 'reserved and awaiting confirmation by the committee'}. We’ve saved your registration — keep the ID below safe.</>
              : <>Status: <strong>{reg.status}</strong>. Present this pass at the registration desk on the day.</>}
          </Reveal>
        </div>
      </header>

      <section className="section on-paper grain confirm-body">
        <div className="container">
          <Reveal className="ticket-wrap print-area">
            <Ticket reg={reg} event={e} schoolName={data.event.schoolName} />
          </Reveal>

          <div className="ticket-actions no-print">
            <button className="btn" onClick={() => window.print()}><Printer size={16} /> Print pass</button>
            <button className="btn btn--gold" onClick={pdf} disabled={pdfBusy}>{pdfBusy ? <><span className="spinner" /> Preparing…</> : <><Download size={16} /> Download PDF</>}</button>
            <button className="btn btn--line" onClick={() => downloadIcs(e, reg)}><CalendarPlus size={16} /> Add to calendar</button>
            <Link className="btn btn--line" to={user ? '/account' : '/account/signup'}><UserRound size={16} /> {user ? 'My account' : 'Create an account'}</Link>
          </div>

          <div className="confirm-details no-print">
            <div>
              <p className="label muted">Registration ID</p>
              <p className="confirm-id mono">{reg.id}</p>
              <p className="ui muted">Quote this ID in any correspondence with the committee.</p>
            </div>
            <dl className="confirm-dl">
              <div><dt className="label muted">Date</dt><dd>{formatDateLong(e.date)}</dd></div>
              <div><dt className="label muted">Time</dt><dd>{formatTime(e.startTime)} — {formatTime(e.endTime)}</dd></div>
              <div><dt className="label muted">Venue</dt><dd>{e.venue}, {e.city}</dd></div>
              <div><dt className="label muted">Dress code</dt><dd>{e.dressCode}</dd></div>
              <div><dt className="label muted">Guests</dt><dd>{reg.guests || 'None'}</dd></div>
              <div><dt className="label muted">Directory</dt><dd>{reg.showInDirectory ? 'Listed' : 'Hidden'}</dd></div>
            </dl>
            <div className="confirm-next">
              <p className="label muted">What happens next</p>
              <ol className="ui">
                <li>{reg.status === 'confirmed' ? 'Your place is confirmed.' : 'The committee will review and confirm your place.'}</li>
                <li>Watch the <Link to="/announcements" className="underline">announcements</Link> for updates.</li>
                <li>Share a photo in the <Link to="/memories" className="underline">memories archive</Link>.</li>
                <li>Bring this pass on {formatDateLong(e.date)}.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
