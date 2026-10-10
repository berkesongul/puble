// @ts-nocheck
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as fabricModule from 'fabric';
import Header from './Header';
import SidebarTools from './SidebarTools';
import SubToolsBar from './SubToolsBar';
import InspectorPanel from './InspectorPanel';
import PhotoStudioCanvas from './PhotoStudioCanvas';
import HtmlOutputModal from './HtmlOutputModal';
import VideoStudio from './VideoStudio';
import './studio.css';

const fabric: any = (fabricModule as any).fabric || (fabricModule as any).default || fabricModule;

interface PubleStudioProps {
  onSaveToLibrary?: (item?: {
    title: string;
    type: 'image' | 'video';
    format: string;
    date: string;
  }) => void;
  initialMode?: 'photo' | 'video';
}

export default function PubleStudio({ onSaveToLibrary, initialMode = 'photo' }: PubleStudioProps) {
  const [studioMode, setStudioMode] = useState<'photo' | 'video'>(initialMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [hasImage, setHasImage] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Brush settings
  const [brushColor, setBrushColor] = useState('#836fff');
  const [brushWidth, setBrushWidth] = useState(10);

  // Eraser settings
  const [eraserWidth, setEraserWidth] = useState(25);

  // Crop & Aspect Ratio settings
  const [cropRatio, setCropRatio] = useState('free');
  const [customRatioW, setCustomRatioW] = useState(16);
  const [customRatioH, setCustomRatioH] = useState(9);
  const [cropTrigger, setCropTrigger] = useState(0);
  const [cancelCropTrigger, setCancelCropTrigger] = useState(0);

  // Text settings
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');

  // Filter & Special Effects settings
  const [activeFilter, setActiveFilter] = useState('normal');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blurVal, setBlurVal] = useState(0);

  // Photo Metadata & HTML Tag Settings
  const [altText, setAltText] = useState('Puble Görsel İçeriği');
  const [metaTitle, setMetaTitle] = useState('Puble ile Düzenlenmiş İçerik');
  const [metaAuthor, setMetaAuthor] = useState('Puble Studio');
  const [metaDescription, setMetaDescription] = useState('Puble Studio ile üretilmiş yüksek kaliteli sosyal medya görseli.');
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);

  // Layers & Selection
  const [, setLayers] = useState<any[]>([]);
  const [selectedObjectProps, setSelectedObjectProps] = useState<any>(null);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  // Fabric Canvas Reference
  const fabricCanvasRef = useRef<any>(null);

  // History Tracking
  const historyStackRef = useRef<string[]>([]);
  const historyPointerRef = useRef(-1);

  // Hidden File Inputs
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Ensure canvas is visible when user activates drawing or adding objects
  const ensureCanvasActive = () => {
    if (!hasImage) {
      setHasImage(true);
    }
  };

  // Set Fabric Canvas Ref
  const setCanvasRef = useCallback((canvas: any) => {
    fabricCanvasRef.current = canvas;
  }, []);

  // History State Push
  const pushCanvasState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON(['id', 'name', 'locked']));
    const stack = historyStackRef.current.slice(0, historyPointerRef.current + 1);
    stack.push(json);
    historyStackRef.current = stack;
    historyPointerRef.current = stack.length - 1;

    setHistoryState({
      canUndo: historyPointerRef.current > 0,
      canRedo: historyPointerRef.current < historyStackRef.current.length - 1
    });
  }, []);

  const handleHistoryChangeFromCanvas = useCallback((json: string) => {
    const stack = historyStackRef.current.slice(0, historyPointerRef.current + 1);
    stack.push(json);
    historyStackRef.current = stack;
    historyPointerRef.current = stack.length - 1;

    setHistoryState({
      canUndo: historyPointerRef.current > 0,
      canRedo: historyPointerRef.current < historyStackRef.current.length - 1
    });
  }, []);

  // Undo Action
  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyPointerRef.current <= 0) return;

    historyPointerRef.current -= 1;
    const jsonState = historyStackRef.current[historyPointerRef.current];

    canvas.loadFromJSON(jsonState, () => {
      canvas.renderAll();
      setHistoryState({
        canUndo: historyPointerRef.current > 0,
        canRedo: historyPointerRef.current < historyStackRef.current.length - 1
      });
      showToast('Geri alındı ↩️');
    });
  };

  // Redo Action
  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyPointerRef.current >= historyStackRef.current.length - 1) return;

    historyPointerRef.current += 1;
    const jsonState = historyStackRef.current[historyPointerRef.current];

    canvas.loadFromJSON(jsonState, () => {
      canvas.renderAll();
      setHistoryState({
        canUndo: historyPointerRef.current > 0,
        canRedo: historyPointerRef.current < historyStackRef.current.length - 1
      });
      showToast('Yinelendi ↪️');
    });
  };

  // Add Text to Canvas
  const handleAddText = (defaultText = 'Puble Metni', extraProps: any = {}) => {
    ensureCanvasActive();
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText(defaultText, {
      left: Math.max(20, (canvas.width || 800) / 2 - 100),
      top: Math.max(20, (canvas.height || 550) / 2 - 20),
      fontFamily: fontFamily,
      fontSize: extraProps.fontSize || fontSize,
      fontWeight: extraProps.fontWeight || 'normal',
      fill: textColor,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.6)', blur: 8, offsetX: 2, offsetY: 2 }),
      id: 'text_' + Date.now(),
      name: 'Metin: ' + defaultText
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    pushCanvasState();
    setActiveTool('select');
    showToast('Metin katmanı eklendi 🔤');
  };

  // Add Shapes to Canvas
  const handleAddShape = (shapeType: string) => {
    ensureCanvasActive();
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shapeObj: any = null;
    const centerLeft = Math.max(20, (canvas.width || 800) / 2 - 50);
    const centerTop = Math.max(20, (canvas.height || 550) / 2 - 50);
    const id = 'shape_' + Date.now();

    if (shapeType === 'rect') {
      shapeObj = new fabric.Rect({
        left: centerLeft,
        top: centerTop,
        width: 120,
        height: 120,
        fill: '#836fff',
        rx: 12,
        ry: 12,
        id,
        name: 'Dikdörtgen'
      });
    } else if (shapeType === 'circle') {
      shapeObj = new fabric.Circle({
        left: centerLeft,
        top: centerTop,
        radius: 60,
        fill: '#15f5ba',
        id,
        name: 'Daire'
      });
    } else if (shapeType === 'triangle') {
      shapeObj = new fabric.Triangle({
        left: centerLeft,
        top: centerTop,
        width: 120,
        height: 100,
        fill: '#332fd0',
        id,
        name: 'Üçgen'
      });
    } else if (shapeType === 'line') {
      shapeObj = new fabric.Line([50, 50, 200, 50], {
        left: centerLeft,
        top: centerTop,
        stroke: '#ffffff',
        strokeWidth: 6,
        id,
        name: 'Çizgi'
      });
    }

    if (shapeObj) {
      canvas.add(shapeObj);
      canvas.setActiveObject(shapeObj);
      canvas.renderAll();
      pushCanvasState();
      setActiveTool('select');
      showToast('Şekil eklendi ⏹️');
    }
  };

  // Add Sticker / Emoji
  const handleAddSticker = (emoji: string) => {
    ensureCanvasActive();
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const sticker = new fabric.Text(emoji, {
      left: Math.max(20, (canvas.width || 800) / 2 - 24),
      top: Math.max(20, (canvas.height || 550) / 2 - 24),
      fontSize: 54,
      id: 'sticker_' + Date.now(),
      name: `Etiket: ${emoji}`
    });

    canvas.add(sticker);
    canvas.setActiveObject(sticker);
    canvas.renderAll();
    pushCanvasState();
    showToast(`Etiket eklendi ${emoji}`);
  };

  // Add Overlay Image (Watermark / Secondary Photo)
  const handleAddOverlayImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    ensureCanvasActive();
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imgElement = new window.Image();
        imgElement.onload = () => {
          const canvas = fabricCanvasRef.current;
          const fabricImg = new fabric.Image(imgElement);
          fabricImg.scaleToWidth(180);
          fabricImg.set({
            left: Math.max(20, (canvas.width || 800) / 2 - 90),
            top: Math.max(20, (canvas.height || 550) / 2 - 90),
            id: 'overlay_' + Date.now(),
            name: 'Görsel Katmanı'
          });

          canvas.add(fabricImg);
          canvas.setActiveObject(fabricImg);
          canvas.renderAll();
          pushCanvasState();
          showToast('İkincil görsel eklendi 🖼️');
        };
        imgElement.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLayer = (layerId?: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let targetObj: any = null;
    if (layerId) {
      targetObj = canvas.getObjects().find((o: any) => o.id === layerId);
    } else {
      targetObj = canvas.getActiveObject();
    }

    if (targetObj) {
      canvas.remove(targetObj);
      canvas.discardActiveObject();
      canvas.renderAll();
      pushCanvasState();
      showToast('Katman silindi 🗑️');
    }
  };

  const handleUpdateObject = (props: any) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      if (props.shadowProps) {
        active.set('shadow', new fabric.Shadow(props.shadowProps));
      } else {
        active.set(props);
      }
      canvas.renderAll();
      pushCanvasState();
    }
  };

  // Download Output Image
  const handleDownload = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    const link = document.createElement('a');
    link.download = `puble_studio_${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Görsel başarıyla indirildi! 🚀');
  };

  // Save directly to Puble Library
  const handleSaveToLibrary = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (onSaveToLibrary) {
      onSaveToLibrary({
        title: metaTitle || 'Puble Studio Tasarımı',
        type: 'image',
        format: 'PNG (1080×1350)',
        date: 'Şimdi'
      });
      showToast('Puble Kitaplığına kaydedildi! 📚');
    } else {
      handleDownload();
    }
  };

  // Clear Canvas
  const handleClear = () => {
    if (window.confirm('Tüm yapılan eklemeleri ve fotoğrafı temizlemek istediğinize emin misiniz?')) {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        canvas.clear();
        canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
      }
      setHasImage(false);
      setLayers([]);
      setSelectedObjectProps(null);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setBlurVal(0);
      showToast('Tuval temizlendi');
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteLayer();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle Upload Image from Top Header
  const handleHeaderPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        const imgElement = new window.Image();
        imgElement.crossOrigin = 'anonymous';

        imgElement.onload = () => {
          const sourceCanvas = document.createElement('canvas');
          const w = imgElement.naturalWidth || imgElement.width || 800;
          const h = imgElement.naturalHeight || imgElement.height || 600;
          sourceCanvas.width = w;
          sourceCanvas.height = h;

          const sCtx = sourceCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(imgElement, 0, 0, w, h);
          }

          const canvas = fabricCanvasRef.current;
          const maxW = Math.min(window.innerWidth - 440, 920);
          const maxH = Math.min(window.innerHeight - 200, 620);
          let scale = 1;
          if (w > maxW || h > maxH) {
            scale = Math.min(maxW / w, maxH / h);
          }

          canvas.setWidth(Math.round(w * scale));
          canvas.setHeight(Math.round(h * scale));

          const fabricImg = new fabric.Image(sourceCanvas, {
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false
          });

          canvas.clear();
          canvas.setBackgroundImage(fabricImg, () => {
            setHasImage(true);
            setActiveFilter('normal');
            setBrightness(0);
            setContrast(0);
            setSaturation(0);
            setBlurVal(0);
            canvas.renderAll();
            pushCanvasState();
            showToast('Fotoğraf yüklendi 📸');
          });
        };
        imgElement.src = evt.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`puble-studio-root ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {studioMode === 'video' ? (
        <VideoStudio onBackToPhotoStudio={() => setStudioMode('photo')} />
      ) : (
        <div className="app-container">
          {/* Hidden File Inputs */}
          <input 
            ref={uploadFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleHeaderPhotoUpload}
          />

          <input 
            ref={overlayFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAddOverlayImage}
          />

          {/* Top Header */}
          <Header 
            onUploadClick={() => uploadFileInputRef.current?.click()}
            onDownload={handleDownload}
            onSaveToLibrary={onSaveToLibrary ? handleSaveToLibrary : undefined}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyState.canUndo}
            canRedo={historyState.canRedo}
            onClear={handleClear}
            onZoomIn={() => setZoomLevel((prev) => Math.min(prev + 0.15, 2.5))}
            onZoomOut={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.4))}
            zoomLevel={zoomLevel}
            hasImage={hasImage}
            onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
            onOpenVideoStudio={() => setStudioMode('video')}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          />

          {/* Main Viewport */}
          <div className="studio-body">
            {/* Left Tools Bar */}
            <SidebarTools 
              activeTool={activeTool} 
              setActiveTool={(toolId) => {
                if (toolId === 'video') {
                  setStudioMode('video');
                  return;
                }
                setActiveTool(toolId);
                if (toolId === 'brush' || toolId === 'eraser' || toolId === 'crop' || toolId === 'adjustments' || toolId === 'metadata') {
                  ensureCanvasActive();
                }
              }} 
              hasImage={hasImage} 
            />

            {/* Sub-tools bar (Contextual Options) */}
            <SubToolsBar 
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              brushWidth={brushWidth}
              setBrushWidth={setBrushWidth}
              eraserWidth={eraserWidth}
              setEraserWidth={setEraserWidth}
              textColor={textColor}
              setTextColor={setTextColor}
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              onAddText={handleAddText}
              onAddShape={handleAddShape}
              onAddSticker={handleAddSticker}
              onApplyFilter={setActiveFilter}
              activeFilter={activeFilter}
              brightness={brightness}
              setBrightness={setBrightness}
              contrast={contrast}
              setContrast={setContrast}
              saturation={saturation}
              setSaturation={setSaturation}
              blurVal={blurVal}
              setBlurVal={setBlurVal}
              altText={altText}
              setAltText={setAltText}
              metaTitle={metaTitle}
              setMetaTitle={setMetaTitle}
              metaAuthor={metaAuthor}
              setMetaAuthor={setMetaAuthor}
              onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
              onAddOverlayClick={() => overlayFileInputRef.current?.click()}
              selectedObjectProps={selectedObjectProps}
              onUpdateObject={handleUpdateObject}
              onDeleteLayer={handleDeleteLayer}
              onApplyCrop={() => {
                setCropTrigger((prev) => prev + 1);
                showToast('Fotoğraf kırpıldı! ✂️');
              }}
              onCancelCrop={() => {
                setCancelCropTrigger((prev) => prev + 1);
              }}
              onSetCropRatio={setCropRatio}
              cropRatio={cropRatio}
              customRatioW={customRatioW}
              customRatioH={customRatioH}
              onCustomRatioChange={(w: number, h: number) => {
                setCustomRatioW(w);
                setCustomRatioH(h);
                setCropRatio('custom');
              }}
            />

            {/* Central Canvas Viewport */}
            <PhotoStudioCanvas 
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              brushColor={brushColor}
              brushWidth={brushWidth}
              eraserWidth={eraserWidth}
              textColor={textColor}
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontFamily={fontFamily}
              onLayersChange={setLayers}
              onSelectedObjectChange={setSelectedObjectProps}
              onHistoryChange={handleHistoryChangeFromCanvas}
              setCanvasRef={setCanvasRef}
              hasImage={hasImage}
              setHasImage={setHasImage}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              blurVal={blurVal}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              cropRatio={cropRatio}
              customRatioW={customRatioW}
              customRatioH={customRatioH}
              cropTrigger={cropTrigger}
              cancelCropTrigger={cancelCropTrigger}
            />

            {/* Right Panel - Dynamic Filters when Ayarlar active, Emojis at other times */}
            <InspectorPanel 
              activeTool={activeTool}
              onAddSticker={handleAddSticker}
              onAddShape={handleAddShape}
              activeFilter={activeFilter}
              onApplyFilter={setActiveFilter}
              hasImage={hasImage}
            />
          </div>

          {/* HTML Tag Output Generator Modal */}
          <HtmlOutputModal 
            isOpen={isHtmlModalOpen}
            onClose={() => setIsHtmlModalOpen(false)}
            canvasRef={fabricCanvasRef}
            altText={altText}
            metaTitle={metaTitle}
            metaAuthor={metaAuthor}
            metaDescription={metaDescription}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="toast-notice">
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
