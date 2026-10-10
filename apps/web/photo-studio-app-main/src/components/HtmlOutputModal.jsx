import React, { useState } from 'react';
import { X, Copy, Check, Code, FileText, Share2, Info } from 'lucide-react';

export default function HtmlOutputModal({ 
  isOpen, 
  onClose, 
  canvasRef, 
  altText = 'Fotoğraf', 
  metaTitle = 'Fotocraft Düzenlenmiş Fotoğraf', 
  metaAuthor = 'Photocraft Studio',
  metaDescription = 'Photocraft Studio ile düzenlenmiş yüksek kaliteli görsel.'
}) {
  const [activeTab, setActiveTab] = useState('imgTag'); // 'imgTag' | 'figureTag' | 'metaTags'
  const [copiedTab, setCopiedTab] = useState(null);
  const [useBase64, setUseBase64] = useState(false);

  if (!isOpen) return null;

  const canvas = canvasRef?.current;
  const width = canvas?.width || 800;
  const height = canvas?.height || 600;

  // Generate Image Source
  let imageSrc = 'https://example.com/images/foto.png';
  if (useBase64 && canvas) {
    try {
      imageSrc = canvas.toDataURL('image/png', 0.9);
    } catch (e) {
      console.warn('Canvas toDataURL error:', e);
    }
  }

  // HTML Snippets
  const imgTagCode = `<img\n  src="${useBase64 ? imageSrc.substring(0, 80) + '...' : imageSrc}"\n  alt="${altText}"\n  title="${metaTitle}"\n  width="${width}"\n  height="${height}"\n  loading="lazy"\n/>`;

  const fullImgTagCode = `<img src="${imageSrc}" alt="${altText}" title="${metaTitle}" width="${width}" height="${height}" loading="lazy" />`;

  const figureTagCode = `<figure className="photo-card">\n  <img src="${useBase64 ? imageSrc.substring(0, 80) + '...' : imageSrc}" alt="${altText}" width="${width}" height="${height}" />\n  <figcaption>${metaTitle}${metaAuthor ? ' — ' + metaAuthor : ''}</figcaption>\n</figure>`;

  const fullFigureTagCode = `<figure className="photo-card">\n  <img src="${imageSrc}" alt="${altText}" width="${width}" height="${height}" />\n  <figcaption>${metaTitle}${metaAuthor ? ' — ' + metaAuthor : ''}</figcaption>\n</figure>`;

  const metaTagsCode = `<!-- SEO & OpenGraph Meta Etiketleri -->\n<title>${metaTitle}</title>\n<meta name="description" content="${metaDescription}" />\n<meta name="author" content="${metaAuthor}" />\n<meta property="og:title" content="${metaTitle}" />\n<meta property="og:description" content="${metaDescription}" />\n<meta property="og:image" content="${useBase64 ? imageSrc.substring(0, 80) + '...' : imageSrc}" />\n<meta property="og:image:width" content="${width}" />\n<meta property="og:image:height" content="${height}" />`;

  const fullMetaTagsCode = `<!-- SEO & OpenGraph Meta Etiketleri -->\n<title>${metaTitle}</title>\n<meta name="description" content="${metaDescription}" />\n<meta name="author" content="${metaAuthor}" />\n<meta property="og:title" content="${metaTitle}" />\n<meta property="og:description" content="${metaDescription}" />\n<meta property="og:image" content="${imageSrc}" />\n<meta property="og:image:width" content="${width}" />\n<meta property="og:image:height" content="${height}" />`;

  const getFullCode = () => {
    if (activeTab === 'imgTag') return fullImgTagCode;
    if (activeTab === 'figureTag') return fullFigureTagCode;
    return fullMetaTagsCode;
  };

  const handleCopy = () => {
    const code = getFullCode();
    navigator.clipboard.writeText(code);
    setCopiedTab(activeTab);
    setTimeout(() => {
      setCopiedTab(null);
    }, 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#1e293b',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Code size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
                HTML Tag & Meta Kodu Üreteci
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Fotoğrafınızı web sitelerine doğrudan yerleştirmek için hazır HTML kodları
              </p>
            </div>
          </div>

          <button 
            className="btn-icon" 
            onClick={onClose}
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Format Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.5)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Görsel Kaynağı Türü:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${!useBase64 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                onClick={() => setUseBase64(false)}
              >
                Görsel URL Linki
              </button>
              <button 
                className={`btn ${useBase64 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                onClick={() => setUseBase64(true)}
              >
                Base64 Gömülü Veri
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <button 
              className={`btn ${activeTab === 'imgTag' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('imgTag')}
            >
              <Code size={14} />
              <span>Standard &lt;img&gt; Etiketi</span>
            </button>

            <button 
              className={`btn ${activeTab === 'figureTag' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('figureTag')}
            >
              <FileText size={14} />
              <span>Semantik &lt;figure&gt; Etiketi</span>
            </button>

            <button 
              className={`btn ${activeTab === 'metaTags' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setActiveTab('metaTags')}
            >
              <Share2 size={14} />
              <span>SEO Meta Etiketleri</span>
            </button>
          </div>

          {/* Code View Area */}
          <div style={{ position: 'relative' }}>
            <pre 
              style={{
                background: '#090d16',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.8rem',
                color: '#38bdf8',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '220px'
              }}
            >
              {activeTab === 'imgTag' && imgTagCode}
              {activeTab === 'figureTag' && figureTagCode}
              {activeTab === 'metaTags' && metaTagsCode}
            </pre>

            <button 
              className="btn btn-primary"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                fontSize: '0.75rem'
              }}
              onClick={handleCopy}
            >
              {copiedTab === activeTab ? (
                <>
                  <Check size={14} />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Kodu Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* Info Banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <Info size={18} style={{ color: '#06b6d4', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', lineHeight: 1.5 }}>
              Bu HTML kodları görselinizin <strong>Genişlik ({width}px)</strong>, <strong>Yükleklik ({height}px)</strong>, <strong>Alt Metni</strong> ve <strong>SEO Başlığını</strong> otomatik içerir. Web sitenizin HTML koduna doğrudan yapıştırabilirsiniz.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
