# Advanced Meme Studio & Professional Photo Editor Design

**Date:** 2026-08-07  
**Status:** Approved  
**Target Location:** `components/editor/` and `app/(main)/launch/page.tsx`

---

## 1. Overview & Goals

The goal of this feature is to upgrade the basic text/image form in `memelaunch` into a **Full Professional Meme Studio & Photo Editor**. Creators will be able to customize meme fonts, text outlines, glows, filters, aspect ratios, stickers, and product badge overlays with 1-click presets and full Undo/Redo history.

---

## 2. Architecture & Component Structure

The meme studio will be built as a modular set of components inside `components/editor/`:

```
components/editor/
├── meme-studio.tsx             # Main editor orchestrator & modal wrapper
├── studio-canvas.tsx           # Interactive HTML5 Canvas rendering & interaction engine
├── studio-sidebar.tsx          # Left tab control panel (Text, Fonts, Effects, Filters, Badges, Presets)
├── studio-toolbar.tsx          # Quick action toolbar (Undo, Redo, Zoom, Aspect Ratio, Reset)
└── tabs/
    ├── typography-tab.tsx      # Google Fonts picker, text transform, letter spacing, size
    ├── text-effects-tab.tsx    # Outline stroke, drop shadow, neon glow, pill highlights
    ├── image-filters-tab.tsx   # Brightness, contrast, saturation, deep-fry, vintage filters
    ├── stickers-badges-tab.tsx # Product logo badge, watermark stamps, sticker overlays
    └── presets-tab.tsx         # 1-click meme style presets
```

---

## 3. State & Layer Management

State is managed via a dedicated `useMemeStudio` reducer hook with an immutable layer system and history stack:

```typescript
export interface Layer {
  id: string;
  type: 'text' | 'image' | 'badge' | 'sticker';
  text?: string;
  fontFamily?: string;     // Google Fonts (Impact, Anton, Bangers, Montserrat, Comic Neue, etc.)
  fontSize?: number;       // 12px - 120px
  fontWeight?: string;     // 400, 700, 900
  uppercase?: boolean;     // All-caps transform toggle
  color?: string;          // Primary fill color
  strokeColor?: string;    // Outline stroke color
  strokeWidth?: number;    // Stroke thickness (0px - 12px)
  shadowColor?: string;    // Drop shadow / Neon glow color
  shadowBlur?: number;     // Blur radius (0px - 20px)
  bgBoxColor?: string;     // Background pill color
  x: number;               // Position X (%)
  y: number;               // Position Y (%)
  rotation: number;        // Rotation angle (-180deg to 180deg)
  scale: number;           // Layer scale multiplier
}

export interface CanvasSettings {
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:5';
  filter: {
    brightness: number;  // 50-150%
    contrast: number;    // 50-150%
    saturation: number;  // 0-200%
    preset: 'none' | 'deep-fried' | 'vhs' | 'vintage' | 'grayscale';
  };
}

export interface StudioState {
  layers: Layer[];
  selectedLayerId: string | null;
  canvasSettings: CanvasSettings;
  activeTab: 'text' | 'fonts' | 'effects' | 'filters' | 'badges' | 'presets';
}
```

---

## 4. Typography & Font Loading

- **Curated Google Font Library**:
  - `Impact` (Classic Meme Standard)
  - `Anton` (Bold Display)
  - `Bangers` (Comic & Action)
  - `Montserrat` (Clean Modern)
  - `Comic Neue` (Playful Casual)
  - `Oswald` (Condensed Heavy)
  - `Permanent Marker` (Handwritten Street)
  - `Rubik Mono One` (Blocky Retro)
  - `Inter` (Minimalist UI)

- **On-Demand Font Injection**:
  Google Fonts CSS `<link>` tags dynamically injected into `document.head` when selecting a font, with fallback to standard sans-serif until loaded.

---

## 5. Text Effects & 1-Click Aesthetic Presets

### Text Effects
1. **Stroke/Outline**: Configurable outline color and width (Canvas `strokeText`).
2. **Neon Glow & Drop Shadow**: Canvas `shadowColor`, `shadowBlur`, `shadowOffsetX`, `shadowOffsetY`.
3. **Background Pill Highlight**: Semi-transparent or solid bounding pill behind text for high legibility over complex images.

### 1-Click Presets
- **Classic Meme**: White Impact font, 4px Black Stroke, All-Caps.
- **Cyberpunk Neon**: Lime (#a3e635) Anton font, Cyan Neon Glow.
- **Breaking News**: White Montserrat Bold on Red Background Pill.
- **Retro Vaporwave**: Magenta/Pink Bangers font with Cyan Drop Shadow.

---

## 6. Image Filters & Canvas Adjustments

- **CSS & HTML5 Canvas Filters**:
  - Brightness, Contrast, Saturation sliders.
  - **Deep Fried Meme**: Contrast 180%, Saturation 200%, Brightness 110%.
  - **VHS Retro**: Sepia 30%, Hue-rotate 15deg, Contrast 140%.
  - **Grayscale**: Saturation 0%.

- **Aspect Ratio Cropping**:
  - `1:1` Square (Instagram/Standard Meme)
  - `16:9` Landscape (X/Twitter Card)
  - `9:16` Vertical (Story/Reels)
  - `4:5` Portrait Feed

---

## 7. Badges, Watermarks & Logo Overlays

- Ability to add a **Product Logo Badge** as an editable layer on the canvas.
- Configurable badge position, size, opacity, and shape (Circle crop / Rounded rectangle / Plain).
- Optional "LAUNCHED ON MEMELAUNCH" subtle watermark stamp in corner (toggleable).

---

## 8. History & Draft Persistence

- **Undo / Redo Stack**: State snapshot saved on every finished drag or property change (`past`, `present`, `future`).
- **Keyboard Shortcuts**: `Ctrl+Z` / `Cmd+Z` for Undo, `Ctrl+Y` / `Cmd+Y` or `Ctrl+Shift+Z` for Redo.
- **LocalStorage Auto-Save**: Auto-saves active meme project draft so creators never lose work on accidental navigation.

---

## 9. Integration with Launch Page (`launch/page.tsx`)

- Embedded into `LaunchForm` in [`app/(main)/launch/page.tsx`](file:///d:/memelaunch/app/%28main%29/launch/page.tsx).
- Full backwards-compatibility: existing form fields (`textAbove`, `textBelow`, `textColor`) map smoothly into the new `MemeStudio` layer state.
- Output canvas produces high-quality PNG/WebP blob for submission to InsForge storage.

---

## 10. Verification Plan

### Automated Checks
- `npm run build` to verify Next.js TypeScript types and zero build warnings.

### Manual Verification
- Open launch page in browser dev server (`http://localhost:3000/launch`).
- Test font switching, outline stroke changes, neon glow, image filter sliders.
- Test 1-click preset applications.
- Test Undo/Redo button functionality and keyboard shortcuts (`Ctrl+Z`).
- Verify final compressed image upload flow during meme product launch.
