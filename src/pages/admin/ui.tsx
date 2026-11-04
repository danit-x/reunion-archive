import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';
import type { RegistrationStatus, AttendanceMark } from '../../data/types';

export function AdminHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="a-head">
      <div>
        <p className="a-kicker">{kicker}</p>
        <h1 className="a-title">{title}</h1>
      </div>
      {children && <div className="a-head__actions">{children}</div>}
    </header>
  );
}

export function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: ReactNode; sub?: ReactNode; icon?: LucideIcon; tone?: 'gold' | 'green' | 'amber' | 'ink' }) {
  return (
    <div className={cx('a-stat', tone && `a-stat--${tone}`)}>
      <div className="a-stat__top">
        <span className="a-stat__label">{label}</span>
        {Icon && <Icon size={17} aria-hidden="true" />}
      </div>
      <span className="a-stat__value">{value}</span>
      {sub && <span className="a-stat__sub">{sub}</span>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('a-panel', className)}>
      {(title || action) && (
        <header className="a-panel__head">
          {title && <h2 className="a-panel__title">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export const StatusBadge = ({ s }: { s: RegistrationStatus | AttendanceMark }) => <span className={`badge badge--${s}`}>{s}</span>;

export function Progress({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="a-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
