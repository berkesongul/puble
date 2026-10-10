import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Scissors, 
  Plus, 
  Download, 
  RotateCcw, 
  Type, 
  SlidersHorizontal, 
  Sparkles,
  Upload,
  Trash2,
  Music,
  Maximize2,
  Gauge,
  Layers,
  ArrowRightLeft,
  MoveLeft,
  MoveRight,
  Music2,
  Crop,
  Eye,
  EyeOff,
  PlusCircle,
  FolderPlus,
  Image as ImageIcon
} from 'lucide-react';

export default function VideoStudio({ onBackToPhotoStudio }) {
  // Multi-Track Timeline Layers State
  const [tracks, setTracks] = useState([
    { id: 'track_v1', name: 'Ana Video Katmanı (V1)', type: 'video', visible: true, muted: false, color: '#f43f5e' },
    { id: 'track_v2', name: 'İkincil / PIP Katmanı (V2)', type: 'overlay', visible: true, muted: false, color: '#6366f1' },
    { id: 'track_t1', name: 'Metin & Altyazı Katmanı (T1)', type: 'text', visible: true, muted: false, color: '#ec4899' },
    { id: 'track_a1', name: 'Müzik & Ses Katmanı (A1)', type: 'audio', visible: true, muted: false, color: '#10b981' }
  ]);

  // Multi-clip Timeline State
  const [clips, setClips] = useState([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  // Background Audio / Music Track State
  const [bgMusicSrc, setBgMusicSrc] = useState(null);
  const [bgMusicName, setBgMusicName] = useState('');
  const [bgMusicVolume, setBgMusicVolume] = useState(0.8);
  const [videoAudioVolume, setVideoAudioVolume] = useState(1.0);
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  // Global Player & Timing State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Aspect Ratio & Cropping Fit State
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | '21:9'
  const [objectFit, setObjectFit] = useState('cover'); // 'cover' | 'contain' | 'fill'

  // Transition & Speed Settings for Active Clip
  const [transitionType, setTransitionType] = useState('fade'); // 'none' | 'fade' | 'slide' | 'zoom' | 'flash'
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Filter Adjustments
  const [brightness, setBrightness] = useState(0); // -0.5 to 0.5
  const [contrast, setContrast] = useState(0);     // -0.5 to 0.5
  const [saturation, setSaturation] = useState(0);   // -1 to 1
  const [blurVal, setBlurVal] = useState(0);       // 0 to 10
  const [activeFilter, setActiveFilter] = useState('normal');

  // Text Overlays
  const [textOverlays, setTextOverlays] = useState([]);
  const [newText, setNewText] = useState('Örnek Altyazı / Metin');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBgColor, setTextBgColor] = useState('rgba(0,0,0,0.6)');
  const [textSize, setTextSize] = useState(28);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Handle Dragging Trim Handles
  const [isDraggingHandle, setIsDraggingHandle] = useState(null); // 'left' | 'right' | null

  const videoRef = useRef(null);
  const bgAudioRef = useRef(null);
  const canvasRef = useRef(null);
  const timelineTrackRef = useRef(null);
  const animFrameRef = useRef(null);
  const fileInputRef = useRef(null);
  const addClipInputRef = useRef(null);
  const audioFileInputRef = useRef(null);

  // Pre-loaded Stock Sample Videos
  const sampleVideos = [
    {
      name: 'Doğa Manzarası (Stock)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      name: 'Şehir Hayatı & Işıklar',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
      name: 'Teknoloji & Animasyon',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }
  ];

  // Pre-loaded Stock Royalty-Free Background Music Tracks
  const sampleMusicTracks = [
    {
      name: '🎵 Enerjik Pop Beat',
      url: 'https://actions.google.com/sounds/v1/science_fiction/scifi_synth_pulse.ogg'
    },
    {
      name: '🎵 Lo-Fi Chill Vibe',
      url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg'
    },
    {
      name: '🎵 Sinematik Piyano',
      url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg'
    }
  ];

  // Add New Timeline Track / Layer
  const handleAddTrack = (trackType) => {
    const counts = tracks.filter((t) => t.type === trackType).length + 1;
    const typeConfigs = {
      video: { name: `Video Katmanı (V${counts})`, color: '#f43f5e' },
      overlay: { name: `Görsel / PIP Katmanı (V${counts + 1})`, color: '#6366f1' },
      text: { name: `Metin Katmanı (T${counts})`, color: '#ec4899' },
      audio: { name: `Ses / Müzik Katmanı (A${counts})`, color: '#10b981' }
    };
    const config = typeConfigs[trackType] || { name: 'Yeni Katman', color: '#3b82f6' };

    const newTrack = {
      id: `track_${trackType}_${Date.now()}`,
      name: config.name,
      type: trackType,
      visible: true,
      muted: false,
      color: config.color
    };

    setTracks((prev) => [...prev, newTrack]);
  };

  const handleRemoveTrack = (trackId) => {
    if (tracks.length <= 1) return;
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handleToggleTrackVisibility = (trackId) => {
    setTracks((prev) => prev.map((t) => t.id === trackId ? { ...t, visible: !t.visible } : t));
  };

  const handleToggleTrackMute = (trackId) => {
    setTracks((prev) => prev.map((t) => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  // Target Canvas Dimensions based on Aspect Ratio
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '9:16': return { width: 720, height: 1280 }; // Vertical Reels/TikTok
      case '1:1':  return { width: 1080, height: 1080 }; // Square
      case '4:5':  return { width: 864, height: 1080 };  // Insta Feed
      case '4:3':  return { width: 960, height: 720 };   // Standard
      case '21:9': return { width: 1280, height: 548 };  // Cinema
      case '16:9':
      default:     return { width: 1280, height: 720 };  // Widescreen HD
    }
  };

  // Add Initial Video Clip
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newClip = {
        id: 'clip_' + Date.now(),
        name: file.name,
        url: url,
        trimStart: 0,
        trimEnd: 0,
        duration: 0,
        speed: 1.0,
        transition: transitionType,
        trackId: 'track_v1'
      };
      setClips([newClip]);
      setActiveClipIndex(0);
      setIsPlaying(false);
    }
  };

  // Append Additional Video Clip to Timeline
  const handleAddClip = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newClip = {
        id: 'clip_' + Date.now(),
        name: file.name,
        url: url,
        trimStart: 0,
        trimEnd: 0,
        duration: 0,
        speed: 1.0,
        transition: transitionType,
        trackId: 'track_v1'
      };
      setClips((prev) => [...prev, newClip]);
    }
  };

  const handleSelectSample = (sample) => {
    const newClip = {
      id: 'clip_' + Date.now(),
      name: sample.name,
      url: sample.url,
      trimStart: 0,
      trimEnd: 0,
      duration: 0,
      speed: 1.0,
      transition: transitionType,
      trackId: 'track_v1'
    };
    setClips([newClip]);
    setActiveClipIndex(0);
    setIsPlaying(false);
  };

  // Background Audio Upload
  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgMusicSrc(url);
      setBgMusicName(file.name);
    }
  };

  // Remove Clip from Timeline
  const handleRemoveClip = (index) => {
    setClips((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (activeClipIndex >= updated.length) {
        setActiveClipIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  // Move Clip Position in Timeline
  const handleMoveClip = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= clips.length) return;

    setClips((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });

    if (activeClipIndex === index) {
      setActiveClipIndex(targetIdx);
    } else if (activeClipIndex === targetIdx) {
      setActiveClipIndex(index);
    }
  };

  // Active Video Clip Metadata Loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && clips[activeClipIndex]) {
      const dur = video.duration || 0;
      setClips((prev) => {
        const copy = [...prev];
        const active = copy[activeClipIndex];
        if (active && (active.duration === 0 || active.trimEnd === 0)) {
          active.duration = dur;
          active.trimEnd = dur;
        }
        return copy;
      });
      video.playbackRate = playbackSpeed;
      video.volume = isMuted ? 0 : videoAudioVolume;
    }
  };

  // Interactive Timeline Trim Handle Mouse Drag Events
  const handleTimelineMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHandle(type);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const activeClip = clips[activeClipIndex];
      if (!isDraggingHandle || !activeClip || !activeClip.duration || !timelineTrackRef.current) return;

      const rect = timelineTrackRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const timeVal = (offsetX / rect.width) * activeClip.duration;

      if (isDraggingHandle === 'left') {
        const nextStart = Math.max(0, Math.min(timeVal, (activeClip.trimEnd || activeClip.duration) - 0.5));
        setClips((prev) => {
          const copy = [...prev];
          copy[activeClipIndex].trimStart = nextStart;
          return copy;
        });
      } else if (isDraggingHandle === 'right') {
        const nextEnd = Math.min(activeClip.duration, Math.max(timeVal, (activeClip.trimStart || 0) + 0.5));
        setClips((prev) => {
          const copy = [...prev];
          copy[activeClipIndex].trimEnd = nextEnd;
          return copy;
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHandle(null);
    };

    if (isDraggingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingHandle, activeClipIndex, clips]);

  // Keep Sync & Render Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const bgAudio = bgAudioRef.current;

    const audioTrackConfig = tracks.find((t) => t.type === 'audio');
    const isAudioTrackMuted = audioTrackConfig?.muted || isMuted;

    if (bgAudio) {
      bgAudio.volume = isAudioTrackMuted ? 0 : bgMusicVolume;
    }

    if (!video || !canvas || clips.length === 0) return;

    const currentClip = clips[activeClipIndex];
    const mainVideoTrack = tracks.find((t) => t.id === (currentClip?.trackId || 'track_v1'));

    const renderLoop = () => {
      if (video && canvas && currentClip) {
        const trimEnd = currentClip.trimEnd || video.duration || 0;
        const trimStart = currentClip.trimStart || 0;

        if (video.currentTime >= trimEnd && trimEnd > 0) {
          if (activeClipIndex < clips.length - 1) {
            setActiveClipIndex((prev) => prev + 1);
          } else {
            video.currentTime = trimStart;
            if (!video.paused) video.play();
          }
        }

        setCurrentTime(video.currentTime);

        const ctx = canvas.getContext('2d');
        const dims = getCanvasDimensions();

        if (canvas.width !== dims.width || canvas.height !== dims.height) {
          canvas.width = dims.width;
          canvas.height = dims.height;
        }

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (!mainVideoTrack || mainVideoTrack.visible !== false) {
            let filterStr = '';
            const bVal = 100 + brightness * 100;
            const cVal = 100 + contrast * 100;
            const sVal = 100 + saturation * 100;
            filterStr += `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%)`;

            if (blurVal > 0) filterStr += ` blur(${blurVal}px)`;
            if (activeFilter === 'grayscale') filterStr += ' grayscale(100%)';
            if (activeFilter === 'sepia') filterStr += ' sepia(100%)';
            if (activeFilter === 'vintage') filterStr += ' sepia(40%) hue-rotate(-20deg) contrast(110%)';
            if (activeFilter === 'dramatic') filterStr += ' contrast(140%) saturate(130%)';
            if (activeFilter === 'cyan') filterStr += ' hue-rotate(180deg) saturate(120%)';

            ctx.filter = filterStr;

            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const cw = canvas.width;
            const ch = canvas.height;

            if (objectFit === 'cover') {
              const scale = Math.max(cw / vw, ch / vh);
              const sw = cw / scale;
              const sh = ch / scale;
              const sx = (vw - sw) / 2;
              const sy = (vh - sh) / 2;
              ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
            } else if (objectFit === 'contain') {
              const scale = Math.min(cw / vw, ch / vh);
              const dw = vw * scale;
              const dh = vh * scale;
              const dx = (cw - dw) / 2;
              const dy = (ch - dh) / 2;

              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, cw, ch);
              ctx.drawImage(video, 0, 0, vw, vh, dx, dy, dw, dh);
            } else {
              ctx.drawImage(video, 0, 0, cw, ch);
            }

            ctx.filter = 'none';

            const clipTime = video.currentTime - trimStart;
            const transDur = 0.6;
            if (clipTime < transDur && transitionType !== 'none') {
              const progress = clipTime / transDur;
              ctx.save();
              if (transitionType === 'fade') {
                ctx.fillStyle = `rgba(0,0,0,${1 - progress})`;
                ctx.fillRect(0, 0, cw, ch);
              } else if (transitionType === 'flash') {
                ctx.fillStyle = `rgba(255,255,255,${1 - progress})`;
                ctx.fillRect(0, 0, cw, ch);
              } else if (transitionType === 'zoom') {
                const opacity = 1 - progress;
                ctx.fillStyle = `rgba(15,23,42,${opacity})`;
                ctx.fillRect(0, 0, cw, ch);
              }
              ctx.restore();
            }
          }

          const textTrack = tracks.find((t) => t.type === 'text');
          if (!textTrack || textTrack.visible !== false) {
            textOverlays.forEach((overlay) => {
              ctx.save();
              ctx.font = `${overlay.isBold ? 'bold' : 'normal'} ${overlay.fontSize}px 'Plus Jakarta Sans', sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const xPos = (overlay.x / 100) * canvas.width;
              const yPos = (overlay.y / 100) * canvas.height;

              if (overlay.bgColor && overlay.bgColor !== 'transparent') {
                const metrics = ctx.measureText(overlay.text);
                const paddingX = 18;
                const paddingY = 12;
                const boxWidth = metrics.width + paddingX * 2;
                const boxHeight = overlay.fontSize + paddingY * 2;

                ctx.fillStyle = overlay.bgColor;
                ctx.beginPath();
                ctx.roundRect(xPos - boxWidth / 2, yPos - boxHeight / 2, boxWidth, boxHeight, 8);
                ctx.fill();
              }

              ctx.shadowColor = 'rgba(0,0,0,0.85)';
              ctx.shadowBlur = 10;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
              ctx.fillStyle = overlay.color;
              ctx.fillText(overlay.text, xPos, yPos);
              ctx.restore();
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [clips, activeClipIndex, tracks, aspectRatio, objectFit, brightness, contrast, saturation, blurVal, activeFilter, textOverlays, transitionType, isMuted, bgMusicVolume, videoAudioVolume]);

  const togglePlay = () => {
    const video = videoRef.current;
    const bgAudio = bgAudioRef.current;

    if (!video) return;

    if (isPlaying) {
      video.pause();
      if (bgAudio) bgAudio.pause();
      setIsPlaying(false);
    } else {
      video.play();
      if (bgAudio) bgAudio.play();
      setIsPlaying(true);
    }
  };

  const handleAddTextOverlay = () => {
    if (!newText.trim()) return;
    const overlay = {
      id: 'text_' + Date.now(),
      text: newText,
      x: 50,
      y: 82,
      fontSize: textSize,
      color: textColor,
      bgColor: textBgColor,
      isBold: true
    };
    setTextOverlays((prev) => [...prev, overlay]);
  };

  const handleRemoveOverlay = (id) => {
    setTextOverlays((prev) => prev.filter((o) => o.id !== id));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(1, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || clips.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = clips[activeClipIndex]?.trimStart || 0;
    }
    setIsPlaying(false);

    await new Promise((res) => setTimeout(res, 200));

    const stream = canvas.captureStream(30);

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.download = `photocraft_edited_video_${Date.now()}.webm`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsExporting(false);
      setExportProgress(100);
    };

    recorder.start();

    if (video) video.play();

    const currentClip = clips[activeClipIndex];
    const totalDuration = (currentClip?.trimEnd || video?.duration || 10) - (currentClip?.trimStart || 0);
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(99, Math.round((elapsed / totalDuration) * 100));
      setExportProgress(pct);

      if (elapsed >= totalDuration + 0.5 || video?.ended) {
        clearInterval(progressInterval);
        recorder.stop();
        if (video) video.pause();
      }
    }, 150);
  };

  const activeClip = clips[activeClipIndex];
  const clipDur = activeClip?.duration || 10;
  const trimStart = activeClip?.trimStart || 0;
  const trimEnd = activeClip?.trimEnd || clipDur;

  const trimLeftPct = (trimStart / clipDur) * 100;
  const trimRightPct = (1 - trimEnd / clipDur) * 100;
  const playheadPct = (currentTime / clipDur) * 100;

  return (
    <div className="video-studio-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden' }}>
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
      <input ref={addClipInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleAddClip} />
      <input ref={audioFileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioUpload} />

      {/* Top Header */}
      <header className="app-header" style={{ justifyContent: 'space-between', padding: '0 20px' }}>
        <div className="logo-area" onClick={onBackToPhotoStudio} style={{ cursor: 'pointer' }}>
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
            <Film size={22} />
          </div>
          <div>
            <h1 className="logo-text">Video Studio Pro</h1>
          </div>
          <span className="logo-badge" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid #f43f5e' }}>CapCut Style</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={onBackToPhotoStudio} title="Fotoğraf Düzenleyiciye Dön">
            <Sparkles size={16} />
            <span>Fotoğraf Stüdyosu</span>
          </button>

          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            <span>Yeni Proje (Video Yükle)</span>
          </button>

          {clips.length > 0 && (
            <button 
              className="btn btn-primary" 
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', borderColor: '#f43f5e' }}
              onClick={handleExportVideo}
              disabled={isExporting}
            >
              <Download size={16} />
              <span>{isExporting ? `Dışa Aktarılıyor (%${exportProgress})...` : 'Videoyu İndir'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Empty State Screen */}
      {clips.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div className="empty-state-card" style={{ maxWidth: '640px', width: '100%', textAlign: 'center', padding: '40px', background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f43f5e' }}>
              <Film size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Gelişmiş Çok Katmanlı Video Düzenleyici</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              CapCut tarzı görsel kırpma tutamakları, timeline katmanları, ses ve efektlerle profesyonel video editleyin.
            </p>

            <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', margin: '0 auto 30px' }} onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} />
              <span>Cihazdan Video Seç</span>
            </button>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '20px 0' }} />

            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Stok Kliplerle Hemen Başlayın:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {sampleVideos.map((sample, idx) => (
                <button 
                  key={idx} 
                  className="btn btn-secondary" 
                  style={{ padding: '10px', flexDirection: 'column', height: 'auto', fontSize: '0.8rem', gap: '6px' }}
                  onClick={() => handleSelectSample(sample)}
                >
                  <Film size={18} style={{ color: '#f43f5e' }} />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Active Hidden Video Source Element */}
          {activeClip && (
            <video 
              key={activeClip.id}
              ref={videoRef} 
              src={activeClip.url} 
              style={{ display: 'none' }}
              onLoadedMetadata={handleLoadedMetadata}
              muted={isMuted}
              playsInline
            />
          )}

          {/* Hidden Background Music Element */}
          {bgMusicSrc && (
            <audio 
              ref={bgAudioRef} 
              src={bgMusicSrc} 
              style={{ display: 'none' }} 
              loop
            />
          )}

          {/* Central Video Viewport */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b0f19', padding: '14px', overflow: 'hidden' }}>
            {/* Player Canvas Frame */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: '#000', border: '1px solid var(--border-color)' }}>
              <canvas 
                ref={canvasRef} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
              />

              {isExporting && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                  <Sparkles size={40} className="spin" style={{ color: '#f43f5e', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Video İşleniyor ve İndiriliyor...</h3>
                  <div style={{ width: '240px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                    <div style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(90deg, #f43f5e, #ec4899)', transition: 'width 0.2s linear' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Visual Filmstrip Clip Trimmer Track Bar (Exactly like Screenshot!) */}
            <div style={{ marginTop: '10px', background: '#000000', padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Time Ruler (Zaman Cetveli) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'monospace', color: '#94a3b8', padding: '0 4px', userSelect: 'none' }}>
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
                  const t = ratio * clipDur;
                  return <span key={ratio}>{formatTime(t)}</span>;
                })}
              </div>

              {/* Filmstrip Track Container with White Drag Handles */}
              <div 
                ref={timelineTrackRef}
                onClick={(e) => {
                  if (!timelineTrackRef.current || isDraggingHandle) return;
                  const rect = timelineTrackRef.current.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newT = (clickX / rect.width) * clipDur;
                  setCurrentTime(newT);
                  if (videoRef.current) videoRef.current.currentTime = newT;
                }}
                style={{ 
                  height: '52px', 
                  width: '100%', 
                  background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', 
                  borderRadius: '6px', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  border: '1.5px solid #334155',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                {/* Background Filmstrip Mock Repeat Pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.35, background: 'repeating-linear-gradient(90deg, #6366f1 0px, #ec4899 40px, #06b6d4 80px, #10b981 120px)' }} />

                {/* Left Trimmed Dim Area */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${trimLeftPct}%`, background: 'rgba(0,0,0,0.7)', zIndex: 2 }} />

                {/* Right Trimmed Dim Area */}
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${trimRightPct}%`, background: 'rgba(0,0,0,0.7)', zIndex: 2 }} />

                {/* Active Active Trim Highlight Border Box */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: `${trimLeftPct}%`, 
                    right: `${trimRightPct}%`, 
                    top: 0, 
                    bottom: 0, 
                    borderTop: '2.5px solid #ffffff', 
                    borderBottom: '2.5px solid #ffffff', 
                    zIndex: 3, 
                    pointerEvents: 'none' 
                  }} 
                />

                {/* Left White Drag Handle (Sol Tutamak - Circled in SS) */}
                <div 
                  onMouseDown={(e) => handleTimelineMouseDown(e, 'left')}
                  style={{ 
                    position: 'absolute', 
                    left: `calc(${trimLeftPct}% - 7px)`, 
                    top: 0, 
                    bottom: 0, 
                    width: '14px', 
                    background: '#ffffff', 
                    borderRadius: '6px 0 0 6px', 
                    zIndex: 10, 
                    cursor: 'ew-resize', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center', 
                    boxShadow: '0 0 8px rgba(0,0,0,0.5)' 
                  }}
                  title="Başlangıç Kırpma Tutamağı (Sürükleyin)"
                >
                  <div style={{ width: '2px', height: '16px', background: '#0f172a', borderRadius: '1px' }} />
                </div>

                {/* Right White Drag Handle (Sağ Tutamak - Circled in SS) */}
                <div 
                  onMouseDown={(e) => handleTimelineMouseDown(e, 'right')}
                  style={{ 
                    position: 'absolute', 
                    left: `calc(${100 - trimRightPct}% - 7px)`, 
                    top: 0, 
                    bottom: 0, 
                    width: '14px', 
                    background: '#ffffff', 
                    borderRadius: '0 6px 6px 0', 
                    zIndex: 10, 
                    cursor: 'ew-resize', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center', 
                    boxShadow: '0 0 8px rgba(0,0,0,0.5)' 
                  }}
                  title="Bitiş Kırpma Tutamağı (Sürükleyin)"
                >
                  <div style={{ width: '2px', height: '16px', background: '#0f172a', borderRadius: '1px' }} />
                </div>

                {/* Green Playhead Needle */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: `${playheadPct}%`, 
                    top: 0, 
                    bottom: 0, 
                    width: '2.5px', 
                    background: '#84cc16', 
                    zIndex: 8, 
                    pointerEvents: 'none' 
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10.5px', height: '10px', background: '#84cc16', borderRadius: '2px' }} />
                </div>
              </div>

              {/* Action Pill Buttons Row (Underneath Timeline Bar - Exactly like Screenshot!) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Video Başlat / Durdur (Play / Pause) Button */}
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '8px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', borderColor: '#f43f5e' }} 
                    onClick={togglePlay}
                    title={isPlaying ? 'Videoyu Durdur' : 'Videoyu Oynat'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? 'Durdur' : 'Oynat'}</span>
                  </button>

                  {/* Interactive Hover Volume Icon & Slider Popup */}
                  <div 
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setShowVolumePopup(true)}
                    onMouseLeave={() => setShowVolumePopup(false)}
                  >
                    <button 
                      className="btn-icon" 
                      onClick={() => {
                        if (videoAudioVolume === 0 || isMuted) {
                          setIsMuted(false);
                          if (videoAudioVolume === 0) setVideoAudioVolume(1.0);
                        } else {
                          setIsMuted(true);
                        }
                      }} 
                      title={isMuted || videoAudioVolume === 0 ? 'Sesi Aç' : 'Sesi Kapat'}
                    >
                      {isMuted || videoAudioVolume === 0 ? (
                        <VolumeX size={16} style={{ color: '#f43f5e' }} />
                      ) : (
                        <Volume2 size={16} style={{ color: '#10b981' }} />
                      )}
                    </button>

                    {/* Hover Volume Slider Popover */}
                    {showVolumePopup && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          left: '32px', 
                          bottom: '-4px', 
                          background: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid var(--border-color)', 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          zIndex: 100, 
                          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.02" 
                          value={isMuted ? 0 : videoAudioVolume} 
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setVideoAudioVolume(val);
                            if (val > 0) setIsMuted(false);
                            if (videoRef.current) videoRef.current.volume = val;
                          }} 
                          className="range-slider"
                          style={{ width: '80px', accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, minWidth: '32px' }}>
                          {isMuted ? '0%' : `${Math.round(videoAudioVolume * 100)}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginRight: '4px' }}>
                    {formatTime(currentTime)} / {formatTime(clipDur)}
                  </span>

                  <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 2px' }} />

                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => addClipInputRef.current?.click()}>
                    <Film size={14} style={{ color: '#f43f5e' }} />
                    <span>Düzenleyicide Aç</span>
                  </button>

                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={handleAddTextOverlay}>
                    <Sparkles size={14} style={{ color: '#ec4899' }} />
                    <span>Generate Subtitles / Metin</span>
                  </button>

                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => audioFileInputRef.current?.click()}>
                    <Volume2 size={14} style={{ color: '#10b981' }} />
                    <span>Ses & Müzik</span>
                  </button>
                </div>

                <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem', borderRadius: '8px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }} onClick={handleExportVideo}>
                  <Download size={14} />
                  <span>İndir</span>
                </button>
              </div>
            </div>

            {/* Multi-Track Layers Panel */}
            <div style={{ marginTop: '10px', background: 'var(--bg-panel)', padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e' }}>
                  <Layers size={14} />
                  <span>Katmanlar (Multi-Track)</span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleAddTrack('video')}>+ Video Katmanı</button>
                  <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleAddTrack('text')}>+ Metin Katmanı</button>
                  <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleAddTrack('audio')}>+ Ses Katmanı</button>
                </div>
              </div>

              {tracks.map((track) => (
                <div key={track.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(15,23,42,0.6)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: track.color }} />
                    <span style={{ fontWeight: 600 }}>{track.name}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button 
                      className="btn-icon" 
                      style={{ padding: '3px', color: track.visible ? 'var(--text-main)' : 'var(--text-muted)' }} 
                      onClick={() => handleToggleTrackVisibility(track.id)}
                      title={track.visible ? 'Katmanı Gizle' : 'Katmanı Göster'}
                    >
                      {track.visible ? <Eye size={14} /> : <EyeOff size={14} style={{ color: '#ef4444' }} />}
                    </button>

                    <button 
                      className="btn-icon" 
                      style={{ padding: '3px', color: track.muted ? '#ef4444' : 'var(--text-main)' }} 
                      onClick={() => handleToggleTrackMute(track.id)}
                      title={track.muted ? 'Katman Sesini Aç' : 'Katman Sesini Kapat'}
                    >
                      {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    {/* Katman Silme Butonu (Her katman için sil tuşu) */}
                    <button 
                      className="btn-icon" 
                      style={{ padding: '3px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }} 
                      onClick={() => handleRemoveTrack(track.id)}
                      title="Katmanı Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Sidebar Control Tools */}
          <div style={{ width: '320px', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. En-Boy Oranı & Sığdırma (Aspect Ratio & Fit) */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1' }}>
                <Maximize2 size={15} />
                <span>En-Boy Oranı & Kırpma (Fit)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '10px' }}>
                {[
                  { id: '16:9', label: '16:9 Yatay' },
                  { id: '9:16', label: '9:16 Reels' },
                  { id: '1:1',  label: '1:1 Kare' },
                  { id: '4:5',  label: '4:5 Insta' },
                  { id: '4:3',  label: '4:3 Standard' },
                  { id: '21:9', label: '21:9 Sinema' }
                ].map((ar) => (
                  <button 
                    key={ar.id} 
                    className={`btn ${aspectRatio === ar.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 6px', fontSize: '0.7rem', justifyContent: 'center', textAlign: 'center' }}
                    onClick={() => setAspectRatio(ar.id)}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>

              {/* Fit Mode Buttons (Centered Text) */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className={`btn ${objectFit === 'cover' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '6px 4px', fontSize: '0.7rem', justifyContent: 'center', textAlign: 'center' }} onClick={() => setObjectFit('cover')}>Doldur & Kırp</button>
                <button className={`btn ${objectFit === 'contain' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '6px 4px', fontSize: '0.7rem', justifyContent: 'center', textAlign: 'center' }} onClick={() => setObjectFit('contain')}>Ortala Sığdır</button>
                <button className={`btn ${objectFit === 'fill' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '6px 4px', fontSize: '0.7rem', justifyContent: 'center', textAlign: 'center' }} onClick={() => setObjectFit('fill')}>Esnet</button>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

            {/* 2. Oynatma Hızı (Playback Speed - Clean Multipliers only) */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e' }}>
                <Gauge size={15} />
                <span>Oynatma Hızı</span>
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hız Çarpanı:</label>
                <select 
                  value={playbackSpeed} 
                  onChange={(e) => {
                    const spd = parseFloat(e.target.value);
                    setPlaybackSpeed(spd);
                    if (videoRef.current) videoRef.current.playbackRate = spd;
                  }}
                  className="select-input"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', width: '90px' }}
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2.0}>2.0x</option>
                  <option value={3.0}>3.0x</option>
                </select>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

            {/* 3. Geçiş Efektleri (Transitions) */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#ec4899' }}>
                <ArrowRightLeft size={15} />
                <span>Geçiş Efekti (Transition)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                {[
                  { id: 'none',  name: 'Yok (Düz)' },
                  { id: 'fade',  name: '✨ Erime (Fade)' },
                  { id: 'flash', name: '⚡ Beyaz Flaş' },
                  { id: 'zoom',  name: '🔍 Odaklanma' }
                ].map((tr) => (
                  <button 
                    key={tr.id} 
                    className={`btn ${transitionType === tr.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 6px', fontSize: '0.7rem', justifyContent: 'center' }}
                    onClick={() => setTransitionType(tr.id)}
                  >
                    {tr.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

            {/* 4. Ses & Arka Plan Müziği (Audio & Background Music) */}
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <Music size={15} />
                <span>Ses & Arka Plan Müziği</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }} onClick={() => audioFileInputRef.current?.click()}>
                  <Upload size={14} />
                  <span>Cihazdan Müzik Yükle</span>
                </button>

                {bgMusicName && (
                  <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🎵 {bgMusicName}</span>
                    <button className="btn-icon" style={{ padding: '2px', color: '#ef4444' }} onClick={() => { setBgMusicSrc(null); setBgMusicName(''); }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {/* Stock Royalty-Free Music Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stok Müzikler:</label>
                  {sampleMusicTracks.map((tr, idx) => (
                    <button 
                      key={idx}
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.7rem', justifyContent: 'flex-start' }}
                      onClick={() => {
                        setBgMusicSrc(tr.url);
                        setBgMusicName(tr.name);
                      }}
                    >
                      <span>{tr.name}</span>
                    </button>
                  ))}
                </div>

                {/* Audio Volume Controls */}
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                      <span>🎬 Video Orijinal Sesi</span>
                      <span>{Math.round(videoAudioVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.05" 
                      value={videoAudioVolume} 
                      onChange={(e) => setVideoAudioVolume(parseFloat(e.target.value))} 
                      className="range-slider"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                      <span>🎵 Arka Plan Müziği Sesi</span>
                      <span>{Math.round(bgMusicVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.05" 
                      value={bgMusicVolume} 
                      onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))} 
                      className="range-slider"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
