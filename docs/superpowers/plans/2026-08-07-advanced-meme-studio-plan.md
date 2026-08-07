# Advanced Meme Studio & Photo Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Advanced Meme Studio & Professional Photo Editor with custom Google Fonts, text stroke/shadow/glow/pill styling, aspect ratio cropping, image filters, sticker overlays, and Undo/Redo history tracking.

**Architecture:** A modular editor system built inside `components/editor/` with a centralized `useMemeStudio` reducer hook for state history, HTML5 Canvas rendering for high-resolution exports, and seamless integration into `app/(main)/launch/page.tsx`.

**Tech Stack:** Next.js 15 (React 19), HTML5 Canvas API, Lucide Icons, InsForge Storage SDK, Tailwind CSS.

## Global Constraints

- Preserve all existing form submit parameters in `launch/page.tsx`.
- All canvas export images must be rendered at crisp 2x resolution (min 800px width).
- Zero typescript errors during `npm run build`.

---

### Task 1: Layer State Model & Reducer Engine (`lib/meme-studio-state.ts`)

**Files:**
- Create: `lib/meme-studio-state.ts`

**Interfaces:**
- Consumes: None
- Produces: `StudioLayer`, `CanvasSettings`, `StudioState`, `memeStudioReducer`, `initialStudioState`

- [ ] **Step 1: Write state definitions & reducer function**

Create `lib/meme-studio-state.ts`:
```typescript
export interface StudioLayer {
  id: string;
  type: 'text' | 'image' | 'badge' | 'sticker';
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  uppercase?: boolean;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  bgBoxColor?: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface CanvasSettings {
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  filter: {
    brightness: number;
    contrast: number;
    saturation: number;
    preset: 'none' | 'deep-fried' | 'vhs' | 'vintage' | 'grayscale';
  };
}

export interface StudioState {
  layers: StudioLayer[];
  selectedLayerId: string | null;
  canvasSettings: CanvasSettings;
  activeTab: 'text' | 'fonts' | 'effects' | 'filters' | 'badges' | 'presets';
  past: Omit<StudioState, 'past' | 'future'>[];
  future: Omit<StudioState, 'past' | 'future'>[];
}

export type StudioAction =
  | { type: 'SET_ACTIVE_TAB'; tab: StudioState['activeTab'] }
  | { type: 'SELECT_LAYER'; id: string | null }
  | { type: 'UPDATE_LAYER'; id: string; patch: Partial<StudioLayer> }
  | { type: 'ADD_LAYER'; layer: StudioLayer }
  | { type: 'DELETE_LAYER'; id: string }
  | { type: 'SET_CANVAS_FILTER'; filter: Partial<CanvasSettings['filter']> }
  | { type: 'SET_ASPECT_RATIO'; aspectRatio: CanvasSettings['aspectRatio'] }
  | { type: 'APPLY_PRESET'; preset: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export const initialStudioState: StudioState = {
  layers: [
    {
      id: 'top-text',
      type: 'text',
      text: 'TOP MEME TEXT',
      fontFamily: 'Impact',
      fontSize: 36,
      fontWeight: '900',
      uppercase: true,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 0,
      bgBoxColor: 'transparent',
      x: 50,
      y: 15,
      rotation: 0,
      scale: 1,
    },
    {
      id: 'bottom-text',
      type: 'text',
      text: 'BOTTOM MEME TEXT',
      fontFamily: 'Impact',
      fontSize: 36,
      fontWeight: '900',
      uppercase: true,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 0,
      bgBoxColor: 'transparent',
      x: 50,
      y: 85,
      rotation: 0,
      scale: 1,
    },
  ],
  selectedLayerId: 'top-text',
  canvasSettings: {
    aspectRatio: '1:1',
    filter: { brightness: 100, contrast: 100, saturation: 100, preset: 'none' },
  },
  activeTab: 'text',
  past: [],
  future: [],
};

export function memeStudioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };

    case 'SELECT_LAYER':
      return { ...state, selectedLayerId: action.id };

    case 'UPDATE_LAYER': {
      const snapshot = {
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        canvasSettings: state.canvasSettings,
        activeTab: state.activeTab,
      };
      return {
        ...state,
        past: [...state.past, snapshot],
        future: [],
        layers: state.layers.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      };
    }

    case 'ADD_LAYER': {
      const snapshot = {
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        canvasSettings: state.canvasSettings,
        activeTab: state.activeTab,
      };
      return {
        ...state,
        past: [...state.past, snapshot],
        future: [],
        layers: [...state.layers, action.layer],
        selectedLayerId: action.layer.id,
      };
    }

    case 'DELETE_LAYER': {
      const snapshot = {
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        canvasSettings: state.canvasSettings,
        activeTab: state.activeTab,
      };
      return {
        ...state,
        past: [...state.past, snapshot],
        future: [],
        layers: state.layers.filter((l) => l.id !== action.id),
        selectedLayerId: state.selectedLayerId === action.id ? null : state.selectedLayerId,
      };
    }

    case 'SET_CANVAS_FILTER':
      return {
        ...state,
        canvasSettings: {
          ...state.canvasSettings,
          filter: { ...state.canvasSettings.filter, ...action.filter },
        },
      };

    case 'SET_ASPECT_RATIO':
      return {
        ...state,
        canvasSettings: { ...state.canvasSettings, aspectRatio: action.aspectRatio },
      };

    case 'APPLY_PRESET': {
      const snapshot = {
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        canvasSettings: state.canvasSettings,
        activeTab: state.activeTab,
      };
      let updatedLayers = [...state.layers];
      if (action.preset === 'classic') {
        updatedLayers = updatedLayers.map((l) =>
          l.type === 'text'
            ? { ...l, fontFamily: 'Impact', uppercase: true, color: '#ffffff', strokeColor: '#000000', strokeWidth: 4, shadowBlur: 0, bgBoxColor: 'transparent' }
            : l
        );
      } else if (action.preset === 'neon') {
        updatedLayers = updatedLayers.map((l) =>
          l.type === 'text'
            ? { ...l, fontFamily: 'Anton', uppercase: true, color: '#a3e635', strokeColor: '#000000', strokeWidth: 2, shadowColor: '#22d3ee', shadowBlur: 12, bgBoxColor: 'transparent' }
            : l
        );
      } else if (action.preset === 'news') {
        updatedLayers = updatedLayers.map((l) =>
          l.type === 'text'
            ? { ...l, fontFamily: 'Montserrat', uppercase: true, color: '#ffffff', strokeColor: 'transparent', strokeWidth: 0, shadowBlur: 0, bgBoxColor: '#dc2626' }
            : l
        );
      }
      return { ...state, past: [...state.past, snapshot], future: [], layers: updatedLayers };
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const currentSnapshot = {
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        canvasSettings: state.canvasSettings,
        activeTab: state.activeTab,
      };
      return {
        ...state,
        ...previous,
        past: newPast,
        future: [currentSnapshot, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const currentSnapshot = {
        layers: state.layers,
        selectedLayerId: state.selectedLayerId,
        canvasSettings: state.canvasSettings,
        activeTab: state.activeTab,
      };
      return {
        ...state,
        ...next,
        past: [...state.past, currentSnapshot],
        future: newFuture,
      };
    }

    default:
      return state;
  }
}
```

- [ ] **Step 2: Commit state engine**
```bash
git add lib/meme-studio-state.ts
git commit -m "feat: add meme studio layer state model and history reducer engine"
```

---

### Task 2: Sidebar Tabs Components (`components/editor/tabs/*`)

**Files:**
- Create: `components/editor/tabs/typography-tab.tsx`
- Create: `components/editor/tabs/text-effects-tab.tsx`
- Create: `components/editor/tabs/image-filters-tab.tsx`
- Create: `components/editor/tabs/stickers-badges-tab.tsx`
- Create: `components/editor/tabs/presets-tab.tsx`

**Interfaces:**
- Consumes: `StudioLayer`, `CanvasSettings`, `StudioState`, `StudioAction` from `lib/meme-studio-state`
- Produces: React components for each editor sidebar panel.

- [ ] **Step 1: Create Typography Tab**
Create `components/editor/tabs/typography-tab.tsx` with Google Font selector, font size slider, uppercase toggle, font weight controls.

- [ ] **Step 2: Create Text Effects Tab**
Create `components/editor/tabs/text-effects-tab.tsx` with stroke color & width picker, neon glow/shadow controls, background pill highlight box picker.

- [ ] **Step 3: Create Image Filters Tab**
Create `components/editor/tabs/image-filters-tab.tsx` with Brightness, Contrast, Saturation sliders & preset buttons (Deep Fried, VHS, Vintage, B&W).

- [ ] **Step 4: Create Stickers & Badges Tab**
Create `components/editor/tabs/stickers-badges-tab.tsx` with Product Logo Badge toggle, badge size/position controls, and watermark stamps.

- [ ] **Step 5: Create Presets Tab**
Create `components/editor/tabs/presets-tab.tsx` with 1-click aesthetic presets (Classic Meme, Neon Glow, Breaking News, Retro Vaporwave).

- [ ] **Step 6: Commit Sidebar Tabs**
```bash
git add components/editor/tabs/
git commit -m "feat: create meme studio sidebar tab controls"
```

---

### Task 3: Interactive Canvas Engine (`components/editor/studio-canvas.tsx`)

**Files:**
- Create: `components/editor/studio-canvas.tsx`

**Interfaces:**
- Consumes: `StudioState`, `StudioAction`, base template image URL, product logo URL
- Produces: Canvas component with drag positioning, text layer rendering, font loading, filters, and high-res export function `getCanvasBlob()`.

- [ ] **Step 1: Create `studio-canvas.tsx`**
Implement canvas context rendering loop:
1. Load Google Fonts dynamically into document head.
2. Render base template image with CSS/canvas filters.
3. Draw text layers with stroke, shadow, fill color, and background pill box.
4. Draw product logo badge overlay layer.
5. Provide interactive drag-to-position for selected layers.

- [ ] **Step 2: Commit Canvas Engine**
```bash
git add components/editor/studio-canvas.tsx
git commit -m "feat: add interactive HTML5 canvas engine for meme studio"
```

---

### Task 4: Main Studio Orchestrator & Toolbar (`components/editor/meme-studio.tsx`)

**Files:**
- Create: `components/editor/meme-studio.tsx`
- Create: `components/editor/studio-sidebar.tsx`
- Create: `components/editor/studio-toolbar.tsx`

**Interfaces:**
- Consumes: `studio-canvas.tsx`, sidebar tabs, `lib/meme-studio-state.ts`
- Produces: Full Studio component with sidebar tab switcher, top Undo/Redo/Reset bar, and canvas area.

- [ ] **Step 1: Create Studio Toolbar & Sidebar Orchestrator**
Assemble `meme-studio.tsx` connecting the sidebar, tab controls, top toolbar (Undo/Redo), and main canvas viewport.

- [ ] **Step 2: Commit Studio Container**
```bash
git add components/editor/meme-studio.tsx components/editor/studio-sidebar.tsx components/editor/studio-toolbar.tsx
git commit -m "feat: assemble main MemeStudio wrapper component and toolbar"
```

---

### Task 5: Launch Page Integration (`app/(main)/launch/page.tsx`)

**Files:**
- Modify: `app/(main)/launch/page.tsx`

**Interfaces:**
- Consumes: `MemeStudio` component
- Produces: Integrated launch form with advanced studio editor substituting the basic preview box.

- [ ] **Step 1: Integrate `MemeStudio` into `LaunchForm`**
Replace basic caption input preview with `MemeStudio` component, passing template image and logo preview. On submit, pull canvas blob from `MemeStudio` and upload to InsForge storage.

- [ ] **Step 2: Verify Build & Execution**
Run `npm run build` to confirm zero TypeScript compilation errors.

- [ ] **Step 3: Commit Launch Page Integration**
```bash
git add app/\(main\)/launch/page.tsx
git commit -m "feat: integrate Advanced Meme Studio into launch page form"
```
