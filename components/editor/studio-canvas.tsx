'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StudioState, StudioAction, StudioLayer } from '@/lib/meme-studio-state';

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

export const StudioCanvas = forwardRef<StudioCanvasRef, Props>(({ state, dispatch, imageUrl, productLogoUrl }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

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

  // Load Product Logo Badge Image
  useEffect(() => {
    if (!productLogoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = productLogoUrl;
    img.onload = () => setLogoImage(img);
  }, [productLogoUrl]);

  // Expose High-Res Export Function
  useImperativeHandle(ref, () => ({
    getCanvasBlob: async () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    },
  }));

  // Render Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed High-Res Canvas Size
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Apply Filter Pipeline
    const { brightness, contrast, saturation } = state.canvasSettings.filter;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw Background Template Image or Placeholder
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#71717a';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Select a template to begin', width / 2, height / 2);
    }

    // Reset filter for layers
    ctx.filter = 'none';

    // Draw Layers
    state.layers.forEach((layer) => {
      ctx.save();
      const posX = (layer.x / 100) * width;
      const posY = (layer.y / 100) * height;

      if (layer.type === 'text' && layer.text) {
        const textToDraw = layer.uppercase ? layer.text.toUpperCase() : layer.text;
        const fontSize = (layer.fontSize || 36) * 1.5; // Scale for 800px canvas
        const fontName = layer.fontFamily || 'Impact';

        ctx.font = `${layer.fontWeight || '900'} ${fontSize}px '${fontName}', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background Pill Highlight Box
        if (layer.bgBoxColor && layer.bgBoxColor !== 'transparent') {
          const metrics = ctx.measureText(textToDraw);
          const bgWidth = metrics.width + 30;
          const bgHeight = fontSize + 20;
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
      } else if (layer.type === 'badge' && logoImage) {
        const badgeSize = 100 * (layer.scale || 1);
        ctx.drawImage(logoImage, posX - badgeSize / 2, posY - badgeSize / 2, badgeSize, badgeSize);
      }

      ctx.restore();
    });
  }, [state, bgImage, logoImage]);

  // Drag-to-Position Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !state.selectedLayerId) return;

    const rect = container.getBoundingClientRect();
    const activeLayer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!activeLayer) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const xPercent = Math.max(5, Math.min(95, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(5, Math.min(95, ((moveEvent.clientY - rect.top) / rect.height) * 100));
      dispatch({ type: 'UPDATE_LAYER', id: activeLayer.id, patch: { x: Math.round(xPercent), y: Math.round(yPercent) } });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="relative w-full aspect-square bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing group"
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';
