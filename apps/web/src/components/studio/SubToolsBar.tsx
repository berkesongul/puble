// @ts-nocheck
"use client";

import React from 'react';
import { 
  Plus, 
  Circle, 
  Square, 
  Triangle, 
  Minus,
  Pencil,
  Eraser,
  SlidersHorizontal,
  Smile,
  Check,
  X,
  Maximize2,
  RotateCcw,
  FileCode,
  Code,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2
} from 'lucide-react';

export default function SubToolsBar({ 
  activeTool, 
  setActiveTool,
  brushColor, 
  setBrushColor, 
  brushWidth, 
  setBrushWidth,
  eraserWidth,
  setEraserWidth,
  textColor,
  setTextColor,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  onAddText,
  onAddShape,
  onAddSticker,
  onApplyFilter,
  activeFilter,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  blurVal,
  setBlurVal,
  altText,
  setAltText,
  metaTitle,
  setMetaTitle,
  metaAuthor,
  setMetaAuthor,
  onOpenHtmlModal,
  onAddOverlayClick,
  selectedObjectProps,
  onUpdateObject,
  onDeleteLayer,
  onApplyCrop,
  onCancelCrop,
  onSetCropRatio,
  cropRatio,
  customRatioW,
  customRatioH,
  onCustomRatioChange
}) {
  const stickersList = [
    '🔥', '⭐', '❤️', '⚡', '👑', '🎉', '🚀', '📸', 
    '🎨', '🌈', '💎', '💡', '🏆', '💯', '✨', '🎯',
    '😍', '😎', '🥳', '👻', '💬', '💥', '📍', '🏷️'
  ];

  if (activeTool === 'adjustments') {
    const adjustValue = (setter, currentVal, delta, minV, maxV) => {
      const next = Math.min(maxV, Math.max(minV, Math.round((currentVal + delta) * 100) / 100));
      setter(next);
    };

    return (
      <div className="tool-options-bar" style={{ borderColor: 'var(--border-color)', overflowX: 'auto', gap: '14px' }}>
        <div className="option-group" style={{ flexShrink: 0 }}>
          <SlidersHorizontal size={16} style={{ color: '#836fff' }} />
          <label style={{ color: '#836fff', fontWeight: 700 }}>Ayarlar:</label>
        </div>

        {/* ☀️ Parlaklık Control */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem', width: '100px' }}>☀️ Parlaklık ({Math.round(brightness * 100) > 0 ? `+${Math.round(brightness * 100)}%` : `${Math.round(brightness * 100)}%`}):</label>
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setBrightness, brightness, -0.05, -0.5, 0.5)}
            title="Parlaklığı Azalt (-5%)"
          >
            -
          </button>
          <input 
            type="range" 
            min="-0.5" 
            max="0.5" 
            step="0.01" 
            value={brightness} 
            onChange={(e) => setBrightness(parseFloat(e.target.value))} 
            className="range-slider"
            style={{ width: '90px' }}
          />
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setBrightness, brightness, 0.05, -0.5, 0.5)}
            title="Parlaklığı Artır (+5%)"
          >
            +
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* ◐ Kontrast Control */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem', width: '95px' }}>◐ Kontrast ({Math.round(contrast * 100) > 0 ? `+${Math.round(contrast * 100)}%` : `${Math.round(contrast * 100)}%`}):</label>
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setContrast, contrast, -0.05, -0.5, 0.5)}
            title="Kontrastı Azalt (-5%)"
          >
            -
          </button>
          <input 
            type="range" 
            min="-0.5" 
            max="0.5" 
            step="0.01" 
            value={contrast} 
            onChange={(e) => setContrast(parseFloat(e.target.value))} 
            className="range-slider"
            style={{ width: '90px' }}
          />
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setContrast, contrast, 0.05, -0.5, 0.5)}
            title="Kontrastı Artır (+5%)"
          >
            +
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* 🎨 Doygunluk Control */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem', width: '105px' }}>🎨 Doygunluk ({Math.round(saturation * 100) > 0 ? `+${Math.round(saturation * 100)}%` : `${Math.round(saturation * 100)}%`}):</label>
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setSaturation, saturation, -0.1, -1, 1)}
            title="Doygunluğu Azalt (-10%)"
          >
            -
          </button>
          <input 
            type="range" 
            min="-1" 
            max="1" 
            step="0.02" 
            value={saturation} 
            onChange={(e) => setSaturation(parseFloat(e.target.value))} 
            className="range-slider"
            style={{ width: '90px' }}
          />
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setSaturation, saturation, 0.1, -1, 1)}
            title="Doygunluğu Artır (+10%)"
          >
            +
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* 💧 Bulanıklık Control */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem', width: '100px' }}>💧 Bulanıklık ({Math.round(blurVal * 100)}%):</label>
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setBlurVal, blurVal, -0.05, 0, 0.6)}
            title="Bulanıklığı Azalt (-5%)"
          >
            -
          </button>
          <input 
            type="range" 
            min="0" 
            max="0.6" 
            step="0.01" 
            value={blurVal} 
            onChange={(e) => setBlurVal(parseFloat(e.target.value))} 
            className="range-slider"
            style={{ width: '80px' }}
          />
          <button 
            className="btn-icon" 
            style={{ width: '24px', height: '24px', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
            onClick={() => adjustValue(setBlurVal, blurVal, 0.05, 0, 0.6)}
            title="Bulanıklığı Artır (+5%)"
          >
            +
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Reset Button */}
        <button 
          className="btn btn-secondary" 
          style={{ padding: '4px 10px', fontSize: '0.75rem', marginLeft: 'auto', flexShrink: 0 }}
          onClick={() => {
            onApplyFilter('normal');
            setBrightness(0);
            setContrast(0);
            setSaturation(0);
            setBlurVal(0);
          }}
          title="Tüm filtre ve ayarları varsayılana sıfırla"
        >
          <RotateCcw size={14} />
          <span>Sıfırla</span>
        </button>
      </div>
    );
  }

  if (activeTool === 'crop') {
    return (
      <div className="tool-options-bar" style={{ borderColor: 'rgba(131, 111, 255, 0.35)', overflowX: 'auto' }}>
        <div className="option-group" style={{ flexShrink: 0 }}>
          <Maximize2 size={16} style={{ color: 'var(--mint)' }} />
          <label style={{ color: 'var(--mint)', fontWeight: 700 }}>En/Boy Oranı (Aspect Ratio):</label>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button className={`btn ${cropRatio === 'free' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('free')}>Serbest</button>
          <button className={`btn ${cropRatio === '1:1' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('1:1')}>1:1 Kare</button>
          <button className={`btn ${cropRatio === '4:5' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('4:5')}>4:5 Insta</button>
          <button className={`btn ${cropRatio === '16:9' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('16:9')}>16:9 Geniş</button>
          <button className={`btn ${cropRatio === '9:16' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('9:16')}>9:16 Dikey</button>
          <button className={`btn ${cropRatio === '4:3' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('4:3')}>4:3 Standard</button>
          <button className={`btn ${cropRatio === '21:9' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSetCropRatio('21:9')}>21:9 Sinema</button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Custom Aspect Ratio Numeric Inputs */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Özel Oran:</label>
          <input 
            type="number" 
            min="1" 
            max="100"
            value={customRatioW} 
            onChange={(e) => onCustomRatioChange(parseInt(e.target.value, 10) || 1, customRatioH)}
            style={{ width: '40px', padding: '3px 4px', borderRadius: '4px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.75rem', textAlign: 'center' }}
            title="Genişlik Oranı"
          />
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <input 
            type="number" 
            min="1" 
            max="100"
            value={customRatioH} 
            onChange={(e) => onCustomRatioChange(customRatioW, parseInt(e.target.value, 10) || 1)}
            style={{ width: '40px', padding: '3px 4px', borderRadius: '4px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.75rem', textAlign: 'center' }}
            title="Yükseklik Oranı"
          />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
          <button className="btn btn-primary" onClick={onApplyCrop}>
            <Check size={16} />
            <span>Uygula</span>
          </button>

          <button className="btn btn-secondary" onClick={onCancelCrop}>
            <X size={16} />
            <span>İptal</span>
          </button>
        </div>
      </div>
    );
  }

  if (activeTool === 'brush') {
    return (
      <div className="tool-options-bar">
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.6)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            onClick={() => setActiveTool('brush')}
          >
            <Pencil size={14} />
            <span>Fırça Modu</span>
          </button>
          <button 
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            onClick={() => setActiveTool('eraser')}
          >
            <Eraser size={14} />
            <span>Silgiye Geç</span>
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

        <div className="option-group">
          <label>Fırça Rengi:</label>
          <input 
            type="color" 
            value={brushColor} 
            onChange={(e) => setBrushColor(e.target.value)} 
            className="color-picker-input"
          />
        </div>

        <div className="option-group">
          <label>Kalınlık ({brushWidth}px):</label>
          <input 
            type="range" 
            min="2" 
            max="100" 
            value={brushWidth} 
            onChange={(e) => setBrushWidth(parseInt(e.target.value, 10))} 
            className="range-slider"
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {[5, 15, 30, 60].map((sz) => (
            <button 
              key={sz} 
              className={`btn-icon ${brushWidth === sz ? 'active' : ''}`}
              style={{ fontSize: '0.7rem', padding: '2px 8px' }}
              onClick={() => setBrushWidth(sz)}
            >
              {sz}px
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTool === 'eraser') {
    return (
      <div className="tool-options-bar" style={{ borderColor: 'rgba(21, 245, 186, 0.4)' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(12,16,46,0.7)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            onClick={() => setActiveTool('brush')}
          >
            <Pencil size={14} />
            <span>Fırçaya Geç</span>
          </button>
          <button 
            className="btn btn-accent"
            style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'var(--puble-gradient)', color: '#fff' }}
            onClick={() => setActiveTool('eraser')}
          >
            <Eraser size={14} />
            <span>Silgi Modu Aktif</span>
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

        <div className="option-group">
          <label style={{ color: 'var(--mint)', fontWeight: 700 }}>Silgi Boyutu ({eraserWidth}px):</label>
          <input 
            type="range" 
            min="4" 
            max="120" 
            value={eraserWidth} 
            onChange={(e) => setEraserWidth(parseInt(e.target.value, 10))} 
            className="range-slider"
            style={{ accentColor: 'var(--mint)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', marginLeft: '10px' }}>
          {[10, 25, 50, 90].map((sz) => (
            <button 
              key={sz} 
              className={`btn-icon ${eraserWidth === sz ? 'active' : ''}`}
              style={{ fontSize: '0.7rem', padding: '2px 8px' }}
              onClick={() => setEraserWidth(sz)}
            >
              {sz}px
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--mint)', fontWeight: 600 }}>
          🧹 Çizimlerin ve ögelerin üzerini sürükleyerek silebilirsiniz.
        </div>
      </div>
    );
  }

  if (activeTool === 'text' || selectedObjectProps?.isText) {
    const isBold = selectedObjectProps?.fontWeight === 'bold';
    const isItalic = selectedObjectProps?.fontStyle === 'italic';
    const isUnderline = selectedObjectProps?.underline;
    const isLinethrough = selectedObjectProps?.linethrough;
    const textAlign = selectedObjectProps?.textAlign || 'left';
    const boxBg = selectedObjectProps?.textBackgroundColor || '';

    return (
      <div className="tool-options-bar" style={{ borderColor: 'rgba(131, 111, 255, 0.35)', overflowX: 'auto', gap: '10px' }}>
        <button className="btn btn-primary" style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onAddText('Başlık Yazısı', { fontSize: 36, fontWeight: 'bold' })}>
          <Plus size={14} />
          <span>Başlık</span>
        </button>

        <button className="btn btn-secondary" style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onAddText('Açıklama Metni', { fontSize: 22 })}>
          <Plus size={14} />
          <span>Metin</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Yazı Rengi */}
        <div className="option-group" style={{ flexShrink: 0 }} title="Metin Rengi">
          <label style={{ fontSize: '0.75rem' }}>Renk:</label>
          <input 
            type="color" 
            value={selectedObjectProps?.fill || textColor} 
            onChange={(e) => {
              setTextColor(e.target.value);
              if (selectedObjectProps?.isText) {
                onUpdateObject({ fill: e.target.value });
              }
            }} 
            className="color-picker-input"
          />
        </div>

        {/* Font Family */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <select 
            value={selectedObjectProps?.fontFamily || fontFamily} 
            onChange={(e) => {
              setFontFamily(e.target.value);
              if (selectedObjectProps?.isText) {
                onUpdateObject({ fontFamily: e.target.value });
              }
            }} 
            className="select-input"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            <option value="Plus Jakarta Sans">Modern (Sans)</option>
            <option value="Playfair Display">Klasik (Serif)</option>
            <option value="Pacifico">El Yazısı</option>
            <option value="Space Mono">Kod / Daktilo</option>
            <option value="Arial">Arial</option>
            <option value="Impact">Impact</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem' }}>Boyut ({selectedObjectProps?.fontSize || fontSize}px):</label>
          <input 
            type="range" 
            min="12" 
            max="120" 
            value={selectedObjectProps?.fontSize || fontSize} 
            onChange={(e) => {
              const sz = parseInt(e.target.value, 10);
              setFontSize(sz);
              if (selectedObjectProps?.isText) {
                onUpdateObject({ fontSize: sz });
              }
            }} 
            className="range-slider"
            style={{ width: '70px' }}
          />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Text Style Toggles (Bold, Italic, Underline, Strikethrough) */}
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <button 
            className={`btn-icon ${isBold ? 'active' : ''}`} 
            style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: 800 }}
            onClick={() => onUpdateObject({ fontWeight: isBold ? 'normal' : 'bold' })}
            title="Kalın (Bold)"
          >
            <Bold size={14} />
          </button>
          <button 
            className={`btn-icon ${isItalic ? 'active' : ''}`} 
            style={{ padding: '4px 8px', fontStyle: 'italic' }}
            onClick={() => onUpdateObject({ fontStyle: isItalic ? 'normal' : 'italic' })}
            title="Eğik (Italic)"
          >
            <Italic size={14} />
          </button>
          <button 
            className={`btn-icon ${isUnderline ? 'active' : ''}`} 
            style={{ padding: '4px 8px' }}
            onClick={() => onUpdateObject({ underline: !isUnderline })}
            title="Altı Çizili (Underline)"
          >
            <Underline size={14} />
          </button>
          <button 
            className={`btn-icon ${isLinethrough ? 'active' : ''}`} 
            style={{ padding: '4px 8px' }}
            onClick={() => onUpdateObject({ linethrough: !isLinethrough })}
            title="Üstü Çizili (Strikethrough)"
          >
            <Strikethrough size={14} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Paragraf Hizalama (Align Left, Center, Right, Justify) */}
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <button 
            className={`btn-icon ${textAlign === 'left' ? 'active' : ''}`} 
            style={{ padding: '4px 8px' }}
            onClick={() => onUpdateObject({ textAlign: 'left' })}
            title="Sola Hizala"
          >
            <AlignLeft size={14} />
          </button>
          <button 
            className={`btn-icon ${textAlign === 'center' ? 'active' : ''}`} 
            style={{ padding: '4px 8px' }}
            onClick={() => onUpdateObject({ textAlign: 'center' })}
            title="Ortala"
          >
            <AlignCenter size={14} />
          </button>
          <button 
            className={`btn-icon ${textAlign === 'right' ? 'active' : ''}`} 
            style={{ padding: '4px 8px' }}
            onClick={() => onUpdateObject({ textAlign: 'right' })}
            title="Sağa Hizala"
          >
            <AlignRight size={14} />
          </button>
          <button 
            className={`btn-icon ${textAlign === 'justify' ? 'active' : ''}`} 
            style={{ padding: '4px 8px' }}
            onClick={() => onUpdateObject({ textAlign: 'justify' })}
            title="İki Yana Yasla"
          >
            <AlignJustify size={14} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Metin Kutu (Box) Arka Plan Rengi */}
        <div className="option-group" style={{ flexShrink: 0 }} title="Metin Arkası Kutu Dolgusu">
          <label style={{ fontSize: '0.75rem' }}>Box Rengi:</label>
          <input 
            type="color" 
            value={boxBg && boxBg !== 'transparent' ? boxBg : '#0d1134'} 
            onChange={(e) => onUpdateObject({ textBackgroundColor: e.target.value })} 
            className="color-picker-input"
          />
          {boxBg && (
            <button 
              className="btn-icon" 
              style={{ padding: '2px 6px', fontSize: '0.65rem' }}
              onClick={() => onUpdateObject({ textBackgroundColor: '' })}
              title="Kutuyu Kaldır"
            >
              Kaldır
            </button>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Gölge ve Glow Efekti */}
        <div className="option-group" style={{ flexShrink: 0 }} title="Metin Gölgesi / Glow">
          <label style={{ fontSize: '0.75rem' }}>Gölge / Glow:</label>
          <input 
            type="color" 
            value={selectedObjectProps?.shadowColor || '#000000'} 
            onChange={(e) => {
              const col = e.target.value;
              const blur = selectedObjectProps?.shadowBlur || 12;
              onUpdateObject({ 
                shadowProps: { color: col, blur: blur, offsetX: 2, offsetY: 2 } 
              });
            }} 
            className="color-picker-input"
          />
          <input 
            type="range" 
            min="0" 
            max="40" 
            value={selectedObjectProps?.shadowBlur || 0} 
            onChange={(e) => {
              const b = parseInt(e.target.value, 10);
              const col = selectedObjectProps?.shadowColor || '#836fff';
              onUpdateObject({ 
                shadowProps: { color: col, blur: b, offsetX: b > 0 ? 2 : 0, offsetY: b > 0 ? 2 : 0 } 
              });
            }} 
            className="range-slider"
            style={{ width: '60px' }}
            title="Gölge / Glow Miktarı"
          />
        </div>
      </div>
    );
  }

  if (activeTool === 'shapes') {
    return (
      <div className="tool-options-bar">
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Şekil Ekle:</label>
        
        <button className="btn btn-secondary" onClick={() => onAddShape('rect')}>
          <Square size={16} />
          <span>Dikdörtgen</span>
        </button>

        <button className="btn btn-secondary" onClick={() => onAddShape('circle')}>
          <Circle size={16} />
          <span>Daire</span>
        </button>

        <button className="btn btn-secondary" onClick={() => onAddShape('triangle')}>
          <Triangle size={16} />
          <span>Üçgen</span>
        </button>

        <button className="btn btn-secondary" onClick={() => onAddShape('line')}>
          <Minus size={16} />
          <span>Çizgi</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

        <div className="option-group">
          <label>Dolgu:</label>
          <input 
            type="color" 
            value={selectedObjectProps?.fill || '#836fff'} 
            onChange={(e) => onUpdateObject({ fill: e.target.value })} 
            className="color-picker-input"
          />
        </div>
      </div>
    );
  }

  if (activeTool === 'stickers') {
    return (
      <div className="tool-options-bar" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Smile size={18} style={{ color: '#a5b4fc' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Etiketler:</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          {stickersList.map((emoji, idx) => (
            <button 
              key={idx} 
              className="sticker-btn"
              style={{ width: '36px', height: '36px', fontSize: '1.2rem', flexShrink: 0 }}
              onClick={() => onAddSticker(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTool === 'overlay') {
    return (
      <div className="tool-options-bar">
        <button className="btn btn-primary" onClick={onAddOverlayClick}>
          <Plus size={16} />
          <span>İkincil Fotoğraf / Logo Ekle</span>
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Görselinizin üzerine logo, filigran veya ikinci bir resim yerleştirebilirsiniz.
        </span>
      </div>
    );
  }

  if (activeTool === 'metadata') {
    return (
      <div className="tool-options-bar" style={{ borderColor: 'var(--border-color)', overflowX: 'auto', gap: '14px' }}>
        <div className="option-group" style={{ flexShrink: 0 }}>
          <FileCode size={16} style={{ color: '#0002a1' }} />
          <label style={{ color: '#0002a1', fontWeight: 700 }}>Fotoğraf Bilgileri (Metadata):</label>
        </div>

        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem' }}>Alt Metin (Alt):</label>
          <input 
            type="text" 
            placeholder="Görsel açıklaması..."
            value={altText || ''} 
            onChange={(e) => setAltText(e.target.value)} 
            className="select-input"
            style={{ width: '130px' }}
          />
        </div>

        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem' }}>Başlık (Title):</label>
          <input 
            type="text" 
            placeholder="Fotoğraf başlığı..."
            value={metaTitle || ''} 
            onChange={(e) => setMetaTitle(e.target.value)} 
            className="select-input"
            style={{ width: '130px' }}
          />
        </div>

        <div className="option-group" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '0.75rem' }}>Yazar:</label>
          <input 
            type="text" 
            placeholder="Yazar adı..."
            value={metaAuthor || ''} 
            onChange={(e) => setMetaAuthor(e.target.value)} 
            className="select-input"
            style={{ width: '110px' }}
          />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', flexShrink: 0 }} />

        <button 
          className="btn btn-primary" 
          onClick={onOpenHtmlModal}
          style={{ padding: '4px 12px', fontSize: '0.75rem', marginLeft: 'auto', flexShrink: 0 }}
          title="HTML & SEO kodları üret"
        >
          <Code size={14} />
          <span>HTML Kodu Al</span>
        </button>
      </div>
    );
  }

  if (selectedObjectProps) {
    return (
      <div className="tool-options-bar">
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc' }}>
          Seçili Nesne: {selectedObjectProps.type}
        </span>
        <div className="option-group">
          <label>Opaklık ({Math.round((selectedObjectProps.opacity || 1) * 100)}%):</label>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.05"
            value={selectedObjectProps.opacity || 1} 
            onChange={(e) => onUpdateObject({ opacity: parseFloat(e.target.value) })} 
            className="range-slider"
          />
        </div>
      </div>
    );
  }

  return null;
}
