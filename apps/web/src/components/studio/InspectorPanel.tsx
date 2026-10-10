// @ts-nocheck
"use client";

import React from 'react';
import { Smile, Sliders, Square, Circle, Triangle, Minus, Shapes } from 'lucide-react';

export default function InspectorPanel({ 
  activeTool,
  onAddSticker, 
  onAddShape,
  activeFilter, 
  onApplyFilter 
}) {
  const stickersList = [
    '🔥', '⭐', '❤️', '⚡', '👑', '🎉', '🚀', '📸', 
    '🎨', '🌈', '💎', '💡', '🏆', '💯', '✨', '🎯',
    '😍', '😎', '🥳', '👻', '💬', '💥', '📍', '🏷️'
  ];

  const filterPresets = [
    { id: 'normal', name: 'Normal' },
    { id: 'grayscale', name: 'Siyah-Beyaz' },
    { id: 'sepia', name: 'Sepya' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'warm', name: 'Sıcak Ton' },
    { id: 'cool', name: 'Soğuk Ton' },
    { id: 'invert', name: 'Ters Çevir' },
    { id: 'blur', name: 'Bulanık' },
  ];

  const isAdjustmentsMode = activeTool === 'adjustments';

  return (
    <aside className="inspector-panel">
      {/* Header Title */}
      <div 
        style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          color: 'var(--text-main)',
          fontSize: '0.9rem'
        }}
      >
        {isAdjustmentsMode ? (
          <>
            <Sliders size={18} style={{ color: '#0002a1' }} />
            <span>Fotoğraf Filtreleri</span>
          </>
        ) : (
          <>
            <Smile size={18} style={{ color: '#836fff' }} />
            <span>Emojiler</span>
          </>
        )}
      </div>

      {/* Content Body */}
      {isAdjustmentsMode ? (
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Fotoğrafınıza hazır bir filtre atmosferi uygulayın:
          </p>
          <div className="filters-grid">
            {filterPresets.map((f) => (
              <button
                key={f.id}
                className={`filter-card ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => onApplyFilter(f.id)}
              >
                <div className="filter-name">{f.name}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Emojiler Grid */}
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Fotoğrafa eklemek için bir emojiye tıklayın:
            </p>
            <div className="stickers-grid">
              {stickersList.map((emoji, idx) => (
                <button 
                  key={idx} 
                  className="sticker-btn"
                  onClick={() => onAddSticker(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

          {/* Şekiller Section (Under Emojis) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              <Shapes size={16} style={{ color: '#836fff' }} />
              <span>Geometrik Şekiller</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px 8px', flexDirection: 'column', height: 'auto', fontSize: '0.75rem', gap: '6px' }}
                onClick={() => onAddShape && onAddShape('rect')}
              >
                <Square size={20} style={{ color: '#836fff' }} />
                <span>Dikdörtgen</span>
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px 8px', flexDirection: 'column', height: 'auto', fontSize: '0.75rem', gap: '6px' }}
                onClick={() => onAddShape && onAddShape('circle')}
              >
                <Circle size={20} style={{ color: '#15f5ba' }} />
                <span>Daire</span>
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px 8px', flexDirection: 'column', height: 'auto', fontSize: '0.75rem', gap: '6px' }}
                onClick={() => onAddShape && onAddShape('triangle')}
              >
                <Triangle size={20} style={{ color: '#836fff' }} />
                <span>Üçgen</span>
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px 8px', flexDirection: 'column', height: 'auto', fontSize: '0.75rem', gap: '6px' }}
                onClick={() => onAddShape && onAddShape('line')}
              >
                <Minus size={20} style={{ color: '#15f5ba' }} />
                <span>Çizgi</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </aside>
  );
}
