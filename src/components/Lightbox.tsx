import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GalleryImage } from '../data/types';

export default function Lightbox({ images, index, onClose, onNavigate }: { images: GalleryImage[]; index: number | null; onClose: () => void; onNavigate: (i: number) => void }) {
  const open = index !== null && images[index] !== undefined;
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(((index ?? 0) + 1) % images.length);
      if (e.key === 'ArrowLeft') onNavigate(((index ?? 0) - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prevFocus?.focus?.(); };
  }, [open, index, images.length, onClose, onNavigate]);

  const img = open ? images[index!] : null;
  return createPortal(
    <AnimatePresence>
      {img && (
        <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Photograph viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) onNavigate((index! + (dx < 0 ? 1 : -1) + images.length) % images.length);
            touchX.current = null;
          }}>
          <div className="lightbox__top">
            <span className="mono">{String(index! + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
            <button ref={closeRef} className="lightbox__btn" onClick={onClose} aria-label="Close viewer"><X size={22} /></button>
          </div>
          <div className="lightbox__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <button className="lightbox__btn lightbox__nav lightbox__nav--prev" onClick={() => onNavigate((index! - 1 + images.length) % images.length)} aria-label="Previous photograph"><ChevronLeft size={26} /></button>
            <AnimatePresence mode="wait">
              <motion.figure key={img.id} className="lightbox__fig" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .98 }} transition={{ duration: .35 }}>
                <img src={img.src.replace(/w=\d+/, 'w=1800')} alt={img.caption} />
                <figcaption>
                  <span className="mono">{img.category} · {img.year}</span>
                  <span className="lightbox__cap">{img.caption}</span>
                  {img.submittedBy && <span className="mono lightbox__by">Shared by {img.submittedBy}</span>}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <button className="lightbox__btn lightbox__nav lightbox__nav--next" onClick={() => onNavigate((index! + 1) % images.length)} aria-label="Next photograph"><ChevronRight size={26} /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
