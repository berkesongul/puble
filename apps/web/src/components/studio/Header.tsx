// @ts-nocheck
"use client";

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
  Film,
  BookmarkCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onDownload: () => void;
  onSaveToLibrary?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  hasImage: boolean;
  onOpenHtmlModal: () => void;
  onOpenVideoStudio: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function Header({ 
  onUploadClick, 
  onDownload, 
  onSaveToLibrary,
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
  onOpenVideoStudio,
  isFullscreen,
  onToggleFullscreen
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="logo-area">
        <div className="logo-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="logo-text">Puble Studio</h1>
        </div>
        <span className="logo-badge">Fotoğraf Editörü</span>
      </div>

      <div className="header-actions">
        {/* Video Studio Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenVideoStudio}
          style={{ borderColor: 'rgba(51, 47, 208, 0.2)', color: '#0002a1', background: 'linear-gradient(105deg, rgba(51, 47, 208, 0.06), rgba(21, 245, 186, 0.12))' }}
          title="Video Düzenleyici Moduna Geç"
          type="button"
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
            type="button"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="btn-icon" 
            onClick={onRedo} 
            disabled={!canRedo}
            title="Yinele (Ctrl+Y)"
            type="button"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)' }} />

        {/* Zoom */}
        {hasImage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="btn-icon" onClick={onZoomOut} title="Uzaklaştır" type="button">
              <ZoomOut size={15} />
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '38px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button className="btn-icon" onClick={onZoomIn} title="Yakınlaştır" type="button">
              <ZoomIn size={15} />
            </button>
          </div>
        )}

        {hasImage && (
          <div style={{ width: '1px', height: '22px', background: 'var(--border-color)' }} />
        )}

        {/* Clear */}
        {hasImage && (
          <button className="btn btn-secondary" onClick={onClear} title="Tuvali Temizle" type="button">
            <Trash2 size={15} />
            <span>Temizle</span>
          </button>
        )}

        {/* Upload Button */}
        <button className="btn btn-secondary" onClick={onUploadClick} type="button">
          <Upload size={15} />
          <span>Fotoğraf Yükle</span>
        </button>

        {/* HTML Tag & Embed Code Button */}
        {hasImage && (
          <button 
            className="btn btn-secondary" 
            onClick={onOpenHtmlModal}
            style={{ borderColor: 'rgba(131, 111, 255, 0.35)', color: '#a5b4fc', background: 'rgba(131, 111, 255, 0.1)' }}
            title="HTML Etiketleri & Embed Kodları Üret"
            type="button"
          >
            <Code size={15} />
            <span>HTML Kodu</span>
          </button>
        )}

        {/* Save to Library */}
        {onSaveToLibrary && (
          <button 
            className="btn btn-secondary" 
            onClick={onSaveToLibrary}
            style={{ borderColor: 'var(--mint)', color: 'var(--mint)', background: 'rgba(21, 245, 186, 0.1)' }}
            title="Puble Kitaplığına Kaydet"
            type="button"
          >
            <BookmarkCheck size={15} />
            <span>Kitaplığa Kaydet</span>
          </button>
        )}

        {/* Download / Export Button */}
        <button 
          className="btn btn-primary" 
          onClick={onDownload}
          disabled={!hasImage}
          type="button"
        >
          <Download size={15} />
          <span>İndir</span>
        </button>

        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button 
            className="btn-icon" 
            onClick={onToggleFullscreen} 
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
            type="button"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}
      </div>
    </header>
  );
}
