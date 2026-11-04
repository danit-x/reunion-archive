import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Children, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { srcSetFor } from '../data/images';
import { cx, eventStart } from '../lib/utils';
import type { EventDetails } from '../data/types';

/* ── Logo ─────────────────────────────────────────────────── */
export function Logo({ tone = 'light', compact = false }: { tone?: 'light' | 'dark'; compact?: boolean }) {
  const ink = tone === 'light' ? 'var(--ivory-100)' : 'var(--ink-900)';
  return (
    <span className="logo" style={{ color: ink }}>
      <svg viewBox="0 0 56 56" width="44" height="44" aria-hidden="true" className="logo__seal">
        <circle cx="28" cy="28" r="26.5" fill="none" stroke="var(--gold-400)" strokeWidth="1" />
        <circle cx="28" cy="28" r="22.5" fill="none" stroke="var(--gold-400)" strokeWidth=".6" strokeDasharray="1.2 2.2" />
        <path id="arc" d="M 9 28 A 19 19 0 0 1 47 28" fill="none" />
        <text fontFamily="IBM Plex Mono, monospace" fontSize="4.6" letterSpacing="1.3" fill="var(--gold-300)">
          <textPath href="#arc" startOffset="50%" textAnchor="middle">MMX — MMXX</textPath>
        </text>
        <text x="28" y="37" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="21" fill="currentColor">RA</text>
      </svg>
      {!compact && (
        <span className="logo__type">
          <span className="logo__the">The</span>
          <span className="logo__name">Reunion Archive</span>
        </span>
      )}
    </span>
  );
}

/* ── Motion helpers ───────────────────────────────────────── */
const easeOut = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'section' | 'li' | 'figure' | 'article' }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: reduce ? 0.3 : 1, ease: easeOut, delay }}
    >
      {children}
    </MotionTag>
  );
}

const staggerParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeOut } },
};
export function Stagger({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'ul' | 'ol' }) {
  const M = motion[as];
  return (
    <M className={className} variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>
      {Children.map(children, (c) => (as === 'div' ? <motion.div variants={staggerChild}>{c}</motion.div> : c))}
    </M>
  );
}
export const staggerItem = staggerChild;

/** Masked line reveal for display headlines */
export function LineReveal({ lines, className, delay = 0, as: Tag = 'h2' }: { lines: ReactNode[]; className?: string; delay?: number; as?: 'h1' | 'h2' | 'p' }) {
  const reduce = useReducedMotion();
  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask">
          <motion.span
            className="line-mask__inner"
            initial={reduce ? { opacity: 0 } : { y: '105%' }}
            whileInView={reduce ? { opacity: 1 } : { y: '0%' }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 1.1, ease: easeOut, delay: delay + i * 0.1 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ── Image ────────────────────────────────────────────────── */
export function Img({ src, alt, sizes = '100vw', className, eager = false, ratio }: { src: string; alt: string; sizes?: string; className?: string; eager?: boolean; ratio?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cx('photo', className, loaded && 'is-loaded')} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img
        src={src}
        srcSet={srcSetFor(src)}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity .8s ease, filter 1s var(--ease-out), transform 1.4s var(--ease-out)' }}
      />
    </div>
  );
}

/* ── Eyebrow ─────────────────────────────────────────────── */
export function Eyebrow({ num, children, className }: { num?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cx('eyebrow label', className)}>
      {num && <span className="eyebrow__num">{num}</span>}
      <span className="eyebrow__rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function ArrowLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={cx('link-arrow', className)}>
      {children} <ArrowRight aria-hidden="true" />
    </Link>
  );
}

/* ── Page header used by inner pages ─────────────────────── */
export function PageHeader({ num, kicker, title, intro, image, children }: { num: string; kicker: string; title: ReactNode[]; intro?: ReactNode; image?: string; children?: ReactNode }) {
  return (
    <header className={cx('page-header on-dark grain grain--dark', image && 'page-header--image')}>
      {image && (
        <div className="page-header__bg" aria-hidden="true">
          <img src={image} alt="" />
        </div>
      )}
      <div className="container page-header__inner">
        <Eyebrow num={num} className="gold-on-dark">{kicker}</Eyebrow>
        <LineReveal as="h1" className="display page-header__title" lines={title} />
        {intro && (
          <Reveal delay={0.3} className="page-header__intro lead">
            {intro}
          </Reveal>
        )}
        {children}
      </div>
    </header>
  );
}

/* ── Countdown ───────────────────────────────────────────── */
export function useCountdown(e: EventDetails) {
  const target = eventStart(e).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export const pad = (n: number) => String(n).padStart(2, '0');

/* ── Form field ──────────────────────────────────────────── */
export function Field({ label, id, required, optional, hint, error, children, className }: { label: string; id: string; required?: boolean; optional?: boolean; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('field', error && 'field--invalid', className)}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__req" aria-hidden="true">*</span>}
        {optional && <span className="field__opt">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${id}-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty__mark" aria-hidden="true">—&thinsp;∅&thinsp;—</span>
      <h3 className="h3">{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
