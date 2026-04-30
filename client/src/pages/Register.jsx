import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'restaurant';
  const isEvent = type === 'event';

  const [form, setForm] = useState({ name: '', businessName: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.businessName || !form.email) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/titi_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: `lead-${Date.now()}`,
          type,
          name: form.name,
          business_name: form.businessName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = isEvent ? '#8b5cf6' : '#f97316';
  const label = isEvent ? 'Events' : 'Restaurant';
  const icon = isEvent ? '🥂' : '🍔';
  const placeholder = isEvent ? 'Venue or event name' : 'Restaurant or bar name';

  if (done) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: 52, marginBottom: 16, textAlign: 'center' }}>🎉</div>
        <h2 style={{ ...styles.title, color: accentColor, textAlign: 'center' }}>You're on the list!</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, textAlign: 'center', marginBottom: 28 }}>
          We'll reach out to {form.email} within 24 hours to get you set up.
        </p>
        <button onClick={() => navigate('/')} style={{ ...styles.submitBtn, background: accentColor }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 36 }}>{icon}</span>
          <h2 style={{ ...styles.title, color: accentColor }}>Get Started with {label}</h2>
          <p style={styles.sub}>We'll set everything up for you. Takes less than 24 hours.</p>
        </div>

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>Your name *</label>
          <input style={styles.input} placeholder="First and last name" value={form.name} onChange={set('name')} required />

          <label style={styles.label}>{isEvent ? 'Event or venue name' : 'Restaurant name'} *</label>
          <input style={styles.input} placeholder={placeholder} value={form.businessName} onChange={set('businessName')} required />

          <label style={styles.label}>Email *</label>
          <input style={styles.input} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />

          <label style={styles.label}>Phone</label>
          <input style={styles.input} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />

          <label style={styles.label}>Anything else we should know?</label>
          <textarea style={{ ...styles.input, height: 80, resize: 'none' }}
            placeholder={isEvent ? 'Guest count, date, type of event...' : 'Number of tables, type of service...'}
            value={form.notes} onChange={set('notes')}
          />

          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}

          <button type="submit" disabled={submitting || !form.name || !form.businessName || !form.email}
            style={{ ...styles.submitBtn, background: accentColor, opacity: (!form.name || !form.businessName || !form.email) ? 0.5 : 1 }}>
            {submitting ? 'Sending...' : 'Request Access →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0e17 0%, #1a0f35 60%, #0f0e17 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '32px 20px 60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: '28px 24px',
    width: '100%',
    maxWidth: 420,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 20,
    display: 'block',
  },
  title: {
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: 10,
  },
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: 20,
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
};
