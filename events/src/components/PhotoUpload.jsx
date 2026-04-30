import { useState, useRef } from 'react';
import { API_URL } from '../config';

export default function PhotoUpload({ eventId, guestName, table, onClose, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const pickFile = (capture) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) input.capture = 'environment';
    input.onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 10 * 1024 * 1024) { setError('Photo must be under 10 MB.'); return; }
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError('');
    };
    input.click();
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      // Convert to base64 for upload (R2 presigned URLs wired in next step)
      const base64 = await toBase64(file);
      const res = await fetch(`${API_URL}/api/events/${eventId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: base64, guestName, table }),
      });
      if (!res.ok) throw new Error('Upload failed');
      const photo = await res.json();
      onUploaded(photo);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(20,10,40,0.97)', borderTop: '1px solid rgba(212,168,67,0.3)',
        borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Share a Photo</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {!preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => pickFile(true)} style={btnStyle('#d4a843', '#0a0a0a')}>
              📷 Take a Photo
            </button>
            <button onClick={() => pickFile(false)} style={btnStyle('rgba(255,255,255,0.1)', '#fff', '1px solid rgba(255,255,255,0.2)')}>
              🖼 Choose from Gallery
            </button>
            <button onClick={() => {}} disabled style={{ ...btnStyle('rgba(255,255,255,0.05)', 'rgba(255,255,255,0.3)', '1px solid rgba(255,255,255,0.08)'), cursor: 'not-allowed' }}>
              🎬 Video — Coming Soon
            </button>
          </div>
        ) : (
          <div>
            <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: 16, maxHeight: 320, objectFit: 'cover', marginBottom: 16 }} />
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPreview(null); setFile(null); }} style={{ flex: 1, ...btnStyle('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.15)') }}>
                ← Retake
              </button>
              <button onClick={upload} disabled={uploading} style={{ flex: 2, ...btnStyle('#d4a843', '#0a0a0a') }}>
                {uploading ? 'Sharing...' : '🥂 Share with the Party!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, color, border = 'none') {
  return {
    padding: '16px', borderRadius: 14, background: bg, color, border,
    fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%',
    transition: 'opacity 0.15s',
  };
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
