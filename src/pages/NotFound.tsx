import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/hooks';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <section className="notfound on-dark grain grain--dark">
      <div className="container notfound__inner">
        <p className="mono gold-on-dark">Error 404 · Missing from the archive</p>
        <h1 className="display notfound__title">This page was<br /><em className="gold-on-dark">never filed.</em></h1>
        <p className="lead">Like the attendance register from 2013, it seems to have gone missing.</p>
        <div className="hero__ctas"><Link to="/" className="btn btn--gold">Return home</Link><Link to="/memories" className="btn btn--ghost">Browse memories</Link></div>
      </div>
    </section>
  );
}
