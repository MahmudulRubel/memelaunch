'use client';

import React, { useReducer, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { initialStudioState, memeStudioReducer } from '@/lib/meme-studio-state';
import { StudioCanvas, StudioCanvasRef } from './studio-canvas';
import { StudioSidebar } from './studio-sidebar';
import { StudioToolbar } from './studio-toolbar';

export interface MemeStudioRef {
  getCanvasBlob: () => Promise<Blob | null>;
}

interface Props {
  imageUrl: string | null;
  productLogoUrl?: string | null;
  textAbove?: string;
  textBelow?: string;
  onTextAboveChange?: (val: string) => void;
  onTextBelowChange?: (val: string) => void;
}

export const MemeStudio = forwardRef<MemeStudioRef, Props>(
  ({ imageUrl, productLogoUrl, textAbove = '', textBelow = '', onTextAboveChange, onTextBelowChange }, ref) => {
    const [state, dispatch] = useReducer(memeStudioReducer, initialStudioState);
    const canvasRef = useRef<StudioCanvasRef>(null);

    // Sync external textAbove / textBelow into layer state
    useEffect(() => {
      if (textAbove) {
        dispatch({ type: 'UPDATE_LAYER', id: 'top-text', patch: { text: textAbove } });
      }
    }, [textAbove]);

    useEffect(() => {
      if (textBelow) {
        dispatch({ type: 'UPDATE_LAYER', id: 'bottom-text', patch: { text: textBelow } });
      }
    }, [textBelow]);

    // Keyboard Shortcuts (Ctrl+Z / Ctrl+Y)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            dispatch({ type: 'REDO' });
          } else {
            dispatch({ type: 'UNDO' });
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useImperativeHandle(ref, () => ({
      getCanvasBlob: async () => {
        if (canvasRef.current) {
          return canvasRef.current.getCanvasBlob();
        }
        return null;
      },
    }));

    return (
      <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 md:p-6 shadow-2xl space-y-4">
        {/* Studio Top Toolbar */}
        <StudioToolbar state={state} dispatch={dispatch} />

        {/* Studio Body: Canvas Left (6 Cols), Control Sidebar Right (6 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Canvas Viewport (6 Cols) */}
          <div className="lg:col-span-6 w-full space-y-3">
            <StudioCanvas
              ref={canvasRef}
              state={state}
              dispatch={dispatch}
              imageUrl={imageUrl}
              productLogoUrl={productLogoUrl}
            />
            <p className="text-[11px] font-mono text-zinc-500 text-center">
              💡 Tip: Click and drag text directly on the canvas to reposition. Use Ctrl+Z to Undo.
            </p>
          </div>

          {/* Right Studio Sidebar Controls (6 Cols) */}
          <div className="lg:col-span-6 w-full">
            <StudioSidebar state={state} dispatch={dispatch} />
          </div>
        </div>
      </div>
    );
  }
);

MemeStudio.displayName = 'MemeStudio';
