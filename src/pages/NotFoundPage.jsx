import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="section min-h-[calc(100vh-14rem)]">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">The link may be outdated or the page may have moved.</p>
        <Link className="btn-primary mt-8" to="/">Return home</Link>
      </div>
    </section>
  );
}
