export default function About() {
  return (
    <div className="about-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Privacy First</h1>
        <p className="page-subtitle">How we protect your anonymity — and what risks remain.</p>
      </div>

      <div className="about-card">
        <h3>🛡️ What We DON'T Collect</h3>
        <ul>
          <li>No login, no email, no phone number</li>
          <li>No IP addresses stored (hashed for rate limiting only, auto-purged)</li>
          <li>No cookies, no localStorage tracking</li>
          <li>No device fingerprinting</li>
          <li>No third-party analytics (no Google Analytics, no Meta Pixel)</li>
          <li>No advertising trackers of any kind</li>
        </ul>
      </div>

      <div className="about-card">
        <h3>🔐 How Privacy Is Enforced</h3>
        <ul>
          <li>IP addresses are SHA-256 hashed with a secret pepper before any processing</li>
          <li>Raw IPs are destroyed in memory — never written to disk</li>
          <li>Rate limit records auto-purge after 24 hours</li>
          <li>Content moderation runs locally — your text never leaves our server</li>
          <li>No server request logging is enabled</li>
          <li>Database contains only confession text and timestamps</li>
        </ul>
      </div>

      <div className="about-card">
        <h3>⚠️ Honest Risks</h3>
        <p style={{ marginBottom: 'var(--space-md)' }}>
          We believe in transparency. Here are the risks we can't fully eliminate:
        </p>
        <ul>
          <li>If you confess very specific details, you may self-identify — be careful</li>
          <li>Network-level observers (ISPs, CDNs) could theoretically correlate timing</li>
          <li>A server breach could expose confession text (but not who wrote it)</li>
          <li>If the IP hash pepper is compromised, rate-limit hashes could be reversed</li>
        </ul>
      </div>

      <div className="about-card">
        <h3>🤝 Our Promise</h3>
        <ul>
          <li>We will never add user accounts or login</li>
          <li>We will never add tracking or analytics</li>
          <li>We will never sell or share data</li>
          <li>Admin cannot identify who posted any confession</li>
          <li>All moderation is automated — no human reads flagged IPs</li>
        </ul>
      </div>

      <div className="about-card">
        <h3>🏗️ Tech Stack</h3>
        <ul>
          <li>Frontend: React + Vite (no tracking SDKs)</li>
          <li>Backend: Express.js with Helmet security headers</li>
          <li>Database: SQLite (local, no cloud data transfer)</li>
          <li>Moderation: Local rule-based filter (no external AI APIs)</li>
          <li>Hosting: Self-contained, minimal attack surface</li>
        </ul>
      </div>

      <div className="privacy-banner" style={{ marginTop: 'var(--space-xl)' }}>
        <span className="shield-icon">🔒</span>
        Built for privacy. Not just privacy theater.
      </div>
    </div>
  )
}
