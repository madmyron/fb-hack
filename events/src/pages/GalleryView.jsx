import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

export default function GalleryView() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/events/${eventId}`).then(r => r.json()),
      fetch(`${API_URL}/api/events/${eventId}/photos`).then(r => r.json()),
    ]).then(([ev, ph]) => {
      setEvent(ev);
      setPhotos(ph.photos || []);
      setGalleryOpen(ph.galleryOpen);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="ev-loading"><div className="ev-spinner" /></div>;

  const bgStyle = event?.photoUrl
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${event.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : { background: 'linear-gradient(135deg, #0d0221, #1a0a3a)' };

  if (!galleryOpen) return (
    <div style={{ minHeight: '100vh', ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: '#d4a843', fontWeight: 900, fontSize: 24, marginBottom: 8 }}>Gallery Not Available Yet</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
          {event?.name ? `The gallery for ${event.name} hasn't been opened yet.` : 'This gallery is not available.'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 8 }}>Check back after the event!</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#08010f', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ ...bgStyle, padding: '48px 24px 36px', textAlign: 'center' }}>
        <p style={{ color: '#d4a843', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          🥂 Tap It Tap It Events
        </p>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginBottom: 8 }}>{event?.name}</h1>
        {event?.date && (
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 12 }}>{photos.length} photo{photos.length !== 1 ? 's' : ''} shared by guests</p>
      </div>

      {/* Grid */}
      <div style={{ padding: '24px 16px', maxWidth: 1000, margin: '0 auto' }}>
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#475569' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <p style={{ fontSize: 16 }}>No photos yet.</p>
          </div>
        ) : (
          <div style={{ columns: '2 160px', gap: 10 }}>
            {[...photos].reverse().map(photo => (
              <div key={photo.id} onClick={() => setLightbox(photo)}
                style={{ breakInside: 'avoid', marginBottom: 10, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                <img src={photo.url} alt={photo.guestName} style={{ width: '100%', display: 'block', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '20px 10px 8px' }}>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{photo.guestName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
            <img src={lightbox.url} alt={lightbox.guestName} style={{ width: '100%', borderRadius: 16, maxHeight: '75vh', objectFit: 'contain' }} />
            <p style={{ color: '#d4a843', fontWeight: 700, marginTop: 12 }}>{lightbox.guestName}</p>
            {lightbox.table && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Table {lightbox.table}</p>}
            <button onClick={() => setLightbox(null)} style={{ marginTop: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
