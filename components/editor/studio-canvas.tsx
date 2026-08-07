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

export const StudioCanvas = forwardRef<StudioCanvasRef, Props>(({ state, dispatch, imageUrl }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverCursor, setHoverCursor] = useState<'move' | 'nwse-resize'>('move');

  // Keep stateRef fresh for non-passive event listeners
  const stateRef = useRef(state);
  stateRef.current = state;

  // Ultra-responsive Native Mouse Wheel Event Listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentState = stateRef.current;
      let targetId = currentState.selectedLayerId;

      if (!targetId && currentState.layers.length > 0) {
        targetId = currentState.layers[0].id;
        dispatch({ type: 'SELECT_LAYER', id: targetId });
      }

      if (!targetId) return;

      const selectedLayer = currentState.layers.find((l) => l.id === targetId);
      if (!selectedLayer || selectedLayer.type !== 'text') return;

      const step = e.deltaY < 0 ? 4 : -4;
      const currentSize = selectedLayer.fontSize || 36;
      const newSize = Math.max(12, Math.min(120, currentSize + step));

      dispatch({ type: 'UPDATE_LAYER', id: targetId, patch: { fontSize: newSize } });
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [dispatch]);

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
        const boxPadding = 18;
        const boxW = Math.max(textWidth + boxPadding * 2, 140);
        const boxH = textHeight + boxPadding * 2;
        const boxX = posX - boxW / 2;
        const boxY = posY - boxH / 2;

        ctx.restore();
        ctx.save();

        // Dashed Selection Box Outline
        ctx.strokeStyle = '#a3e635';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Edge Drag Handles (Corners + Edge Mids)
        ctx.fillStyle = '#a3e635';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;

        const handleSize = 16;
        const handles = [
          { x: boxX, y: boxY }, // Top-Left
          { x: boxX + boxW, y: boxY }, // Top-Right
          { x: boxX, y: boxY + boxH }, // Bottom-Left
          { x: boxX + boxW, y: boxY + boxH }, // Bottom-Right
          { x: boxX + boxW / 2, y: boxY }, // Top-Mid
          { x: boxX + boxW / 2, y: boxY + boxH }, // Bottom-Mid
          { x: boxX, y: boxY + boxH / 2 }, // Left-Mid
          { x: boxX + boxW, y: boxY + boxH / 2 }, // Right-Mid
        ];

        handles.forEach((h) => {
          ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        });
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

  // Helper: Detect if point (cX, cY) is near any edge, corner handle, or outer boundary of selected layer
  const isNearEdgeOrHandle = (cX: number, cY: number, layer: StudioLayer, ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const posX = (layer.x / 100) * width;
    const posY = (layer.y / 100) * width;

    const fontSize = (layer.fontSize || 36) * 1.5;
    const textToDraw = layer.uppercase ? layer.text?.toUpperCase() || '' : layer.text || '';
    ctx.font = `${layer.fontWeight || '900'} ${fontSize}px '${layer.fontFamily || 'Impact'}', sans-serif`;
    const metrics = ctx.measureText(textToDraw);

    const boxPadding = 18;
    const boxW = Math.max(metrics.width + boxPadding * 2, 140);
    const boxH = fontSize + boxPadding * 2;
    const boxX = posX - boxW / 2;
    const boxY = posY - boxH / 2;

    // Check distance to bounding box center vs edges
    const margin = 24;
    const isInsideOuterBox = cX >= boxX - margin && cX <= boxX + boxW + margin && cY >= boxY - margin && cY <= boxY + boxH + margin;
    const innerW = boxW * 0.35;
    const innerH = boxH * 0.35;
    const isInsideCenterCore = cX >= posX - innerW && cX <= posX + innerW && cY >= posY - innerH && cY <= posY + innerH;

    // Edge/Handle resizing triggers if touching edges/outer zone of text box
    return isInsideOuterBox && !isInsideCenterCore;
  };

  // Mouse Hover Cursor Update
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || isDragging) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const cX = ((e.clientX - rect.left) / rect.width) * 800;
    const cY = ((e.clientY - rect.top) / rect.height) * 800;

    const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (selectedLayer && selectedLayer.type === 'text' && isNearEdgeOrHandle(cX, cY, selectedLayer, ctx)) {
      setHoverCursor('nwse-resize');
    } else {
      setHoverCursor('move');
    }
  };

  // Click / Touch Start Handler (Supports Moving from Center & Resizing from Any Edge/Corner)
  const startDrag = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const cX = ((clientX - rect.left) / rect.width) * 800;
    const cY = ((clientY - rect.top) / rect.height) * 800;
    const clickXPercent = (cX / 800) * 100;
    const clickYPercent = (cY / 800) * 100;

    // Check if clicking near current selected layer's edges or handles
    const currentSelected = state.layers.find((l) => l.id === state.selectedLayerId);
    let dragMode: 'move' | 'resize' = 'move';

    if (currentSelected && currentSelected.type === 'text' && isNearEdgeOrHandle(cX, cY, currentSelected, ctx)) {
      dragMode = 'resize';
    }

    // If moving, find targeted layer
    let targetLayer = currentSelected;
    if (dragMode === 'move') {
      const clicked = state.layers.find((l) => {
        const dx = Math.abs(l.x - clickXPercent);
        const dy = Math.abs(l.y - clickYPercent);
        return dx < 25 && dy < 15;
      });
      if (clicked) targetLayer = clicked;
      if (!targetLayer && state.layers.length > 0) targetLayer = state.layers[0];
    }

    if (!targetLayer) return;

    // Select the layer
    dispatch({ type: 'SELECT_LAYER', id: targetLayer.id });
    setIsDragging(true);

    const activeId = targetLayer.id;
    const startPosX = (targetLayer.x / 100) * 800;
    const startPosY = (targetLayer.y / 100) * 800;
    const startDist = Math.hypot(cX - startPosX, cY - startPosY);
    const startFontSize = targetLayer.fontSize || 36;

    const onMove = (moveClientX: number, moveClientY: number) => {
      const moveCX = ((moveClientX - rect.left) / rect.width) * 800;
      const moveCY = ((moveClientY - rect.top) / rect.height) * 800;

      if (dragMode === 'resize') {
        // Edge / Corner drag resize calculation (drag away = bigger, drag in = smaller)
        const currentDist = Math.hypot(moveCX - startPosX, moveCY - startPosY);
        const ratio = currentDist / Math.max(15, startDist);
        const newFontSize = Math.max(12, Math.min(120, Math.round(startFontSize * ratio)));
        dispatch({
          type: 'UPDATE_LAYER',
          id: activeId,
          patch: { fontSize: newFontSize },
        });
      } else {
        // Center drag position move calculation
        const xPercent = Math.max(5, Math.min(95, (moveCX / 800) * 100));
        const yPercent = Math.max(5, Math.min(95, (moveCY / 800) * 100));
        dispatch({
          type: 'UPDATE_LAYER',
          id: activeId,
          patch: { x: Math.round(xPercent), y: Math.round(yPercent) },
        });
      }
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

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleContainerMouseMove}
      style={{ cursor: isDragging ? 'grabbing' : hoverCursor }}
      className="relative w-full aspect-square bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl select-none transition-all hover:border-zinc-700"
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain" />

      {/* Bottom Hint Tag */}
      <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 pointer-events-none z-30 flex items-center gap-1.5">
        <span>🎯 Drag center to move</span>
        <span>•</span>
        <span className="text-lime-400 font-bold">📐 Drag any edge/corner to resize</span>
      </div>
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';
