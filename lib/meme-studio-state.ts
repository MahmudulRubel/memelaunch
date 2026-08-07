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
  activeTab: 'media' | 'captions' | 'text' | 'fonts' | 'effects' | 'filters' | 'badges' | 'presets';
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
