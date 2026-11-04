import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Upload } from 'lucide-react';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Lightbox from '../components/Lightbox';
import { Modal, useToast } from '../components/feedback';
import { Empty, Field, Img, PageHeader } from '../components/primitives';
import { PHOTO, unsplash } from '../data/images';
import { useStore } from '../data/store';
import type { GalleryCategory, GalleryImage } from '../data/types';
import { usePageTitle } from '../lib/hooks';
import { cx, fileToDataUrl, uid } from '../lib/utils';

import { GALLERY_CATEGORIES } from '../data/seed';

function SubmitPhoto({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { update, user } = useStore();
  const toast = useToast();
  const [src, setSrc] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('School Days');
  const [year, setYear] = useState('');
  const [name, setName] = useState(user?.fullName ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const reset = () => { setSrc(''); setCaption(''); setYear(''); setErrors({}); };

  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { setSrc(await fileToDataUrl(f, 1400)); setErrors((e) => ({ ...e, src: '' })); }
    catch (err) { setErrors((e) => ({ ...e, src: (err as Error).message })); }
    finally { setBusy(false); }
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!src) e.src = 'Please choose a photograph to upload.';
    if (caption.trim().length < 6) e.caption = 'Add a short caption (at least 6 characters).';
    if (!/^(19|20)\d{2}$/.test(year)) e.year = 'Enter a four-digit year, e.g. 2014.';
    if (!name.trim()) e.name = 'Let us know who is sharing this.';
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    const img: GalleryImage = { id: uid('g_'), src, caption: caption.trim(), category, year, ratio: '4/3', status: 'pending', submittedBy: name.trim() };
    update((d) => ({ ...d, gallery: [img, ...d.gallery] }));
    toast('Thank you! Your photograph has been sent to the committee for review.');
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit a photograph" wide>
      <form className="form-grid" onSubmit={submit} noValidate>
        <p className="ui muted span-2">Demo submission: images are stored in your browser and appear in the archive once an administrator approves them.</p>
        <div className={cx('dropzone span-2', errors.src && 'is-invalid')}>
          {src ? (
            <div className="dropzone__preview"><img src={src} alt="Preview of your upload" /><button type="button" className="btn btn--line btn--sm" onClick={() => setSrc('')}>Choose another</button></div>
          ) : (
            <label className="dropzone__label">
              <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
              {busy ? <span className="spinner" /> : <Upload size={26} aria-hidden="true" />}
              <span className="ui"><strong>Choose a photograph</strong> or drop it here</span>
              <span className="field__hint">JPG or PNG, up to 12 MB. We resize it for you.</span>
            </label>
          )}
          {errors.src && <p className="field__error" role="alert">{errors.src}</p>}
        </div>
        <Field label="Caption" id="sp-caption" required error={errors.caption} className="span-2">
          <input id="sp-caption" className="input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Sports meet, the 4×100 relay final" />
        </Field>
        <Field label="Category" id="sp-cat" required>
          <select id="sp-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)}>
            {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Year taken" id="sp-year" required error={errors.year}>
          <input id="sp-year" className="input" inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} placeholder="2014" />
        </Field>
        <Field label="Your name" id="sp-name" required error={errors.name} className="span-2">
          <input id="sp-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <div className="span-2 form-actions">
          <button type="button" className="btn btn--line" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--gold" disabled={busy}>Submit for review</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Memories() {
  const { data } = useStore();
  usePageTitle('Memories');
  const [params, setParams] = useSearchParams();
  const active = (params.get('category') as GalleryCategory | null) ?? 'All';
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const published = useMemo(() => data.gallery.filter((g) => g.status === 'published'), [data.gallery]);
  const shown = useMemo(() => (active === 'All' ? published : published.filter((g) => g.category === active)), [published, active]);
  const counts = useMemo(() => Object.fromEntries(GALLERY_CATEGORIES.map((c) => [c, published.filter((g) => g.category === c).length])), [published]);

  const setCat = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === 'All') next.delete('category'); else next.set('category', c);
    setParams(next, { replace: true });
  };
  const close = useCallback(() => setLightbox(null), []);

  return (
    <>
      <PageHeader num="V" kicker="The Memories Archive" title={[<>A curated</>, <><em className="gold-on-dark">collection of</em></>, <>who we were.</>]} image={unsplash(PHOTO.classroomChairs, 1800)}
        intro={<>{published.length} photographs across seven chapters — from the first morning assembly to the reunions that came after.</>}>
        <div><button className="btn btn--gold" onClick={() => setSubmitOpen(true)}><ImagePlus size={16} /> Submit a photograph</button></div>
      </PageHeader>

      <section className="section on-paper grain archive">
        <div className="container">
          <div className="archive__filters" role="toolbar" aria-label="Filter photographs by category">
            <button className={cx('archive__filter', active === 'All' && 'is-active')} aria-pressed={active === 'All'} onClick={() => setCat('All')}>
              All <sup className="mono">{published.length}</sup>
            </button>
            {GALLERY_CATEGORIES.map((c) => (
              <button key={c} className={cx('archive__filter', active === c && 'is-active')} aria-pressed={active === c} onClick={() => setCat(c)}>
                {c} <sup className="mono">{counts[c]}</sup>
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <Empty title="This drawer of the archive is empty" action={<button className="btn btn--line btn--sm" onClick={() => setSubmitOpen(true)}>Be the first to share one</button>}>
              No photographs in “{active}” yet.
            </Empty>
          ) : (
            <motion.div layout className="masonry">
              <AnimatePresence mode="popLayout">
                {shown.map((g, i) => (
                  <motion.figure layout key={g.id} className="masonry__item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .6, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * .03 }}>
                    <button className="masonry__btn" onClick={() => setLightbox(i)} aria-label={`Open photograph: ${g.caption}`}>
                      <Img src={g.src} alt={g.caption} ratio={g.ratio} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                      <span className="masonry__no mono">No. {String(published.indexOf(g) + 1).padStart(3, '0')}</span>
                    </button>
                    <figcaption className="masonry__cap">
                      <span className="mono">{g.category} · {g.year}</span>
                      <span>{g.caption}</span>
                    </figcaption>
                  </motion.figure>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <section className="archive-cta on-dark grain grain--dark">
        <div className="container archive-cta__inner">
          <p className="display archive-cta__t">Have a photograph<br /><em className="gold-on-dark">we’ve never seen?</em></p>
          <button className="btn btn--gold" onClick={() => setSubmitOpen(true)}><Upload size={16} /> Add it to the archive</button>
        </div>
      </section>

      <Lightbox images={shown} index={lightbox} onClose={close} onNavigate={setLightbox} />
      <SubmitPhoto open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </>
  );
}
