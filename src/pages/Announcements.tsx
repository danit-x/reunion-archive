import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, PageHeader, Reveal } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import type { AnnouncementCategory } from '../data/types';
import { usePageTitle } from '../lib/hooks';
import { cx, formatDateShort } from '../lib/utils';

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = ['Registration', 'Event', 'Logistics', 'Community'];

export default function Announcements() {
  const { data } = useStore();
  usePageTitle('Announcements');
  const [cat, setCat] = useState<AnnouncementCategory | 'All'>('All');
  const sorted = useMemo(() => [...data.announcements].sort((a, b) => b.date.localeCompare(a.date)), [data.announcements]);
  const featured = sorted.find((a) => a.featured);
  const list = sorted.filter((a) => (cat === 'All' || a.category === cat) && a.id !== (cat === 'All' ? featured?.id : undefined));

  return (
    <>
      <PageHeader num="VII" kicker="Announcements" title={[<>News from</>, <><em className="gold-on-dark">the committee.</em></>]} image={unsplash(PHOTO.notebook, 1800)}
        intro="Dates, details and reminders — everything official about the reunion, as it happens." />

      <section className="section on-paper grain">
        <div className="container">
          {featured && cat === 'All' && (
            <Reveal>
              <Link to={`/announcements/${featured.id}`} className="news-feature">
                <div className="news-feature__tag"><span className="label">Featured</span><span className="mono">{formatDateShort(featured.date)}</span></div>
                <h2 className="display news-feature__title">{featured.title}</h2>
                <p className="lead news-feature__ex">{featured.excerpt}</p>
                <span className="link-arrow">Read announcement <ArrowRight /></span>
              </Link>
            </Reveal>
          )}

          <div className="filter-bar" role="toolbar" aria-label="Filter announcements">
            {(['All', ...ANNOUNCEMENT_CATEGORIES] as const).map((c) => (
              <button key={c} className={cx('chip', cat === c && 'is-active')} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {list.length === 0 ? (
            <Empty title="No announcements here yet">Check back soon — the committee posts updates regularly.</Empty>
          ) : (
            <ul className="news-list">
              {list.map((a, i) => (
                <Reveal as="li" key={a.id} delay={Math.min(i, 5) * .04}>
                  <Link to={`/announcements/${a.id}`} className="news-row">
                    <span className="news-row__date">
                      <span className="display">{new Date(a.date).getDate()}</span>
                      <span className="mono">{new Date(a.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                    </span>
                    <span className="news-row__body">
                      <span className="badge badge--gold badge--plain">{a.category}</span>
                      <span className="h3 news-row__title">{a.title}</span>
                      <span className="news-row__ex">{a.excerpt}</span>
                    </span>
                    <ArrowRight className="news-row__arrow" size={22} aria-hidden="true" />
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
