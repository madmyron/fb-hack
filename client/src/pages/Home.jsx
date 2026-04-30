import { useNavigate } from 'react-router-dom';

const RESTAURANT_DEMO = '/rest';
const EVENTS_DEMO = 'https://events.tapittapit.com/evt-1777584573234';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>🍹</span>
          <span style={styles.logoText}>Tap It Tap It</span>
        </div>
        <h1 style={styles.headline}>
          The smarter way to run<br />
          <span style={styles.highlight}>food & drink service.</span>
        </h1>
        <p style={styles.sub}>
          Mobile ordering for restaurants and events. Guests order from their seat —
          no app download, no waiting, no flagging anyone down.
        </p>
      </div>

      {/* Product cards */}
      <div style={styles.cards}>
        <ProductCard
          icon="🍔"
          title="Restaurant"
          description="Table-side ordering with a live kitchen display, bar view, and manager dashboard."
          color="#f97316"
          dimColor="rgba(249,115,22,0.12)"
          onDemo={() => { window.location.href = RESTAURANT_DEMO; }}
          onRegister={() => navigate('/register?type=restaurant')}
        />
        <ProductCard
          icon="🥂"
          title="Events"
          description="Weddings, parties, and catered events. Guests order drinks, share photos, and more."
          color="#8b5cf6"
          dimColor="rgba(139,92,246,0.12)"
          onDemo={() => { window.location.href = EVENTS_DEMO; }}
          onRegister={() => navigate('/register?type=event')}
        />
      </div>

      <p style={styles.footer}>Already set up? <a href="/dashboard" style={styles.link}>Restaurant Manager</a> · <a href={`${EVENTS_DEMO}/manager`} style={styles.link}>Events Manager</a></p>
    </div>
  );
}

function ProductCard({ icon, title, description, color, dimColor, onDemo, onRegister }) {
  return (
    <div style={{ ...styles.card, borderColor: `${color}33` }}>
      <div style={{ ...styles.cardIcon, background: dimColor, color }}>{icon}</div>
      <h2 style={{ ...styles.cardTitle, color }}>{title}</h2>
      <p style={styles.cardDesc}>{description}</p>
      <div style={styles.cardBtns}>
        <button onClick={onDemo} style={{ ...styles.demoBtn, borderColor: `${color}55`, color }}>
          ▶ See Demo
        </button>
        <button onClick={onRegister} style={{ ...styles.registerBtn, background: color }}>
          Get Started →
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0e17 0%, #1a0f35 60%, #0f0e17 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 20px 40px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    textAlign: 'center',
    maxWidth: 520,
    marginBottom: 40,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logoIcon: { fontSize: 32 },
  logoText: {
    fontSize: 22,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  headline: {
    fontSize: 34,
    fontWeight: 900,
    color: '#f1f0f9',
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
    marginBottom: 16,
  },
  highlight: {
    background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: 420,
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: 20,
    padding: '24px 24px 20px',
  },
  cardIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 14,
    fontSize: 26,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.55,
    marginBottom: 20,
  },
  cardBtns: {
    display: 'flex',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    padding: '11px 0',
    borderRadius: 10,
    background: 'transparent',
    border: '1px solid',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  registerBtn: {
    flex: 1,
    padding: '11px 0',
    borderRadius: 10,
    border: 'none',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  footer: {
    marginTop: 32,
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
  },
  link: {
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
  },
};
