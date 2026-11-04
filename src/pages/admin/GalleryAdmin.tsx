import { Check, ImagePlus, Pencil, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Modal, useConfirm, useToast } from '../../components/feedback';
import { Empty, Field } from '../../components/primitives';
import { GALLERY_CATEGORIES } from '../../data/seed';
import { useStore } from '../../data/store';
import type { GalleryCategory, GalleryImage } from '../../data/types';
import { cx, fileToDataUrl, uid } from '../../lib/utils';
import { AdminHeader, Panel } from './ui';

const RATIOS: GalleryImage['ratio'][] = ['3/4', '4/5', '1/1', '4/3', '3/2', '16/10'];
const blank = (): GalleryImage => ({ id: '', src: '', caption: '', year: String(new Date().getFullYear()), category: 'School Days', ratio: '4/3', status: 'published' });

function ImageForm({ img, onSave, onCancel }: { img: GalleryImage; onSave: (i: GalleryImage) => void; onCancel: () => void }) {
  const [f, setF] = useState(img);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.src) er.src = 'Upload an image or paste an image URL.';
    else if (!/^(https?:\/\/|data:image\/)/.test(f.src)) er.src = 'The image URL must start with http(s)://';
    if (f.caption.trim().length < 4) er.caption = 'Write a caption.';
    if (!/^\d{4}$/.test(f.year)) er.year = 'Four-digit year.';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...f, caption: f.caption.trim() });
  };
  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <div className="span-2 a-img-src">
        {f.src ? <img src={f.src} alt="Preview" style={{ aspectRatio: f.ratio }} /> : <div className="a-img-src__empty"><ImagePlus size={28} /></div>}
        <div className="a-img-src__ctl">
          <label className="btn btn--line btn--sm">{busy ? <span className="spinner" /> : 'Upload file'}<input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); try { setF({ ...f, src: await fileToDataUrl(file) }); setErr({ ...err, src: '' }); } catch (x) { setErr({ ...err, src: (x as Error).message }); } finally { setBusy(false); } }} /></label>
          <Field label="…or image URL" id="gi-url" error={err.src}><input id="gi-url" className="input" placeholder="https://…" value={f.src.startsWith('data:') ? '' : f.src} onChange={(e) => setF({ ...f, src: e.target.value.trim() })} /></Field>
        </div>
      </div>
      <Field label="Caption" id="gi-cap" required error={err.caption} className="span-2"><input id="gi-cap" className="input" value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} /></Field>
      <Field label="Category" id="gi-cat"><select id="gi-cat" className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as GalleryCategory })}>{GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Year" id="gi-year" error={err.year}><input id="gi-year" className="input" inputMode="numeric" maxLength={4} value={f.year} onChange={(e) => setF({ ...f, year: e.target.value.replace(/\D/g, '') })} /></Field>
      <Field label="Crop ratio" id="gi-ratio"><select id="gi-ratio" className="select" value={f.ratio} onChange={(e) => setF({ ...f, ratio: e.target.value as GalleryImage['ratio'] })}>{RATIOS.map((r) => <option key={r}>{r}</option>)}</select></Field>
      <Field label="Status" id="gi-status"><select id="gi-status" className="select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as GalleryImage['status'] })}><option value="published">Published</option><option value="pending">Pending review</option></select></Field>
      <div className="span-2 form-actions"><button type="button" className="btn btn--line btn--sm" onClick={onCancel}>Cancel</button><button className="btn btn--gold btn--sm" disabled={busy}>{img.id ? 'Save changes' : 'Add to archive'}</button></div>
    </form>
  );
}

export default function GalleryAdmin() {
  const { data, update } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'published' | 'pending'>(() => (data.gallery.some((g) => g.status === 'pending') ? 'pending' : 'published'));
  const [cat, setCat] = useState<GalleryCategory | 'All'>('All');
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const items = data.gallery.filter((g) => g.status === tab && (cat === 'All' || g.category === cat));
  const pendingCount = data.gallery.filter((g) => g.status === 'pending').length;
  const patch = (id: string, p: Partial<GalleryImage>) => update((d) => ({ ...d, gallery: d.gallery.map((g) => (g.id === id ? { ...g, ...p } : g)) }));
  const del = async (g: GalleryImage) => {
    if (await confirm({ title: 'Delete photograph?', message: `“${g.caption}” will be permanently removed from the archive.`, confirmLabel: 'Delete', danger: true })) {
      update((d) => ({ ...d, gallery: d.gallery.filter((x) => x.id !== g.id) })); toast('Photograph deleted.');
    }
  };

  return (
    <>
      <AdminHeader kicker="Archive" title="Memories gallery">
        <button className="btn btn--gold btn--sm" onClick={() => setEditing(blank())}><ImagePlus size={15} /> Add image</button>
      </AdminHeader>
      <div className="a-tabs">
        <button className={tab === 'published' ? 'is-active' : ''} aria-pressed={tab === 'published'} onClick={() => setTab('published')}>Published <span>{data.gallery.length - pendingCount}</span></button>
        <button className={tab === 'pending' ? 'is-active' : ''} aria-pressed={tab === 'pending'} onClick={() => setTab('pending')}>Awaiting review <span>{pendingCount}</span></button>
      </div>
      <Panel>
        <div className="a-cat-chips" role="toolbar" aria-label="Filter by category">
          {(['All', ...GALLERY_CATEGORIES] as const).map((c) => (
            <button key={c} className={cx('chip', cat === c && 'is-active')} aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c} <span className="mono">{c === 'All' ? data.gallery.filter((g) => g.status === tab).length : data.gallery.filter((g) => g.status === tab && g.category === c).length}</span>
            </button>
          ))}
        </div>
        {items.length === 0 ? <Empty title={tab === 'pending' ? 'Nothing waiting for review' : 'No images in this category'}>{tab === 'pending' ? 'Photographs submitted on the Memories page appear here.' : 'Add an image to get started.'}</Empty> : (
          <ul className="a-gallery">
            {items.map((g) => (
              <li key={g.id}>
                <div className="a-gallery__img"><img src={g.src} alt={g.caption} loading="lazy" /></div>
                <div className="a-gallery__body">
                  <span className="a-sub">{g.year}{g.submittedBy ? ` · from ${g.submittedBy}` : ''}</span>
                  <p>{g.caption}</p>
                  <select className="select a-select a-select--sm" value={g.category} aria-label="Category" onChange={(e) => { patch(g.id, { category: e.target.value as GalleryCategory }); toast('Category updated.'); }}>
                    {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="a-gallery__actions">
                  {g.status === 'pending' ? (
                    <>
                      <button className="btn btn--gold btn--sm" onClick={() => { patch(g.id, { status: 'published' }); toast('Photograph approved and published.'); }}><Check size={14} /> Approve</button>
                      <button className="btn btn--line btn--sm" onClick={() => del(g)}><X size={14} /> Reject</button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" onClick={() => setEditing(g)} aria-label={`Edit ${g.caption}`}><Pencil size={16} /></button>
                      <button className="icon-btn icon-btn--danger" onClick={() => del(g)} aria-label={`Delete ${g.caption}`}><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit image' : 'Add image'} wide>
        {editing && <ImageForm img={editing} onCancel={() => setEditing(null)} onSave={(img) => {
          update((d) => ({ ...d, gallery: img.id ? d.gallery.map((g) => (g.id === img.id ? img : g)) : [{ ...img, id: uid('g_') }, ...d.gallery] }));
          toast(img.id ? 'Image updated.' : 'Image added to the archive.');
          setEditing(null);
        }} />}
      </Modal>
    </>
  );
}
