export function CrisisBanner() {
  return (
    <div
      role="alert"
      className="rounded-lg border border-semantic-danger/30 bg-semantic-danger/10 p-5 text-neutral-ink"
    >
      <h3 className="mb-2 font-semibold text-semantic-danger">
        Your safety matters
      </h3>
      <p className="mb-3 leading-7">
        You indicated thoughts of hurting yourself or feeling that you would be
        better off dead. This screen is not a diagnosis and not an emergency
        service. If you are in immediate danger, please contact emergency
        services right away.
      </p>
      <ul className="space-y-2 text-sm font-medium">
        <li>
          National emergency:{' '}
          <a href="tel:112" className="underline hover:text-semantic-danger">
            112
          </a>
        </li>
        <li>
          AASRA (24x7):{' '}
          <a
            href="tel:+91-22-27546669"
            className="underline hover:text-semantic-danger"
          >
            +91-22-27546669
          </a>
        </li>
        <li>
          iCall, TISS (Mon-Sat, 10am-8pm):{' '}
          <a
            href="tel:+91-9152987821"
            className="underline hover:text-semantic-danger"
          >
            +91-9152987821
          </a>
        </li>
      </ul>
      <p className="mt-3 text-xs text-neutral-slate">
        Please verify these contact details before launch; helpline numbers can
        change.
      </p>
    </div>
  );
}
