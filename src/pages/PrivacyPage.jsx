export function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" eyebrow="Draft for legal review">
      <p className="rounded-md bg-semantic-warning/10 p-4 text-sm font-medium">Draft: this page must be reviewed and approved by qualified legal counsel before launch.</p>
      <p>This draft explains how Antaran Mental Healthcare may handle information when you use this website and request an online consultation. Antaran is intended for adults aged 18 and above in India.</p>
      <h2>Information we collect</h2>
      <p>Depending on what you choose to use, we may collect your name, age, phone number, email address, city, state, booking preferences, booking message, assessment responses, account identity, prescription record details, and technical information needed to operate the website.</p>
      <h2>Why we use it</h2>
      <p>We use information to respond to booking requests, manage appointment availability, provide account features, support clinical record-keeping, create requested calendar and meeting links, send transactional messages, protect the service, and improve reliability. Assessment scores are screening information and are not a diagnosis.</p>
      <h2>Service providers</h2>
      <p>The current implementation may use Firebase Authentication, Azure Functions and Cosmos DB, Resend, Google Calendar and Google Meet, and analytics services including Google Analytics and Microsoft Clarity. Payment services are present in the codebase but disabled until provider onboarding and approval are complete.</p>
      <h2>Storage and retention</h2>
      <p>Records are stored only for as long as needed for the stated purpose and applicable legal, clinical, accounting, and dispute-resolution requirements. Final retention periods, deletion rules, and data-region details are pending legal and operational approval.</p>
      <h2>Your choices and rights</h2>
      <p>Subject to applicable law, you may request access, correction, withdrawal of consent, or deletion of information. The account deletion and export workflow is not yet implemented; contact the clinic while this draft is under review.</p>
      <h2>Contact</h2>
      <p>For privacy questions, contact <a className="font-semibold text-moss" href="mailto:antaran.health@gmail.com">antaran.health@gmail.com</a>. A formal grievance contact and escalation process are pending legal approval.</p>
    </LegalPage>
  );
}

function LegalPage({ eyebrow, title, children }) {
  return (
    <section className="section">
      <article className="prose mx-auto max-w-3xl text-ink">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </article>
    </section>
  );
}
