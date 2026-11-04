import type { ReactNode } from 'react';
import { Eyebrow, LineReveal } from '../../components/primitives';
import { PHOTO, unsplash } from '../../data/images';

export default function AuthShell({ kicker, title, children, photo = PHOTO.friendsSunset }: { kicker: string; title: ReactNode[]; children: ReactNode; photo?: string }) {
  return (
    <div className="auth">
      <div className="auth__visual on-dark" aria-hidden="true">
        <img src={unsplash(photo, 1400)} alt="" />
        <div className="auth__visual-copy">
          <p className="display">“Same faces,<br /><em className="gold-on-dark">different stories.”</em></p>
        </div>
      </div>
      <div className="auth__panel on-paper grain">
        <div className="auth__inner">
          <Eyebrow num="Acct.">{kicker}</Eyebrow>
          <LineReveal as="h1" className="h1 auth__title" lines={title} />
          {children}
          <p className="auth__demo mono">Demo authentication · accounts are stored only in this browser and are not production-secure.</p>
        </div>
      </div>
    </div>
  );
}
