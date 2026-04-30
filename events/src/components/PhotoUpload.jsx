import { useState, useRef, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

const STICKERS = [
  { emoji: '👑', label: 'Crown' },
  { emoji: '👙', label: 'Spicy' },
  { emoji: '🎊', label: 'Congrats' },
  { emoji: '🎈', label: 'Balloons' },
  { emoji: '🎂', label: 'Cake' },
  { emoji: '🎆', label: 'Fireworks' },
  { emoji: '💍', label: 'Ring' },
  { emoji: '🥂', label: 'Cheers' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '✨', label: 'Sparkle' },
  { emoji: '💋', label: 'Kiss' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '💃', label: 'Dance' },
  { emoji: '🍾', label: 'Pop' },
];

export default function PhotoUpload({ eventId, guestName, table, onClose, onUploaded }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const loaded = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded.current) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const size = Math.round(Math.min(canvas.width, canvas.height) * 0.15);
    ctx.font = `${size}px serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    stickers.forEach(s => ctx.fillText(s.emoji, s.x, s.y));
  }, [stickers]);

  useEffect(() => { draw(); }, [draw]);

  const onImgLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const MAX = 1200;
    let w = img.naturalWidth, h = img.naturalHeight;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else { w = Math.round(w * MAX / h); h = MAX; }
    }
    canvas.width = w;
    canvas.height = h;
    loaded.current = true;
    draw();
  };

  const pick = (capture) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) input.capture = 'environment';
    input.onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 20 * 1024 * 1024) { setError('Photo must be under 20 MB.'); return; }
      loaded.current = false;
      setImgSrc(URL.createObjectURL(f));
      setStickers([]);
      setError('');
    };
    input.click();
  };

  const addSticker = (emoji) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = 0.13;
    const x = (pad + Math.random() * (1 - 2 * pad)) * canvas.width;
    const y = (pad + Math.random() * (1 - 2 * pad)) * canvas.height;
    setStickers(prev => [...prev, { emoji, x, y }]);
  };

  const upload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    setError('');
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      const res = await fetch(`${API_URL}/api/events/${eventId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: dataUrl, guestName, table }),
      });
      if (!res.ok) throw new Error();
      onUploaded(await res.json());
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────────
  if (done) return (
    <div style={overlay}>
      <div style={sheet}>
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <div style={{ fontSize: 64, marginBottom: 14 }}>🎉</div>
          <h2 style={{ color: '#d4a843', fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Photo Shared!</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.5, marginBottom: 6 }}>
            Your photo is now in the event gallery.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>
            The couple and organizer can see all photos immediately. After the event, they can share a gallery link with guests.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setDone(false); setImgSrc(null); setStickers([]); }} style={bStyle('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.15)')}>
              Share Another
            </button>
            <button onClick={onClose} style={bStyle('#d4a843', '#0a0a0a')}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Picker (no image yet) ────────────────────────────────────────────────────
  if (!imgSrc) return (
    <div style={overlay}>
      <div style={sheet}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Share a Photo</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 26, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => pick(true)} style={bStyle('#d4a843', '#0a0a0a')}>📷 Take a Photo</button>
          <button onClick={() => pick(false)} style={bStyle('rgba(255,255,255,0.09)', '#fff', '1px solid rgba(255,255,255,0.18)')}>🖼 Choose from Gallery</button>
          <button disabled style={{ ...bStyle('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.22)', '1px solid rgba(255,255,255,0.07)'), cursor: 'not-allowed' }}>
            🎬 Video — Coming Soon
          </button>
        </div>
      </div>
    </div>
  );

  // ── Sticker editor ───────────────────────────────────────────────────────────
  return (
    <div style={overlay}>
      <div style={sheet}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => { setImgSrc(null); setStickers([]); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}>← Retake</button>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Add Stickers</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Canvas */}
        <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 14, background: '#000' }}>
          <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
          <img ref={imgRef} src={imgSrc} onLoad={onImgLoad} style={{ display: 'none' }} />
        </div>

        {/* Sticker tray */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Tap to add stickers
            </p>
            {stickers.length > 0 && (
              <button onClick={() => setStickers([])} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                Clear all ({stickers.length})
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {STICKERS.map(s => (
              <button
                key={s.emoji}
                onClick={() => addSticker(s.emoji)}
                style={{
                  flexShrink: 0, fontSize: 26,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, padding: '7px 10px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <span>{s.emoji}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <button onClick={upload} disabled={uploading} style={bStyle('#d4a843', '#0a0a0a')}>
          {uploading ? 'Sharing...' : '🥂 Share with the Party!'}
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
};

const sheet = {
  background: 'rgba(14,6,32,0.98)',
  borderTop: '1px solid rgba(212,168,67,0.3)',
  borderRadius: '24px 24px 0 0',
  padding: '22px 20px 44px',
  width: '100%', maxWidth: 480,
  maxHeight: '92vh', overflowY: 'auto',
};

function bStyle(bg, color, border = 'none') {
  return {
    padding: '15px', borderRadius: 12, background: bg, color, border,
    fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%',
    transition: 'opacity 0.15s',
  };
}
