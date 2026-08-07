'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StudioState, StudioAction } from '@/lib/meme-studio-state';

export interface StudioCanvasRef {
  getCanvasBlob: () => Promise<Blob | null>;
}

interface Props {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
  imageUrl: string | null;
  productLogoUrl?: string | null;
}

const LOADED_FONTS = new Set<string>();

function loadGoogleFont(fontName: string) {
  if (!fontName || LOADED_FONTS.has(fontName)) return;
  const formattedFont = fontName.replace(/ /g, '+');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@400;700;900&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  LOADED_FONTS.add(fontName);
}

export const StudioCanvas = forwardRef<StudioCanvasRef, Props>(({ state, dispatch, imageUrl }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load Google Fonts dynamically when layer fonts change
  useEffect(() => {
    state.layers.forEach((layer) => {
      if (layer.fontFamily) {
        loadGoogleFont(layer.fontFamily);
      }
    });
  }, [state.layers]);

  // Load Template Background Image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => setBgImage(img);
  }, [imageUrl]);

  // Expose High-Res Export Function
  useImperativeHandle(ref, () => ({
    getCanvasBlob: async () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Render clean canvas without bounding box guides for final export
      renderCanvas(canvas, state, bgImage, false);

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          // Re-render with guides after export
          renderCanvas(canvas, state, bgImage, true);
          resolve(blob);
        }, 'image/png', 0.95);
      });
    },
  }));

  // Master Render Canvas Function
  const renderCanvas = (
    canvas: HTMLCanvasElement,
    currentState: StudioState,
    bgImg: HTMLImageElement | null,
    drawGuides: boolean
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Apply Filter Pipeline
    const { brightness, contrast, saturation } = currentState.canvasSettings.filter;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw Background Template Image or Dark Grid Placeholder
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2;
      for (let i = 0; i < width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Select a template or upload an image to begin', width / 2, height / 2);
    }

    // Reset filter for text layers
    ctx.filter = 'none';

    // Draw Text Layers
    currentState.layers.forEach((layer) => {
      if (layer.type !== 'text' || !layer.text) return;

      ctx.save();
      const posX = (layer.x / 100) * width;
      const posY = (layer.y / 100) * height;

      const textToDraw = layer.uppercase ? layer.text.toUpperCase() : layer.text;
      const fontSize = (layer.fontSize || 36) * 1.5;
      const fontName = layer.fontFamily || 'Impact';

      ctx.font = `${layer.fontWeight || '900'} ${fontSize}px '${fontName}', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(textToDraw);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      // Background Pill Highlight Box
      if (layer.bgBoxColor && layer.bgBoxColor !== 'transparent') {
        const bgWidth = textWidth + 30;
        const bgHeight = textHeight + 20;
        ctx.fillStyle = layer.bgBoxColor;
        ctx.fillRect(posX - bgWidth / 2, posY - bgHeight / 2, bgWidth, bgHeight);
      }

      // Drop Shadow / Glow
      if (layer.shadowBlur && layer.shadowBlur > 0) {
        ctx.shadowColor = layer.shadowColor || '#000000';
        ctx.shadowBlur = layer.shadowBlur * 1.5;
      }

      // Outline Stroke
      if (layer.strokeWidth && layer.strokeWidth > 0) {
        ctx.strokeStyle = layer.strokeColor || '#000000';
        ctx.lineWidth = layer.strokeWidth * 1.5;
        ctx.strokeText(textToDraw, posX, posY);
      }

      // Fill Text
      ctx.fillStyle = layer.color || '#ffffff';
      ctx.fillText(textToDraw, posX, posY);

      // Bounding Box Guides for Selected Layer
      if (drawGuides && currentState.selectedLayerId === layer.id) {
        const boxPadding = 16;
        const boxW = Math.max(textWidth + boxPadding * 2, 120);
        const boxH = textHeight + boxPadding * 2;
        const boxX = posX - boxW / 2;
        const boxY = posY - boxH / 2;

        ctx.restore();
        ctx.save();

        // Dashed Selection Box
        ctx.strokeStyle = '#a3e635';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner Resize Indicators
        ctx.fillStyle = '#a3e635';
        const handleSize = 10;
        ctx.fillRect(boxX - handleSize / 2, boxY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(boxX + boxW - handleSize / 2, boxY - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(boxX - handleSize / 2, boxY + boxH - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(boxX + boxW - handleSize / 2, boxY + boxH - handleSize / 2, handleSize, handleSize);
      }

      ctx.restore();
    });
  };

  // Render Loop Trigger
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderCanvas(canvas, state, bgImage, true);
    }
  }, [state, bgImage]);

  // Click & Drag Handler
  const startDrag = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickXPercent = ((clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((clientY - rect.top) / rect.height) * 100;

    // Find clicked layer or pick closest layer
    let targetLayer = state.layers.find((l) => {
      const dx = Math.abs(l.x - clickXPercent);
      const dy = Math.abs(l.y - clickYPercent);
      return dx < 25 && dy < 15;
    });

    if (!targetLayer && state.layers.length > 0) {
      targetLayer = state.layers[0];
    }

    if (!targetLayer) return;

    // Select the layer
    dispatch({ type: 'SELECT_LAYER', id: targetLayer.id });
    setIsDragging(true);

    const activeId = targetLayer.id;

    const onMove = (moveX: number, moveY: number) => {
      const xPercent = Math.max(5, Math.min(95, ((moveX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(5, Math.min(95, ((moveY - rect.top) / rect.height) * 100));
      dispatch({
        type: 'UPDATE_LAYER',
        id: activeId,
        patch: { x: Math.round(xPercent), y: Math.round(yPercent) },
      });
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const stopDrag = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDrag);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stopDrag);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Mouse wheel font resizing on canvas
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!state.selectedLayerId) return;
    const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!selectedLayer || selectedLayer.type !== 'text') return;

    e.preventDefault();
    const delta = e.deltaY < 0 ? 2 : -2;
    const newSize = Math.max(16, Math.min(96, (selectedLayer.fontSize || 36) + delta));
    dispatch({ type: 'UPDATE_LAYER', id: selectedLayer.id, patch: { fontSize: newSize } });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
      className={`relative w-full aspect-square bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl select-none transition-all ${
        isDragging ? 'cursor-grabbing border-lime-400/50' : 'cursor-grab hover:border-zinc-700'
      }`}
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 pointer-events-none">
        🎯 Drag text to position | Scroll wheel to resize
      </div>
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';
