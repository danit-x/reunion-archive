import { MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, PageHeader, Reveal } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import type { ScheduleCategory } from '../data/types';
import { usePageTitle } from '../lib/hooks';
import { cx, formatDateLong, formatTime } from '../lib/utils';

const CATS: (ScheduleCategory | 'All')[] = ['All', 'Arrival', 'Ceremony', 'Community', 'Photography', 'Dining', 'Entertainment'];

export default function Schedule() {
  const { data } = useStore();
  usePageTitle('Schedule');
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const items = useMemo(() => [...data.schedule].sort((a, b) => a.time.localeCompare(b.time)), [data.schedule]);
  const shown = cat === 'All' ? items : items.filter((i) => i.category === cat);
  return (
    <>
      <PageHeader num="IV" kicker="The Schedule" title={[<>The order</>, <><em className="gold-on-dark">of the day.</em></>]} image={unsplash(PHOTO.lectureHall, 1800)}
        intro={<>{formatDateLong(data.event.date)} · {formatTime(data.event.startTime)} to {formatTime(data.event.endTime)} · {data.event.venue}</>} />
      <section className="section on-paper grain">
        <div className="container">
          <div className="filter-bar" role="toolbar" aria-label="Filter by activity type">
            {CATS.map((c) => (
              <button key={c} className={cx('chip', cat === c && 'is-active')} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          {shown.length === 0 ? (
            <Empty title="Nothing in this category yet">Try another activity type, or view the whole day.</Empty>
          ) : (
            <ol className="timeline">
              {shown.map((s, i) => (
                <Reveal as="li" key={s.id} className="tl" delay={Math.min(i, 4) * .05}>
                  <div className="tl__time">
                    <span className="tl__clock display">{formatTime(s.time).slice(0, 5)}</span>
                    <span className="mono">{formatTime(s.time).slice(6)}{s.endTime ? ` — ${formatTime(s.endTime)}` : ''}</span>
                  </div>
                  <div className="tl__dot" aria-hidden="true"><span /></div>
                  <div className="tl__body">
                    <span className="badge badge--gold badge--plain">{s.category}</span>
                    <h2 className="h3 tl__title">{s.title}</h2>
                    <p>{s.description}</p>
                    {s.location && <p className="tl__loc ui"><MapPin size={14} aria-hidden="true" /> {s.location}</p>}
                  </div>
                </Reveal>
              ))}
            </ol>
          )}
          <div className="schedule-foot">
            <p className="ui muted">Timings may be refined before the day. Changes are posted to <Link to="/announcements" className="underline">announcements</Link>.</p>
            <Link to="/register" className="btn">Reserve your place</Link>
          </div>
        </div>
      </section>
    </>
  );
}
