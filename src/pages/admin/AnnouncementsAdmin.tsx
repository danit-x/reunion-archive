import { ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Modal, useConfirm, useToast } from '../../components/feedback';
import { Empty, Field } from '../../components/primitives';
import { useStore } from '../../data/store';
import type { Announcement, AnnouncementCategory } from '../../data/types';
import { cx, formatDateShort, uid } from '../../lib/utils';
import { AdminHeader, Panel } from './ui';

const CATS: AnnouncementCategory[] = ['Registration', 'Event', 'Logistics', 'Community'];
const blank = (): Announcement => ({ id: '', title: '', excerpt: '', body: '', date: new Date().toISOString().slice(0, 10), category: 'Event', featured: false });

function AnnouncementForm({ a, onSave, onCancel }: { a: Announcement; onSave: (a: Announcement) => void; onCancel: () => void }) {
  const [f, setF] = useState(a);
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.title.trim().length < 4) er.title = 'Title must be at least 4 characters.';
    if (f.excerpt.trim().length < 10) er.excerpt = 'Write a one-line summary (10+ characters).';
    if (f.body.trim().length < 20) er.body = 'The announcement body is too short.';
    if (!f.date) er.date = 'Choose a publication date.';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...f, title: f.title.trim(), excerpt: f.excerpt.trim(), body: f.body.trim() });
  };
  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Field label="Title" id="an-title" required error={err.title} className="span-2"><input id="an-title" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Category" id="an-cat"><select id="an-cat" className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as AnnouncementCategory })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Publication date" id="an-date" required error={err.date}><input id="an-date" type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      <Field label="Summary" id="an-ex" required error={err.excerpt} className="span-2"><input id="an-ex" className="input" value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} maxLength={180} /></Field>
      <Field label="Full announcement" id="an-body" required error={err.body} className="span-2" hint="Separate paragraphs with a blank line."><textarea id="an-body" className="textarea" rows={7} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      <label className="switch span-2"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /><span className="switch__track" />Feature this announcement (replaces the current featured one)</label>
      <div className="span-2 form-actions"><button type="button" className="btn btn--line btn--sm" onClick={onCancel}>Cancel</button><button className="btn btn--gold btn--sm">{a.id ? 'Save changes' : 'Publish announcement'}</button></div>
    </form>
  );
}

export default function AnnouncementsAdmin() {
  const { data, update } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [cat, setCat] = useState<AnnouncementCategory | 'All'>('All');
  useEffect(() => { if (params.get('new')) { setEditing(blank()); setParams({}, { replace: true }); } }, [params, setParams]);
  const list = [...data.announcements].filter((a) => cat === 'All' || a.category === cat).sort((a, b) => b.date.localeCompare(a.date));

  const save = (a: Announcement) => {
    const id = a.id || uid('a_');
    update((d) => {
      let anns = a.id ? d.announcements.map((x) => (x.id === a.id ? a : x)) : [{ ...a, id }, ...d.announcements];
      if (a.featured) anns = anns.map((x) => (x.id === id ? x : { ...x, featured: false }));
      return { ...d, announcements: anns };
    });
    toast(a.id ? 'Announcement updated.' : 'Announcement published to the public site.');
    setEditing(null);
  };
  const feature = (a: Announcement) => {
    update((d) => ({ ...d, announcements: d.announcements.map((x) => ({ ...x, featured: x.id === a.id ? !a.featured : false })) }));
    toast(a.featured ? 'No announcement is featured now.' : `“${a.title}” is now featured.`);
  };

  return (
    <>
      <AdminHeader kicker="Communicate" title="Announcements">
        <button className="btn btn--gold btn--sm" onClick={() => setEditing(blank())}><Plus size={15} /> New announcement</button>
      </AdminHeader>
      <div className="a-tabs">
        {(['All', ...CATS] as const).map((c) => <button key={c} className={cat === c ? 'is-active' : ''} aria-pressed={cat === c} onClick={() => setCat(c)}>{c} <span>{c === 'All' ? data.announcements.length : data.announcements.filter((a) => a.category === c).length}</span></button>)}
      </div>
      <Panel>
        {list.length === 0 ? <Empty title="No announcements" action={<button className="btn btn--sm" onClick={() => setEditing(blank())}>Write one</button>} /> : (
          <ul className="a-anns">
            {list.map((a) => (
              <li key={a.id} className={cx(a.featured && 'is-featured')}>
                <button className={cx('a-star', a.featured && 'is-on')} onClick={() => feature(a)} aria-pressed={a.featured} aria-label={a.featured ? 'Unfeature' : 'Mark as featured'}><Star size={18} /></button>
                <div className="a-anns__body">
                  <span className="a-sub"><span className="mono">{formatDateShort(a.date)}</span> · {a.category}{a.featured && ' · Featured'}</span>
                  <strong>{a.title}</strong>
                  <p>{a.excerpt}</p>
                </div>
                <div className="a-actions">
                  <Link to={`/announcements/${a.id}`} target="_blank" className="icon-btn" aria-label={`View ${a.title} on site`}><ExternalLink size={16} /></Link>
                  <button className="icon-btn" onClick={() => setEditing(a)} aria-label={`Edit ${a.title}`}><Pencil size={16} /></button>
                  <button className="icon-btn icon-btn--danger" aria-label={`Delete ${a.title}`} onClick={async () => {
                    if (await confirm({ title: 'Delete announcement?', message: `“${a.title}” will be removed from the public announcements page.`, confirmLabel: 'Delete', danger: true })) {
                      update((d) => ({ ...d, announcements: d.announcements.filter((x) => x.id !== a.id) })); toast('Announcement deleted.');
                    }
                  }}><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit announcement' : 'New announcement'} wide>
        {editing && <AnnouncementForm a={editing} onCancel={() => setEditing(null)} onSave={save} />}
      </Modal>
    </>
  );
}
