import { useEffect, useRef, useState, useCallback } from 'react';

export default function Camera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [facing, setFacing] = useState('environment');

  const startStream = useCallback((facingMode) => {
    setReady(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    }).then(stream => {
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) { v.srcObject = stream; v.play().then(() => setReady(true)); }
    }).catch(() => setError('Camera unavailable — use Gallery instead.'));
  }, []);

  useEffect(() => {
    startStream('environment');
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [startStream]);

  const flipCamera = () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startStream(next);
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    canvas.toBlob(blob => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      onCapture(URL.createObjectURL(blob));
    }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <video ref={videoRef} playsInline muted style={{ flex: 1, width: '100%', objectFit: 'cover' }} />
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32 }}>
          <p style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>{error}</p>
          <button onClick={onClose} style={btnStyle('#d4a843', '#000')}>Close</button>
        </div>
      )}
      <div style={{ flexShrink: 0, padding: '20px 32px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.6)' }}>
        <button onClick={onClose} style={btnStyle('rgba(255,255,255,0.15)', '#fff')}>Cancel</button>
        {ready && (
          <button onClick={capture} style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 28 }}>📸</button>
        )}
        <button onClick={flipCamera} style={btnStyle('rgba(255,255,255,0.15)', '#fff')}>🔄 Flip</button>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return { padding: '12px 24px', borderRadius: 24, background: bg, color, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' };
}
