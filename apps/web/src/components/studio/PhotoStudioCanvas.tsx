// @ts-nocheck
"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import * as fabricModule from 'fabric';
import { Upload } from 'lucide-react';

const fabric: any = (fabricModule as any).fabric || (fabricModule as any).default || fabricModule;

// Register custom top-right corner Delete Control for Fabric Canvas Objects (Text, Shapes, etc.)
if (typeof window !== 'undefined' && fabric && fabric.Control) {
  fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -12,
    offsetX: 12,
    cursorStyle: 'pointer',
    mouseUpHandler: function(eventData, transform) {
      const target = transform.target;
      const canvas = target.canvas;
      if (target && canvas) {
        if (target.id === 'crop_selection_box') return false;
        canvas.remove(target);
        canvas.discardActiveObject();
        canvas.renderAll();
      }
      return true;
    },
    render: function(ctx, left, top, styleOverride, fabricObject) {
      if (fabricObject.id === 'crop_selection_box') return;
      const size = 22;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      
      // Circle background (Red #ef4444)
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Trash Can Icon (Crisp Vector Lines)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Lid line
      ctx.beginPath();
      ctx.moveTo(-5, -3.5);
      ctx.lineTo(5, -3.5);
      ctx.stroke();

      // Handle bar
      ctx.beginPath();
      ctx.moveTo(-2, -3.5);
      ctx.lineTo(-2, -5.5);
      ctx.lineTo(2, -5.5);
      ctx.lineTo(2, -3.5);
      ctx.stroke();

      // Body box
      ctx.beginPath();
      ctx.moveTo(-4, -3.5);
      ctx.lineTo(-3.2, 5);
      ctx.lineTo(3.2, 5);
      ctx.lineTo(4, -3.5);
      ctx.stroke();

      // Inner vertical stripes
      ctx.beginPath();
      ctx.moveTo(-1.2, -1);
      ctx.lineTo(-1.2, 3);
      ctx.moveTo(1.2, -1);
      ctx.lineTo(1.2, 3);
      ctx.stroke();

      ctx.restore();
    },
    cornerSize: 22
  });
}

export default function PhotoStudioCanvas({
  activeTool,
  setActiveTool,
  brushColor,
  brushWidth,
  eraserWidth,
  textColor,
  fontSize,
  fontFamily,
  onLayersChange,
  onSelectedObjectChange,
  onHistoryChange,
  setCanvasRef,
  hasImage,
  setHasImage,
  activeFilter,
  setActiveFilter,
  brightness,
  contrast,
  saturation,
  blurVal,
  zoomLevel,
  setZoomLevel,
  cropRatio,
  customRatioW,
  customRatioH,
  cropTrigger,
  cancelCropTrigger
}) {
  const canvasElRef = useRef(null);
  const containerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const bgImageRef = useRef(null);
  const cropRectRef = useRef(null);
  const bgImageElementRef = useRef(null);

  const activeToolRef = useRef(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const isUndoRedoActionRef = useRef(false);

  // Sync Layers List
  const syncLayers = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects().filter((o) => o.id !== 'crop_selection_box');
    const layerItems = objects.map((obj) => {
      let icon = '📦';
      let name = obj.name || 'Nesne';

      if (obj.type === 'i-text' || obj.type === 'text') {
        icon = '🔤';
        name = obj.text ? `"${obj.text.substring(0, 14)}..."` : 'Metin';
      } else if (obj.type === 'rect') {
        icon = '⏹️';
        name = 'Dikdörtgen';
      } else if (obj.type === 'circle') {
        icon = '🔴';
        name = 'Daire';
      } else if (obj.type === 'triangle') {
        icon = '🔺';
        name = 'Üçgen';
      } else if (obj.type === 'line') {
        icon = '➖';
        name = 'Çizgi';
      } else if (obj.type === 'path') {
        icon = obj.globalCompositeOperation === 'destination-out' ? '🧹' : '✏️';
        name = obj.globalCompositeOperation === 'destination-out' ? 'Silme Katmanı' : 'Çizim';
      } else if (obj.type === 'image') {
        icon = '🖼️';
        name = obj.name || 'Görsel Katmanı';
      }

      if (!obj.id) {
        obj.id = 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      }

      return {
        id: obj.id,
        type: obj.type,
        name: name,
        icon: icon,
        locked: !obj.selectable,
        visible: obj.visible !== false
      };
    });

    onLayersChange(layerItems);
  }, [onLayersChange]);

  // Save State to History Stack
  const saveHistory = useCallback(() => {
    if (isUndoRedoActionRef.current || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const json = JSON.stringify(canvas.toJSON(['id', 'name', 'locked']));
    
    if (onHistoryChange) {
      onHistoryChange(json);
    }
  }, [onHistoryChange]);

  // Initialize Fabric Canvas on Mount
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: 800,
      height: 550,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    });

    // Override _renderObjects to isolate eraser destination-out blending to objects layer only
    canvas._renderObjects = function(ctx, objects) {
      if (!objects || objects.length === 0) return;

      const filteredObjects = objects.filter((o) => o.id !== 'crop_selection_box');
      const cropObj = objects.find((o) => o.id === 'crop_selection_box');

      const hasEraser = filteredObjects.some(
        (obj) => obj.globalCompositeOperation === 'destination-out' || obj.isEraser
      );

      if (!hasEraser) {
        for (let i = 0; i < filteredObjects.length; i++) {
          if (filteredObjects[i].visible !== false) {
            filteredObjects[i].render(ctx);
          }
        }
        if (cropObj && cropObj.visible !== false) {
          cropObj.render(ctx);
        }
        return;
      }

      if (!this._offscreenCanvas) {
        this._offscreenCanvas = fabric.util.createCanvasElement();
      }
      const offCanvas = this._offscreenCanvas;
      if (offCanvas.width !== canvas.width || offCanvas.height !== canvas.height) {
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
      }

      const offCtx = offCanvas.getContext('2d');
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

      for (let i = 0; i < filteredObjects.length; i++) {
        const obj = filteredObjects[i];
        if (obj.visible !== false) {
          const originalGco = offCtx.globalCompositeOperation;
          if (obj.globalCompositeOperation) {
            offCtx.globalCompositeOperation = obj.globalCompositeOperation;
          }
          obj.render(offCtx);
          offCtx.globalCompositeOperation = originalGco;
        }
      }

      ctx.drawImage(offCanvas, 0, 0);

      if (cropObj && cropObj.visible !== false) {
        cropObj.render(ctx);
      }
    };

    fabricCanvasRef.current = canvas;
    if (setCanvasRef) setCanvasRef(canvas);

    // Canvas Events
    const handleObjectModified = () => {
      syncLayers();
      saveHistory();
    };

    const handleSelectionCreated = (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        if (selected.id === 'crop_selection_box') return;

        if (activeToolRef.current === 'eraser') {
          canvas.remove(selected);
          canvas.discardActiveObject();
          canvas.renderAll();
          syncLayers();
          saveHistory();
          return;
        }

        const isTxt = selected.type === 'i-text' || selected.type === 'text';

        onSelectedObjectChange({
          id: selected.id,
          type: selected.type,
          isText: isTxt,
          fill: selected.fill,
          textBackgroundColor: selected.textBackgroundColor || '',
          fontFamily: selected.fontFamily,
          fontSize: selected.fontSize,
          fontWeight: selected.fontWeight || 'normal',
          fontStyle: selected.fontStyle || 'normal',
          underline: !!selected.underline,
          linethrough: !!selected.linethrough,
          textAlign: selected.textAlign || 'left',
          shadowColor: selected.shadow?.color || '#000000',
          shadowBlur: selected.shadow?.blur || 0,
          shadowOffsetX: selected.shadow?.offsetX || 0,
          shadowOffsetY: selected.shadow?.offsetY || 0,
          opacity: selected.opacity
        });
      } else {
        onSelectedObjectChange(null);
      }
    };

    const handleSelectionCleared = () => {
      onSelectedObjectChange(null);
    };

    const handlePathCreated = (e) => {
      const path = e.path;
      if (path) {
        path.id = 'layer_' + Date.now();
        
        if (activeToolRef.current === 'eraser') {
          path.globalCompositeOperation = 'destination-out';
          path.stroke = 'rgba(0,0,0,1)';
          path.isEraser = true;
          path.name = 'Silme İşlemi';
        } else {
          path.globalCompositeOperation = 'source-over';
          path.name = 'Çizim';
        }
      }
      canvas.renderAll();
      syncLayers();
      saveHistory();
    };

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', syncLayers);
    canvas.on('object:removed', syncLayers);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionCreated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('path:created', handlePathCreated);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Handle Crop Tool Activation & Crop Overlay Box
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'crop') {
      canvas.isDrawingMode = false;
      
      if (!cropRectRef.current) {
        const cropW = Math.round(canvas.width * 0.75);
        const cropH = Math.round(canvas.height * 0.75);
        const cropL = Math.round((canvas.width - cropW) / 2);
        const cropT = Math.round((canvas.height - cropH) / 2);

        const cropBox = new fabric.Rect({
          left: cropL,
          top: cropT,
          width: cropW,
          height: cropH,
          fill: 'rgba(131, 111, 255, 0.15)',
          stroke: '#836fff',
          strokeWidth: 2,
          strokeDashArray: [6, 6],
          cornerColor: '#15f5ba',
          cornerStyle: 'circle',
          cornerSize: 12,
          transparentCorners: false,
          hasRotatingPoint: false,
          id: 'crop_selection_box',
          name: 'Kırpma Alanı'
        });

        cropRectRef.current = cropBox;
        canvas.add(cropBox);
        canvas.setActiveObject(cropBox);
        canvas.renderAll();
      }
    } else {
      if (cropRectRef.current) {
        canvas.remove(cropRectRef.current);
        cropRectRef.current = null;
        canvas.renderAll();
      }
    }
  }, [activeTool]);

  // Handle Crop Aspect Ratio Presets & Custom Ratios
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const cropBox = cropRectRef.current;
    if (!canvas || !cropBox || !cropRatio) return;

    if (cropRatio === '1:1') {
      const side = Math.min(canvas.width * 0.7, canvas.height * 0.7);
      cropBox.set({ width: side, height: side, scaleX: 1, scaleY: 1 });
    } else if (cropRatio === '4:5') {
      const h = Math.min(canvas.height * 0.8, 480);
      const w = h * (4 / 5);
      cropBox.set({ width: w, height: h, scaleX: 1, scaleY: 1 });
    } else if (cropRatio === '16:9') {
      const w = Math.min(canvas.width * 0.8, 700);
      const h = w * (9 / 16);
      cropBox.set({ width: w, height: h, scaleX: 1, scaleY: 1 });
    } else if (cropRatio === '9:16') {
      const h = Math.min(canvas.height * 0.8, 480);
      const w = h * (9 / 16);
      cropBox.set({ width: w, height: h, scaleX: 1, scaleY: 1 });
    } else if (cropRatio === '4:3') {
      const w = Math.min(canvas.width * 0.8, 640);
      const h = w * (3 / 4);
      cropBox.set({ width: w, height: h, scaleX: 1, scaleY: 1 });
    } else if (cropRatio === '21:9') {
      const w = Math.min(canvas.width * 0.85, 750);
      const h = w * (9 / 21);
      cropBox.set({ width: w, height: h, scaleX: 1, scaleY: 1 });
    } else if (cropRatio === 'custom') {
      if (customRatioW > 0 && customRatioH > 0) {
        const targetRatio = customRatioW / customRatioH;
        let w = canvas.width * 0.75;
        let h = w / targetRatio;
        if (h > canvas.height * 0.85) {
          h = canvas.height * 0.85;
          w = h * targetRatio;
        }
        cropBox.set({ width: w, height: h, scaleX: 1, scaleY: 1 });
      }
    } else if (cropRatio === 'free') {
      cropBox.set({ scaleX: 1, scaleY: 1 });
    }

    cropBox.setCoords();
    canvas.renderAll();
  }, [cropRatio, customRatioW, customRatioH]);

  // Execute Crop Trigger
  useEffect(() => {
    if (!cropTrigger) return;

    const canvas = fabricCanvasRef.current;
    const cropBox = cropRectRef.current;
    const bgImgEl = bgImageElementRef.current;

    if (!canvas || !cropBox || !bgImgEl) return;

    const cropLeft = Math.max(0, Math.round(cropBox.left));
    const cropTop = Math.max(0, Math.round(cropBox.top));
    const cropWidth = Math.min(canvas.width - cropLeft, Math.round(cropBox.getScaledWidth()));
    const cropHeight = Math.min(canvas.height - cropTop, Math.round(cropBox.getScaledHeight()));

    if (cropWidth <= 10 || cropHeight <= 10) return;

    const bgImg = bgImageRef.current;
    const scaleX = bgImg?.scaleX || 1;
    const scaleY = bgImg?.scaleY || 1;

    const srcX = Math.round(cropLeft / scaleX);
    const srcY = Math.round(cropTop / scaleY);
    const srcW = Math.round(cropWidth / scaleX);
    const srcH = Math.round(cropHeight / scaleY);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = srcW;
    cropCanvas.height = srcH;
    const cropCtx = cropCanvas.getContext('2d');

    cropCtx.drawImage(
      bgImgEl,
      srcX, srcY, srcW, srcH,
      0, 0, srcW, srcH
    );

    const croppedDataURL = cropCanvas.toDataURL('image/png');

    canvas.remove(cropBox);
    cropRectRef.current = null;

    loadImageToCanvas(croppedDataURL);
    setActiveTool('select');
  }, [cropTrigger]);

  // Execute Cancel Crop Trigger
  useEffect(() => {
    if (!cancelCropTrigger) return;
    const canvas = fabricCanvasRef.current;
    if (cropRectRef.current && canvas) {
      canvas.remove(cropRectRef.current);
      cropRectRef.current = null;
      canvas.renderAll();
    }
    setActiveTool('select');
  }, [cancelCropTrigger]);

  // Update Freehand Brush Mode vs Eraser Mode
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'brush') {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = brushColor;
      brush.width = parseInt(brushWidth, 10);
      brush.globalCompositeOperation = 'source-over';
      canvas.freeDrawingBrush = brush;
    } else if (activeTool === 'eraser') {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = 'rgba(255, 255, 255, 0.4)';
      brush.width = parseInt(eraserWidth, 10);
      brush.globalCompositeOperation = 'destination-out';
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, brushColor, brushWidth, eraserWidth]);

  // Bulletproof Load Image Function using Permanent HTMLCanvasElement Buffer
  const loadImageToCanvas = useCallback((imageSource) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';

    imgElement.onload = () => {
      // Create a permanent HTMLCanvasElement buffer to prevent Chromium GPU bitmap cache eviction blackouts
      const sourceCanvas = document.createElement('canvas');
      const w = imgElement.naturalWidth || imgElement.width || 800;
      const h = imgElement.naturalHeight || imgElement.height || 600;
      sourceCanvas.width = w;
      sourceCanvas.height = h;

      const sCtx = sourceCanvas.getContext('2d');
      sCtx.drawImage(imgElement, 0, 0, w, h);

      bgImageElementRef.current = sourceCanvas;

      const maxW = Math.min(window.innerWidth - 440, 920);
      const maxH = Math.min(window.innerHeight - 200, 620);

      let scale = 1;
      if (w > maxW || h > maxH) {
        scale = Math.min(maxW / w, maxH / h);
      }

      const canvasWidth = Math.round(w * scale);
      const canvasHeight = Math.round(h * scale);

      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);

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
        bgImageRef.current = fabricImg;
        setHasImage(true);
        setActiveFilter('normal');
        canvas.renderAll();
        syncLayers();
        saveHistory();
      });
    };

    imgElement.onerror = (err) => {
      console.error('Fotoğraf yüklenemedi:', err);
    };

    imgElement.src = imageSource;
  }, [setHasImage, setActiveFilter, syncLayers, saveHistory]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        loadImageToCanvas(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Native 2D Canvas GPU Filter String Generator
  const buildFilterCss = (filterName, bVal, cVal, sVal, blurV) => {
    const parts = [];

    if (filterName === 'grayscale') {
      parts.push('grayscale(100%)');
    } else if (filterName === 'sepia') {
      parts.push('sepia(100%)');
    } else if (filterName === 'invert') {
      parts.push('invert(100%)');
    } else if (filterName === 'blur') {
      parts.push('blur(4px)');
    } else if (filterName === 'vintage') {
      parts.push('sepia(60%) contrast(115%) brightness(105%)');
    } else if (filterName === 'warm' || filterName === 'golden') {
      parts.push('sepia(30%) brightness(105%) saturate(120%)');
    } else if (filterName === 'cool' || filterName === 'ice') {
      parts.push('hue-rotate(180deg) saturate(90%) contrast(105%)');
    } else if (filterName === 'neon') {
      parts.push('saturate(200%) contrast(130%) brightness(110%)');
    } else if (filterName === 'cyberpunk') {
      parts.push('hue-rotate(280deg) saturate(180%) contrast(125%)');
    } else if (filterName === 'pixelate') {
      parts.push('contrast(120%) saturate(110%)');
    } else if (filterName === 'dramatic') {
      parts.push('contrast(140%) saturate(130%)');
    } else if (filterName === 'cinematic') {
      parts.push('contrast(125%) brightness(95%) saturate(85%)');
    }

    if (typeof bVal === 'number' && bVal !== 0) {
      const bPercent = Math.round((1 + bVal) * 100);
      parts.push(`brightness(${Math.max(0, bPercent)}%)`);
    }

    if (typeof cVal === 'number' && cVal !== 0) {
      const cPercent = Math.round((1 + cVal) * 100);
      parts.push(`contrast(${Math.max(0, cPercent)}%)`);
    }

    if (typeof sVal === 'number' && sVal !== 0) {
      const sPercent = Math.round((1 + sVal) * 100);
      parts.push(`saturate(${Math.max(0, sPercent)}%)`);
    }

    if (typeof blurV === 'number' && blurV > 0) {
      const px = Math.round(blurV * 15);
      parts.push(`blur(${px}px)`);
    }

    return parts.length > 0 ? parts.join(' ') : 'none';
  };

  // Special FX Effects & Fine-tune Image Filter Pipeline (Native GPU Canvas 2D)
  const filterCanvasRef = useRef(null);
  const pendingFilterRafRef = useRef(null);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const sourceCanvas = bgImageElementRef.current;
    if (!canvas || !sourceCanvas) return;

    if (pendingFilterRafRef.current) {
      cancelAnimationFrame(pendingFilterRafRef.current);
    }

    pendingFilterRafRef.current = requestAnimationFrame(() => {
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;

      if (!filterCanvasRef.current) {
        filterCanvasRef.current = document.createElement('canvas');
      }
      const outCanvas = filterCanvasRef.current;
      if (outCanvas.width !== w || outCanvas.height !== h) {
        outCanvas.width = w;
        outCanvas.height = h;
      }

      const ctx = outCanvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      const filterStr = buildFilterCss(activeFilter, brightness, contrast, saturation, blurVal);
      ctx.filter = filterStr;
      ctx.drawImage(sourceCanvas, 0, 0, w, h);
      ctx.filter = 'none';

      const scaleX = canvas.width / w;
      const scaleY = canvas.height / h;

      const fabricImg = new fabric.Image(outCanvas, {
        scaleX: scaleX,
        scaleY: scaleY,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false
      });

      canvas.setBackgroundImage(fabricImg, () => {
        bgImageRef.current = fabricImg;
        canvas.renderAll();
      });
    });

    return () => {
      if (pendingFilterRafRef.current) {
        cancelAnimationFrame(pendingFilterRafRef.current);
      }
    };
  }, [activeFilter, brightness, contrast, saturation, blurVal, hasImage]);

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      {/* Upload Dropzone Placeholder Overlay when no image loaded */}
      {!hasImage && (
        <div className="upload-dropzone" style={{ position: 'absolute', zIndex: 10 }}>
          <label 
            htmlFor="main-photo-upload-input" 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
          >
            <div className="upload-icon-circle">
              <Upload size={36} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Fotoğrafınızı Buraya Yükleyin</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tıklayın veya fotoğrafı seçin (PNG, JPG, WebP)
              </p>
            </div>
            <input 
              id="main-photo-upload-input" 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>

          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', width: '100%' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              veya Örnek Fotoğraflarla Hemen Deneyin:
            </p>
            <div className="preset-images" style={{ justifyContent: 'center' }}>
              <img 
                src="/samples/sample1.jpg" 
                alt="Manzara Fotoğrafı" 
                className="preset-thumb" 
                onClick={() => loadImageToCanvas('/samples/sample1.jpg')} 
                title="Dağ Manzarası"
              />
              <img 
                src="/samples/sample2.jpg" 
                alt="Sokak Fotoğrafı" 
                className="preset-thumb" 
                onClick={() => loadImageToCanvas('/samples/sample2.jpg')} 
                title="Siber Neon Şehir"
              />
            </div>
          </div>
        </div>
      )}

      {/* Canvas Element - Always Mounted */}
      <div 
        className="canvas-card" 
        style={{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'center center', 
          transition: 'transform 0.15s ease',
          visibility: hasImage ? 'visible' : 'hidden'
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
