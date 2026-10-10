import React from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  Code,
  Film
} from 'lucide-react';

export default function Header({ 
  onUploadClick, 
  onDownload, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  onClear,
  onZoomIn,
  onZoomOut,
  zoomLevel,
  hasImage,
  onOpenHtmlModal,
  onOpenVideoStudio
}) {
  return (
    <header className="app-header">
      <div className="logo-area">
        <div className="logo-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="logo-text">PhotoCraft Studio</h1>
        </div>
        <span className="logo-badge">Pro Edition</span>
      </div>

      <div className="header-actions">
        {/* Video Studio Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenVideoStudio}
          style={{ borderColor: '#f43f5e', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}
          title="Video Düzenleyici Moduna Geç"
        >
          <Film size={16} />
          <span>Video Stüdyosu</span>
        </button>
        {/* Undo / Redo */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="btn-icon" 
            onClick={onUndo} 
            disabled={!canUndo}
            title="Geri Al (Ctrl+Z)"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            className="btn-icon" 
            onClick={onRedo} 
            disabled={!canRedo}
            title="Yinele (Ctrl+Y)"
          >
            <RotateCw size={18} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

        {/* Zoom */}
        {hasImage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="btn-icon" onClick={onZoomOut} title="Uzaklaştır">
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '42px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button className="btn-icon" onClick={onZoomIn} title="Yakınlaştır">
              <ZoomIn size={16} />
            </button>
          </div>
        )}

        {hasImage && (
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
        )}

        {/* Clear */}
        {hasImage && (
          <button className="btn btn-secondary" onClick={onClear} title="Tuvali Temizle">
            <Trash2 size={16} />
            <span>Temizle</span>
          </button>
        )}

        {/* Upload Button */}
        <button className="btn btn-secondary" onClick={onUploadClick}>
          <Upload size={16} />
          <span>Fotoğraf Yükle</span>
        </button>

        {/* HTML Tag & Embed Code Button */}
        {hasImage && (
          <button 
            className="btn btn-secondary" 
            onClick={onOpenHtmlModal}
            style={{ borderColor: '#06b6d4', color: '#38bdf8' }}
            title="HTML Etiketleri & Embed Kodları Üret"
          >
            <Code size={16} />
            <span>HTML Kodu Al</span>
          </button>
        )}

        {/* Download / Export Button */}
        <button 
          className="btn btn-primary" 
          onClick={onDownload}
          disabled={!hasImage}
        >
          <Download size={16} />
          <span>İndir</span>
        </button>
      </div>
    </header>
  );
}
