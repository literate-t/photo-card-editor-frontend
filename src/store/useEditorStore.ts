import { create } from "zustand";

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
  fontWeight: string;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  blendMode: string;
  maskType: "none" | "circle" | "heart";
}

export type Layer = TextLayer | ImageLayer;

interface EditorState {
  cardId: string | null;
  cardBackgroundColor: string;
  cardBackgroundImage: string | null;
  layers: Layer[];
  selectedLayerId: string | null;

  // actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updatedLayer: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;
}

// Zustand store
export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  cardId: null,
  cardBackgroundColor: "#fffff",
  cardBackgroundImage: null,
  layers: [],
  selectedLayerId: null,

  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  updateLayer: (id, updatedLayer) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, updatedLayer } : layer,
      ),
    })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedLayerId:
        state.selectedLayerId === id ? null : state.selectedLayerId,
    })),
  setSelectedLayer: (id) => set(() => ({ selectedLayerId: id })),
}));
