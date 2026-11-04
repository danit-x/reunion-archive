import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, CheckCircle2, HelpCircle, MapPin, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Modal } from '../components/feedback';
import { Empty, Img, PageHeader } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { SECTIONS } from '../data/seed';
import { useStore } from '../data/store';
import type { Registration } from '../data/types';
import { usePageTitle } from '../lib/hooks';
import { batchesFor, initials } from '../lib/utils';

type Sort = 'az' | 'za' | 'batch-asc' | 'batch-desc';

/** Public, privacy-safe projection: never exposes email or phone. */
const publicProfile = (r: Registration) => ({
  id: r.id, name: r.fullName, batch: r.batch, section: r.section, occupation: r.occupation, city: r.city, photo: r.photo, bio: r.bio, confirmed: r.status === 'confirmed' && r.intent === 'yes',
});
type PublicProfile = ReturnType<typeof publicProfile>;

function Portrait({ p, size = 'card' }: { p: PublicProfile; size?: 'card' | 'large' }) {
  if (p.photo) return <Img src={p.photo} alt={`Portrait of ${p.name}`} ratio={size === 'card' ? '4/5' : '1/1'} sizes="300px" />;
  return <div className="portrait-fallback" style={{ aspectRatio: size === 'card' ? '4/5' : '1/1' }} aria-hidden="true"><span className="display">{initials(p.name)}</span></div>;
}

export default function Attendees() {
  const { data } = useStore();
  usePageTitle('Attendees');
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [batch, setBatch] = useState('all');
  const [section, setSection] = useState('all');
  const [sort, setSort] = useState<Sort>('az');

  const all = useMemo(() => data.registrations.filter((r) => r.showInDirectory && r.status !== 'cancelled').map(publicProfile), [data.registrations]);
  const sections = useMemo(() => Array.from(new Set([...SECTIONS, ...all.map((a) => a.section)])).sort(), [all]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = all.filter((p) =>
      (!needle || p.name.toLowerCase().includes(needle)) &&
      (batch === 'all' || p.batch === Number(batch)) &&
      (section === 'all' || p.section === section));
    const cmp: Record<Sort, (a: PublicProfile, b: PublicProfile) => number> = {
      az: (a, b) => a.name.localeCompare(b.name),
      za: (a, b) => b.name.localeCompare(a.name),
      'batch-asc': (a, b) => a.batch - b.batch || a.name.localeCompare(b.name),
      'batch-desc': (a, b) => b.batch - a.batch || a.name.localeCompare(b.name),
    };
    return out.sort(cmp[sort]);
  }, [all, q, batch, section, sort]);

  const profileId = params.get('profile');
  const profile = all.find((p) => p.id === profileId) ?? null;
  const openProfile = (id: string) => { const n = new URLSearchParams(params); n.set('profile', id); setParams(n, { replace: true }); };
  const closeProfile = () => { const n = new URLSearchParams(params); n.delete('profile'); setParams(n, { replace: true }); };
  const filtersOn = q || batch !== 'all' || section !== 'all';
  const batchCount = new Set(all.map((a) => a.batch)).size;
  const classmates = profile ? all.filter((p) => p.batch === profile.batch && p.id !== profile.id).slice(0, 4) : [];

  return (
    <>
      <PageHeader num="VI" kicker="The Classmates Directory" title={[<>Faces you</>, <><em className="gold-on-dark">haven’t forgotten.</em></>]} image={unsplash(PHOTO.friendsGroup, 1800)}
        intro={<>{all.length} alumni from {batchCount} batches have added themselves to the directory. Contact details are never shown publicly.</>} />

      <section className="section on-paper grain directory">
        <div className="container">
          <div className="dir-tools" role="search">
            <label className="dir-search">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search by name</span>
              <input type="search" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && <button onClick={() => setQ('')} aria-label="Clear search"><X size={16} /></button>}
            </label>
            <label className="dir-select"><span className="label">Batch</span>
              <select className="select" value={batch} onChange={(e) => setBatch(e.target.value)}>
                <option value="all">All batches</option>
                {batchesFor(data.event).map((b) => <option key={b} value={b}>Class of {b}</option>)}
              </select>
            </label>
            <label className="dir-select"><span className="label">Class</span>
              <select className="select" value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="all">All classes</option>
                {sections.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="dir-select"><span className="label">Sort</span>
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="az">Name A–Z</option>
                <option value="za">Name Z–A</option>
                <option value="batch-asc">Batch, oldest first</option>
                <option value="batch-desc">Batch, newest first</option>
              </select>
            </label>
          </div>
          <div className="dir-summary">
            <p className="mono" aria-live="polite">Showing {list.length} of {all.length}</p>
            {filtersOn && <button className="link-arrow" onClick={() => { setQ(''); setBatch('all'); setSection('all'); }}>Clear filters</button>}
          </div>

          {list.length === 0 ? (
            <Empty title="No classmates match that search" action={<button className="btn btn--line btn--sm" onClick={() => { setQ(''); setBatch('all'); setSection('all'); }}>Reset filters</button>}>
              They may not have registered yet — why not send them the link?
            </Empty>
          ) : (
            <motion.ul layout className="dir-grid">
              <AnimatePresence mode="popLayout">
                {list.map((p) => (
                  <motion.li layout key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .5, ease: [0.22, 1, 0.36, 1] }}>
                    <button className="person" onClick={() => openProfile(p.id)} aria-label={`View profile of ${p.name}`}>
                      <div className="person__photo">
                        <Portrait p={p} />
                        <span className="person__batch mono">’{String(p.batch).slice(2)}</span>
                      </div>
                      <span className="person__name">{p.name}</span>
                      <span className="person__meta ui">{p.section} · Class of {p.batch}</span>
                      {p.occupation && <span className="person__job">{p.occupation}</span>}
                      <span className={`person__status ui ${p.confirmed ? 'is-yes' : ''}`}>
                        {p.confirmed ? <><CheckCircle2 size={13} /> Attending</> : <><HelpCircle size={13} /> To be confirmed</>}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}

          <div className="dir-join">
            <p className="h3">Not in the directory yet?</p>
            <p className="ui muted">Register for the reunion and choose to appear here — only your name, batch, class and occupation are shown.</p>
            <Link to="/register" className="btn">Register & join the directory</Link>
          </div>
        </div>
      </section>

      <Modal open={!!profile} onClose={closeProfile} title="Alumni profile" wide>
        {profile && (
          <div className="profile">
            <div className="profile__photo"><Portrait p={profile} size="large" /></div>
            <div className="profile__body">
              <p className="mono gold">Class of {profile.batch} · {profile.section}</p>
              <h3 className="h1 profile__name">{profile.name}</h3>
              <ul className="profile__facts ui">
                {profile.occupation && <li><Briefcase size={15} /> {profile.occupation}</li>}
                {profile.city && <li><MapPin size={15} /> Lives in {profile.city}</li>}
                <li>{profile.confirmed ? <><CheckCircle2 size={15} className="gold" /> Confirmed for the reunion</> : <><HelpCircle size={15} /> Attendance to be confirmed</>}</li>
              </ul>
              {profile.bio && <blockquote className="profile__bio">“{profile.bio}”</blockquote>}
              {classmates.length > 0 && (
                <div className="profile__mates">
                  <p className="label muted">Also from {profile.batch}</p>
                  <div>
                    {classmates.map((c) => (
                      <button key={c.id} className="mate" onClick={() => openProfile(c.id)}>
                        {c.photo ? <img src={c.photo} alt="" /> : <span className="mate__ini">{initials(c.name)}</span>}
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="profile__privacy mono">Contact details are private. Reach out via the committee to reconnect.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
