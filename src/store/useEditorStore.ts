import { createStore } from "./store";

export interface BaseLayer {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  content: string;
  fontSize: string;
  color: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "darken"
  | "hard-light"
  | "difference"
  | "exclusion";

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  blendMode: BlendMode;
  maskType?: "none" | "circle" | "heart";
}

export type Layer = TextLayer | ImageLayer;

interface EditorState {
  cardId: string | null;
  cardBackgroundColor: string;
  cardBackgroundImage: string | null;
  layers: Layer[];
  selectedLayerId: string | null;
  isPreview: boolean;

  // actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updatedLayer: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;
  togglePreview: () => void;
  clearSelection: () => void;
}

// Zustand store
export const useEditorStore = createStore<EditorState>((set) => ({
  // Initial state
  cardId: null,
  cardBackgroundColor: "#fffff",
  cardBackgroundImage: null,
  layers: [],
  selectedLayerId: null,
  isPreview: false,

  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  updateLayer: (id, updatedLayer) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...updatedLayer } as Layer) : layer,
      ),
    })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedLayerId:
        state.selectedLayerId === id ? null : state.selectedLayerId,
    })),
  setSelectedLayer: (id) => set(() => ({ selectedLayerId: id })),
  togglePreview: () =>
    set((state) => ({
      isPreview: !state.isPreview,
      selectedLayerId: null,
    })),
  clearSelection: () => set({ selectedLayerId: null }),
}));
