import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Empty, Eyebrow, LineReveal, Reveal } from '../components/primitives';
import { useStore } from '../data/store';
import { usePageTitle } from '../lib/hooks';
import { formatDateLong } from '../lib/utils';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { data } = useStore();
  const sorted = [...data.announcements].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sorted.findIndex((a) => a.id === id);
  const a = sorted[idx];
  usePageTitle(a?.title ?? 'Announcement');

  if (!a) {
    return (
      <section className="section on-dark" style={{ paddingTop: 'calc(var(--nav-h) + 6rem)' }}>
        <div className="container">
          <Empty title="Announcement not found" action={<Link to="/announcements" className="btn btn--line btn--sm">All announcements</Link>}>It may have been removed by the committee.</Empty>
        </div>
      </section>
    );
  }
  const newer = sorted[idx - 1];
  const older = sorted[idx + 1];
  return (
    <>
      <header className="article-head on-dark grain grain--dark">
        <div className="container article-head__inner">
          <Link to="/announcements" className="link-arrow"><ArrowLeft /> All announcements</Link>
          <Eyebrow num={a.category} className="gold-on-dark">{formatDateLong(a.date)}</Eyebrow>
          <LineReveal as="h1" className="display article-head__title" lines={[a.title]} />
        </div>
      </header>
      <article className="section on-paper grain">
        <div className="container article">
          <Reveal className="article__body prose">
            <p className="lead article__lede">{a.excerpt}</p>
            {a.body.split(/\n\n+/).map((p, i) => <p key={i} className={i === 0 ? 'dropcap' : ''}>{p}</p>)}
            <p className="mono muted article__sign">— {data.organizer.name}</p>
          </Reveal>
          <nav className="article__pager" aria-label="More announcements">
            {older ? <Link to={`/announcements/${older.id}`}><span className="mono"><ArrowLeft size={14} /> Earlier</span><span className="h3">{older.title}</span></Link> : <span />}
            {newer ? <Link to={`/announcements/${newer.id}`} className="is-next"><span className="mono">Later <ArrowRight size={14} /></span><span className="h3">{newer.title}</span></Link> : <span />}
          </nav>
        </div>
      </article>
    </>
  );
}
