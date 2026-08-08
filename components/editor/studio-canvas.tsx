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
  const [hoverCursor, setHoverCursor] = useState<'move' | 'nwse-resize' | 'default'>('move');

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

  // Helper: Calculate exact bounding box and handle positions for a text layer
  const getLayerGeometry = (layer: StudioLayer, ctx: CanvasRenderingContext2D) => {
    const width = 800;
    const height = 800;
    const posX = (layer.x / 100) * width;
    const posY = (layer.y / 100) * height;

    const textToDraw = layer.uppercase ? layer.text?.toUpperCase() || '' : layer.text || '';
    const fontSize = (layer.fontSize || 36) * 1.5;
    const fontName = layer.fontFamily || 'Impact';
    ctx.font = `${layer.fontWeight || '900'} ${fontSize}px '${fontName}', sans-serif`;
    const metrics = ctx.measureText(textToDraw);

    const boxPadding = 18;
    const boxW = Math.max(metrics.width + boxPadding * 2, 140);
    const boxH = fontSize + boxPadding * 2;
    const boxX = posX - boxW / 2;
    const boxY = posY - boxH / 2;

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

    return { posX, posY, boxX, boxY, boxW, boxH, handles };
  };

  // Check if point (cX, cY) is near any resize handle of the specified layer
  const isNearHandle = (cX: number, cY: number, layer: StudioLayer, ctx: CanvasRenderingContext2D, hitRadius = 28) => {
    const { handles } = getLayerGeometry(layer, ctx);
    return handles.some((h) => Math.hypot(cX - h.x, cY - h.y) <= hitRadius);
  };

  // Check if point (cX, cY) is inside or near a layer's bounding box
  const isInsideLayerBox = (cX: number, cY: number, layer: StudioLayer, ctx: CanvasRenderingContext2D, padding = 20) => {
    const { boxX, boxY, boxW, boxH } = getLayerGeometry(layer, ctx);
    return (
      cX >= boxX - padding &&
      cX <= boxX + boxW + padding &&
      cY >= boxY - padding &&
      cY <= boxY + boxH + padding
    );
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
    if (selectedLayer && selectedLayer.type === 'text') {
      if (isNearHandle(cX, cY, selectedLayer, ctx, 20)) {
        setHoverCursor('nwse-resize');
        return;
      }
      if (isInsideLayerBox(cX, cY, selectedLayer, ctx, 10)) {
        setHoverCursor('move');
        return;
      }
    }
    setHoverCursor('default');
  };

  // Unified Click / Touch Start Handler for Smooth Desktop & Mobile Dragging
  const startDrag = (clientX: number, clientY: number, isTouch = false) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const cX = ((clientX - rect.left) / rect.width) * 800;
    const cY = ((clientY - rect.top) / rect.height) * 800;

    const currentSelected = state.layers.find((l) => l.id === state.selectedLayerId);
    let dragMode: 'move' | 'resize' = 'move';
    let targetLayer: StudioLayer | undefined = undefined;

    // Hit radius for corner/edge handles (slightly larger on touch screens for finger accuracy)
    const handleHitRadius = isTouch ? 28 : 20;

    // Check if user clicked/touched directly on a handle of the selected layer
    if (currentSelected && currentSelected.type === 'text' && isNearHandle(cX, cY, currentSelected, ctx, handleHitRadius)) {
      dragMode = 'resize';
      targetLayer = currentSelected;
    } else {
      // Check if hitting the currently selected layer box first
      if (currentSelected && currentSelected.type === 'text' && isInsideLayerBox(cX, cY, currentSelected, ctx, 20)) {
        targetLayer = currentSelected;
      } else {
        // Search through all text layers to see if any box was hit
        targetLayer = state.layers.find((l) => l.type === 'text' && isInsideLayerBox(cX, cY, l, ctx, 20));
      }

      // Fallback: pick the closest text layer if user touched nearby on canvas
      if (!targetLayer) {
        let minDistance = Infinity;
        state.layers.forEach((l) => {
          if (l.type !== 'text') return;
          const lX = (l.x / 100) * 800;
          const lY = (l.y / 100) * 800;
          const dist = Math.hypot(cX - lX, cY - lY);
          if (dist < minDistance) {
            minDistance = dist;
            targetLayer = l;
          }
        });
      }
    }

    if (!targetLayer) return;

    // Select target layer
    dispatch({ type: 'SELECT_LAYER', id: targetLayer.id });
    setIsDragging(true);

    const activeId = targetLayer.id;
    const startPosX = (targetLayer.x / 100) * 800;
    const startPosY = (targetLayer.y / 100) * 800;
    const offsetX = cX - startPosX;
    const offsetY = cY - startPosY;
    const startDist = Math.hypot(cX - startPosX, cY - startPosY);
    const startFontSize = targetLayer.fontSize || 36;

    const onMove = (moveClientX: number, moveClientY: number) => {
      const currentRect = container.getBoundingClientRect();
      const moveCX = ((moveClientX - currentRect.left) / currentRect.width) * 800;
      const moveCY = ((moveClientY - currentRect.top) / currentRect.height) * 800;

      if (dragMode === 'resize') {
        // Edge / Corner drag resize calculation
        const currentDist = Math.hypot(moveCX - startPosX, moveCY - startPosY);
        const ratio = currentDist / Math.max(15, startDist);
        const newFontSize = Math.max(12, Math.min(120, Math.round(startFontSize * ratio)));
        dispatch({
          type: 'UPDATE_LAYER',
          id: activeId,
          patch: { fontSize: newFontSize },
        });
      } else {
        // Smooth center drag move with touch offset compensation
        const targetPosX = moveCX - offsetX;
        const targetPosY = moveCY - offsetY;
        const xPercent = Math.max(5, Math.min(95, (targetPosX / 800) * 100));
        const yPercent = Math.max(5, Math.min(95, (targetPosY / 800) * 100));
        dispatch({
          type: 'UPDATE_LAYER',
          id: activeId,
          patch: { x: Math.round(xPercent), y: Math.round(yPercent) },
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault(); // Prevents mobile browser viewport scrolling during caption drag
      }
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
      window.removeEventListener('touchcancel', stopDrag);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchcancel', stopDrag);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startDrag(e.clientX, e.clientY, false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleContainerMouseMove}
      style={{ cursor: isDragging ? 'grabbing' : hoverCursor, touchAction: 'none' }}
      className="relative w-full aspect-square bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl select-none transition-all hover:border-zinc-700 touch-none"
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
});

StudioCanvas.displayName = 'StudioCanvas';
