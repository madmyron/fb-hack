import { useState, useRef, useEffect, useCallback } from 'react';
import { API_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

const STICKERS = [
  { emoji: '👑', label: 'Crown' },
  { emoji: '👙', label: 'Spicy' },
  { emoji: '🎊', label: 'Confetti' },
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
  { emoji: '😂', label: 'LOL' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💯', label: '100' },
  { emoji: '🌹', label: 'Rose' },
];

const PHRASES = [
  'Congratulations!', 'Beautiful Bride!', 'Hey Macarena!', "Here's to You!",
  'Kiss the Bride!', 'Cheers!', 'To Love & Laughter', 'Best Day Ever!',
  'I Do!', 'Happily Ever After', 'Mr. & Mrs.!', 'Just Married!',
];

const COLORS = ['#ffffff', '#000000', '#ff3030', '#ff8c00', '#ffd700', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4'];

const FONTS = [
  { label: 'Classic', value: 'Georgia, serif' },
  { label: 'Modern', value: 'Arial, sans-serif' },
  { label: 'Fun', value: '"Comic Sans MS", cursive' },
  { label: 'Bold', value: 'Impact, sans-serif' },
];

let nextId = 1;

export default function PhotoUpload({ eventId, guestName, table, photoUrl, initialImgSrc, onClose, onUploaded }) {
  const [imgSrc, setImgSrc] = useState(initialImgSrc || null);
  const [objects, setObjects] = useState([]);
  const [tool, setTool] = useState('sticker');
  const [drawColor, setDrawColor] = useState('#ff3030');
  const [drawSize, setDrawSize] = useState(12);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textFont, setTextFont] = useState('Arial, sans-serif');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPendingPos, setTextPendingPos] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const saveCanvasRef = useRef(null);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const loaded = useRef(false);
  const objectsRef = useRef([]);
  const selectedIdRef = useRef(null);
  const toolRef = useRef('sticker');
  const drawColorRef = useRef('#ff3030');
  const drawSizeRef = useRef(12);
  const touchState = useRef({ dragging: false, objId: null, lastX: 0, lastY: 0, pinching: false, startDist: 0, startSize: 0 });
  const currentPathRef = useRef(null);

  useEffect(() => {
    if (initialImgSrc) {
      loaded.current = false;
      setObjects([]);
      setSelectedId(null);
      selectedIdRef.current = null;
    }
  }, [initialImgSrc]);

  useEffect(() => { objectsRef.current = objects; }, [objects]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { drawColorRef.current = drawColor; }, [drawColor]);
  useEffect(() => { drawSizeRef.current = drawSize; }, [drawSize]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded.current) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const objs = objectsRef.current;
    const selId = selectedIdRef.current;

    objs.forEach(obj => {
      if (obj.type === 'path') {
        if (obj.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        obj.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
      } else if (obj.type === 'sticker') {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        if (obj.rotation) ctx.rotate(obj.rotation * Math.PI / 180);
        ctx.font = `${obj.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.emoji, 0, 0);
        if (obj.id === selId) {
          const half = obj.size * 0.56;
          ctx.strokeStyle = 'rgba(255,255,255,0.95)';
          ctx.lineWidth = Math.max(2, obj.size * 0.04);
          ctx.setLineDash([8, 4]);
          ctx.strokeRect(-half, -half, half * 2, half * 2);
          ctx.setLineDash([]);
        }
        ctx.restore();
      } else if (obj.type === 'text') {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        if (obj.rotation) ctx.rotate(obj.rotation * Math.PI / 180);
        ctx.font = `bold ${obj.fontSize}px ${obj.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const outline = obj.color === '#000000' ? '#ffffff' : '#000000';
        ctx.strokeStyle = outline;
        ctx.lineWidth = Math.max(4, obj.fontSize * 0.12);
        ctx.lineJoin = 'round';
        ctx.strokeText(obj.text, 0, 0);
        ctx.fillStyle = obj.color;
        ctx.fillText(obj.text, 0, 0);
        if (obj.id === selId) {
          const w = ctx.measureText(obj.text).width / 2 + 8;
          const h = obj.fontSize / 2 + 8;
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(-w, -h, w * 2, h * 2);
          ctx.setLineDash([]);
        }
        ctx.restore();
      }
    });

    if (currentPathRef.current && currentPathRef.current.points.length > 1) {
      const p = currentPathRef.current;
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      p.points.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    if (loaded.current) drawCanvas();
  }, [objects, selectedId, drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;

    const getCoords = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const hitTest = (obj, x, y) => {
      if (obj.type === 'sticker') {
        const half = obj.size * 0.56;
        return x >= obj.x - half && x <= obj.x + half && y >= obj.y - half && y <= obj.y + half;
      }
      if (obj.type === 'text') {
        const ctx = canvas.getContext('2d');
        ctx.font = `bold ${obj.fontSize}px ${obj.fontFamily}`;
        const w = ctx.measureText(obj.text).width / 2 + 12;
        const h = obj.fontSize / 2 + 12;
        return x >= obj.x - w && x <= obj.x + w && y >= obj.y - h && y <= obj.y + h;
      }
      return false;
    };

    const startAt = (x, y) => {
      const objs = objectsRef.current;
      let found = null;
      for (let i = objs.length - 1; i >= 0; i--) {
        if (objs[i].type !== 'path' && hitTest(objs[i], x, y)) { found = objs[i]; break; }
      }
      if (found) {
        setSelectedId(found.id);
        selectedIdRef.current = found.id;
        touchState.current = { ...touchState.current, dragging: true, objId: found.id, lastX: x, lastY: y, pinching: false };
      } else {
        setSelectedId(null);
        selectedIdRef.current = null;
        touchState.current = { ...touchState.current, dragging: false, objId: null, lastX: x, lastY: y, pinching: false };
        if (toolRef.current === 'draw') {
          currentPathRef.current = { id: nextId++, color: drawColorRef.current, lineWidth: drawSizeRef.current, points: [{ x, y }] };
        } else if (toolRef.current === 'text') {
          setTextPendingPos({ x, y });
          setShowTextInput(true);
        }
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const { x, y } = getCoords(e.touches[0].clientX, e.touches[0].clientY);
        startAt(x, y);
      } else if (e.touches.length === 2) {
        const selId = selectedIdRef.current;
        if (selId !== null) {
          const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          const obj = objectsRef.current.find(o => o.id === selId);
          const startSize = obj?.type === 'sticker' ? obj.size : obj?.fontSize || 80;
          touchState.current = { ...touchState.current, pinching: true, startDist: dist, startSize, objId: selId };
        }
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const ts = touchState.current;
      if (e.touches.length === 2 && ts.pinching && ts.objId !== null) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const scale = dist / ts.startDist;
        setObjects(prev => prev.map(o => {
          if (o.id !== ts.objId) return o;
          if (o.type === 'sticker') return { ...o, size: Math.max(30, Math.min(ts.startSize * scale, 500)) };
          if (o.type === 'text') return { ...o, fontSize: Math.max(16, Math.min(ts.startSize * scale, 300)) };
          return o;
        }));
        return;
      }
      if (e.touches.length === 1 && !ts.pinching) {
        const { x, y } = getCoords(e.touches[0].clientX, e.touches[0].clientY);
        if (ts.dragging && ts.objId !== null) {
          const dx = x - ts.lastX, dy = y - ts.lastY;
          setObjects(prev => prev.map(o => o.id !== ts.objId ? o : { ...o, x: o.x + dx, y: o.y + dy }));
          touchState.current = { ...ts, lastX: x, lastY: y };
        } else if (toolRef.current === 'draw' && currentPathRef.current) {
          currentPathRef.current.points.push({ x, y });
          drawCanvas();
        }
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      if (toolRef.current === 'draw' && currentPathRef.current) {
        const path = { ...currentPathRef.current, type: 'path' };
        if (path.points.length > 1) setObjects(prev => [...prev, path]);
        currentPathRef.current = null;
      }
      if (e.touches.length === 0) touchState.current = { ...touchState.current, dragging: false, pinching: false };
    };

    let mouseDown = false;
    const handleMouseDown = (e) => {
      mouseDown = true;
      const { x, y } = getCoords(e.clientX, e.clientY);
      startAt(x, y);
    };
    const handleMouseMove = (e) => {
      if (!mouseDown) return;
      const ts = touchState.current;
      const { x, y } = getCoords(e.clientX, e.clientY);
      if (ts.dragging && ts.objId !== null) {
        const dx = x - ts.lastX, dy = y - ts.lastY;
        setObjects(prev => prev.map(o => o.id !== ts.objId ? o : { ...o, x: o.x + dx, y: o.y + dy }));
        touchState.current = { ...ts, lastX: x, lastY: y };
      } else if (toolRef.current === 'draw' && currentPathRef.current) {
        currentPathRef.current.points.push({ x, y });
        drawCanvas();
      }
    };
    const handleMouseUp = () => {
      mouseDown = false;
      if (toolRef.current === 'draw' && currentPathRef.current) {
        const path = { ...currentPathRef.current, type: 'path' };
        if (path.points.length > 1) setObjects(prev => [...prev, path]);
        currentPathRef.current = null;
      }
      touchState.current = { ...touchState.current, dragging: false };
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [imgSrc, drawCanvas]);

  const onImgLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const MAX = 700;
    let w = img.naturalWidth, h = img.naturalHeight;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else { w = Math.round(w * MAX / h); h = MAX; }
    }
    canvas.width = w;
    canvas.height = h;
    loaded.current = true;
    drawCanvas();
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError('Photo must be under 20 MB.'); return; }
    loaded.current = false;
    const url = URL.createObjectURL(f);
    setImgSrc(url);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setObjects([]);
    setSelectedId(null);
    selectedIdRef.current = null;
    setError('');
  };


  const addSticker = (emoji) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = Math.round(Math.min(canvas.width, canvas.height) * 0.2);
    const id = nextId++;
    setObjects(prev => [...prev, { id, type: 'sticker', emoji, x: canvas.width / 2, y: canvas.height / 2, size, rotation: 0 }]);
    setSelectedId(id);
    selectedIdRef.current = id;
  };

  const addPhrase = (phrase) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fontSize = Math.round(Math.min(canvas.width, canvas.height) * 0.09);
    const id = nextId++;
    setObjects(prev => [...prev, {
      id, type: 'text', text: phrase,
      x: canvas.width / 2, y: canvas.height * 0.15,
      fontSize, color: textColor, fontFamily: textFont, rotation: 0,
    }]);
    setSelectedId(id);
    selectedIdRef.current = id;
  };

  const placeText = () => {
    if (!textInput.trim()) { setShowTextInput(false); return; }
    const canvas = canvasRef.current;
    const fontSize = Math.round(Math.min(canvas.width, canvas.height) * 0.09);
    const pos = textPendingPos || { x: canvas.width / 2, y: canvas.height * 0.15 };
    const id = nextId++;
    setObjects(prev => [...prev, { id, type: 'text', text: textInput.trim(), x: pos.x, y: pos.y, fontSize, color: textColor, fontFamily: textFont, rotation: 0 }]);
    setSelectedId(id);
    selectedIdRef.current = id;
    setTextInput('');
    setShowTextInput(false);
  };

  const rotateSelected = (deg) => {
    setObjects(prev => prev.map(o => o.id !== selectedId ? o : { ...o, rotation: ((o.rotation || 0) + deg + 360) % 360 }));
  };

  const resizeSelected = (factor) => {
    setObjects(prev => prev.map(o => {
      if (o.id !== selectedId) return o;
      if (o.type === 'sticker') return { ...o, size: Math.max(24, Math.min(o.size * factor, 600)) };
      if (o.type === 'text') return { ...o, fontSize: Math.max(14, Math.min(o.fontSize * factor, 400)) };
      return o;
    }));
  };

  const deleteSelected = () => {
    setObjects(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
    selectedIdRef.current = null;
  };

  const undo = () => {
    setObjects(prev => prev.slice(0, -1));
    setSelectedId(null);
    selectedIdRef.current = null;
  };

  const saveToGallery = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSelectedId(null);
    selectedIdRef.current = null;
    await new Promise(r => requestAnimationFrame(r));
    drawCanvas();
    await new Promise(r => setTimeout(r, 80));
    setShowSave(true);
    await new Promise(r => setTimeout(r, 120));
    const sc = saveCanvasRef.current;
    if (sc) {
      sc.width = canvas.width;
      sc.height = canvas.height;
      sc.getContext('2d').drawImage(canvas, 0, 0);
    }
  };

  const upload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSelectedId(null);
    selectedIdRef.current = null;
    await new Promise(r => requestAnimationFrame(r));
    drawCanvas();
    await new Promise(r => setTimeout(r, 80));
    setUploading(true);
    setError('');
    try {
      // Scale down for export
      const exportCanvas = document.createElement('canvas');
      const MAX_EXPORT = 800;
      let ew = canvas.width, eh = canvas.height;
      if (ew > MAX_EXPORT || eh > MAX_EXPORT) {
        if (ew > eh) { eh = Math.round(eh * MAX_EXPORT / ew); ew = MAX_EXPORT; }
        else { ew = Math.round(ew * MAX_EXPORT / eh); eh = MAX_EXPORT; }
      }
      exportCanvas.width = ew;
      exportCanvas.height = eh;
      exportCanvas.getContext('2d').drawImage(canvas, 0, 0, ew, eh);

      // Get image as blob
      const blob = await new Promise(resolve => exportCanvas.toBlob(resolve, 'image/jpeg', 0.75));

      // Upload directly to Supabase Storage (bypasses Render proxy size limits)
      const filename = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
      const storageRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/event-photos/${filename}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'image/jpeg',
          },
          body: blob,
        }
      );
      if (!storageRes.ok) throw new Error('Storage upload failed');

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/event-photos/${filename}`;

      // Save only the URL through the server
      const res = await fetch(`${API_URL}/api/events/${eventId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: publicUrl, guestName, table }),
      });
      if (!res.ok) throw new Error('Save failed');
      onUploaded(await res.json());
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const selectedObj = objects.find(o => o.id === selectedId);

  if (done) return (
    <div style={{ ...overlayBase(photoUrl), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />
      <div style={{ ...sheet, position: 'relative', zIndex: 1, borderRadius: 24, maxWidth: 360, margin: '0 24px' }}>
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <div style={{ fontSize: 64, marginBottom: 14 }}>🎉</div>
          <h2 style={{ color: '#d4a843', fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Photo Shared!</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.5, marginBottom: 6 }}>Your photo is now in the event gallery.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>The couple and organizer can see it immediately. After the event, they can share a gallery link with guests.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setDone(false); setImgSrc(null); setObjects([]); }} style={bStyle('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.15)')}>Share Another</button>
            <button onClick={onClose} style={bStyle('#d4a843', '#0a0a0a')}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!imgSrc) return (
    <div style={{ ...overlayBase(photoUrl), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, padding: '0 24px', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: -48, right: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 30, cursor: 'pointer', lineHeight: 1 }}>×</button>
        <div style={{ fontSize: 52, marginBottom: 12 }}>💍</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Share a Moment</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Capture the love — add stickers & text, then share with everyone at the party.</p>
        <label style={{ ...bStyle('#d4a843', '#0a0a0a'), display: 'block', cursor: 'pointer' }}>
          📷 Add a Photo
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </label>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', background: 'rgba(14,6,32,0.98)' }}>

      {/* Header — always visible */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => { setImgSrc(null); setObjects([]); setSelectedId(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}>← Retake</button>
        <button onClick={undo} disabled={objects.length === 0} style={{ background: objects.length > 0 ? 'rgba(255,255,255,0.07)' : 'transparent', border: 'none', color: objects.length > 0 ? '#94a3b8' : 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 12px', cursor: objects.length > 0 ? 'pointer' : 'default', fontSize: 13, fontWeight: 700 }}>↩ Undo</button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      {/* Canvas — always visible, never scrolls away */}
      <div style={{ flexShrink: 0, position: 'relative', background: '#000', touchAction: 'none', userSelect: 'none', maxHeight: '45vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '45vh', display: 'block', touchAction: 'none', cursor: tool === 'draw' ? 'crosshair' : 'default' }} />
        <img ref={imgRef} src={imgSrc} onLoad={onImgLoad} style={{ display: 'none' }} />
        {tool === 'text' && !showTextInput && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 700 }}>Tap photo to place text</div>
          </div>
        )}
      </div>

      {/* Selected object toolbar — always visible when active */}
      {selectedObj && selectedObj.type !== 'path' && (
        <div style={{ flexShrink: 0, display: 'flex', gap: 6, padding: '8px 16px', justifyContent: 'center', background: 'rgba(212,168,67,0.08)', borderTop: '1px solid rgba(212,168,67,0.15)', borderBottom: '1px solid rgba(212,168,67,0.15)' }}>
          <ctrlBtn label="↺" onClick={() => rotateSelected(-15)} />
          <ctrlBtn label="↻" onClick={() => rotateSelected(15)} />
          <ctrlBtn label="−" onClick={() => resizeSelected(0.82)} />
          <ctrlBtn label="+" onClick={() => resizeSelected(1.22)} />
          <button onClick={deleteSelected} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🗑 Delete</button>
        </div>
      )}

      {/* Tools — this section scrolls, photo stays above */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Quick phrases */}
        <div style={{ flexShrink: 0, padding: '10px 16px 4px' }}>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Quick Captions</p>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {PHRASES.map(p => (
              <button key={p} onClick={() => addPhrase(p)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20,
                border: '1px solid rgba(212,168,67,0.4)',
                background: 'rgba(212,168,67,0.1)', color: '#d4a843',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Tool tabs */}
        <div style={{ flexShrink: 0, display: 'flex', margin: '10px 16px 0', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
          {[{ id: 'sticker', label: '😄 Stickers' }, { id: 'draw', label: '✏️ Draw' }, { id: 'text', label: 'Aa Text' }].map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setSelectedId(null); selectedIdRef.current = null; }} style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tool === t.id ? '#d4a843' : 'transparent',
              color: tool === t.id ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
              fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tool panels */}
        <div style={{ padding: '10px 16px 0' }}>
          {tool === 'sticker' && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                Tap to add · Drag to move · Pinch to resize
              </p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                {STICKERS.map(s => (
                  <button key={s.emoji} onClick={() => addSticker(s.emoji)} style={{
                    flexShrink: 0, fontSize: 28,
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}>
                    <span>{s.emoji}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {tool === 'draw' && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Color</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => { setDrawColor(c); drawColorRef.current = c; }} style={{ width: 32, height: 32, borderRadius: '50%', background: c, flexShrink: 0, border: drawColor === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Brush Size</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: 'Fine', size: 5 }, { label: 'Medium', size: 12 }, { label: 'Thick', size: 24 }, { label: 'Marker', size: 44 }].map(b => (
                  <button key={b.label} onClick={() => { setDrawSize(b.size); drawSizeRef.current = b.size; }} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: drawSize === b.size ? '#d4a843' : 'rgba(255,255,255,0.08)', color: drawSize === b.size ? '#0a0a0a' : '#94a3b8' }}>{b.label}</button>
                ))}
              </div>
            </>
          )}

          {tool === 'text' && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Color</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setTextColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, flexShrink: 0, border: textColor === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Font</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {FONTS.map(f => (
                  <button key={f.value} onClick={() => setTextFont(f.value)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: f.value, background: textFont === f.value ? '#d4a843' : 'rgba(255,255,255,0.08)', color: textFont === f.value ? '#0a0a0a' : '#94a3b8' }}>{f.label}</button>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>Tap a phrase above or tap the photo to type your own</p>
            </>
          )}
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, margin: '10px 16px 0' }}>{error}</p>}
        <div style={{ padding: '14px 16px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={upload} disabled={uploading} style={bStyle('#d4a843', '#0a0a0a')}>
            {uploading ? 'Sharing...' : '🥂 Share with the Party!'}
          </button>
          <button onClick={saveToGallery} style={bStyle('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.15)')}>
            💾 Save to My Gallery
          </button>
        </div>
      </div>

      {showSave && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }}>
          <p style={{ color: '#d4a843', fontWeight: 800, fontSize: 16, textAlign: 'center' }}>Hold down on the photo → tap "Save Image"</p>
          <canvas ref={saveCanvasRef} style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 12, display: 'block' }} />
          <button onClick={onClose} style={bStyle('#d4a843', '#0a0a0a')}>← Back to Party</button>
        </div>
      )}

      {showTextInput && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#1a0f35', border: '1px solid rgba(212,168,67,0.3)', borderRadius: '20px 20px 0 0', padding: '20px 20px 48px', width: '100%', maxWidth: 480 }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Add Text</h3>
            <input autoFocus value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && placeText()} placeholder="Type something..." style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 16, fontFamily: textFont, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowTextInput(false)} style={bStyle('rgba(255,255,255,0.08)', '#fff', '1px solid rgba(255,255,255,0.15)')}>Cancel</button>
              <button onClick={placeText} disabled={!textInput.trim()} style={bStyle('#d4a843', '#0a0a0a')}>Add to Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ctrlBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15, background: 'rgba(255,255,255,0.09)', color: '#fff', minWidth: 40 }}>{label}</button>
  );
}

const overlayBase = (photoUrl) => ({
  position: 'fixed', inset: 0, zIndex: 100,
  backgroundImage: photoUrl ? `url(${photoUrl})` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  background: photoUrl ? undefined : '#0a0418',
  display: 'flex',
});

const sheet = {
  background: 'rgba(14,6,32,0.98)',
  borderTop: '1px solid rgba(212,168,67,0.3)',
  borderRadius: '24px 24px 0 0',
  width: '100%', maxWidth: 480,
  maxHeight: '96vh', overflowY: 'auto',
};

function bStyle(bg, color, border = 'none') {
  return { padding: '14px', borderRadius: 12, background: bg, color, border, fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', transition: 'opacity 0.15s' };
}
