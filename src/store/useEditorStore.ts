import apiClient from "../lib/apiClient";
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
  layers: Layer[];
  selectedLayerId: string | null;
  sideColor: string;
  isPreview: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isError: boolean;
  cardSaveVersion: number;

  // actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updatedLayer: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  clearLayers: () => void;
  setSelectedLayer: (id: string | null) => void;
  setSideColor: (color: string) => void;
  togglePreview: () => void;
  clearSelection: () => void;
  saveCard: () => Promise<string | null>;
  loadCard: (uuid: string) => Promise<void>;
}

interface SaveCardResponse {
  uuid: string;
}

interface LoadCardResponse {
  layers: Layer[];
  sideColor: string;
}

// Zustand store
export const useEditorStore = createStore<EditorState>((set, get) => ({
  // Initial state
  cardId: null,
  layers: [],
  selectedLayerId: null,
  isPreview: false,
  isSaving: false,
  isLoading: false,
  isError: false,
  cardSaveVersion: 0,
  sideColor: "#d1d5db",

  setSideColor: (color: string) => set({ sideColor: color }),
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  updateLayer: (id, updatedLayer) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...updatedLayer } as Layer) : layer,
      ),
    })),
  removeLayer: (id) =>
    set((state) => {
      const targetLayer = state.layers.find((l) => l.id === id);
      if (targetLayer?.type === "image" && targetLayer.src.startsWith("blob")) {
        URL.revokeObjectURL(targetLayer.src);
      }

      return {
        layers: state.layers.filter((l) => l.id !== id),
        selectedLayerId:
          state.selectedLayerId === id ? null : state.selectedLayerId,
      };
    }),
  clearLayers: () => {
    const { layers } = get();
    for (const layer of layers) {
      if (layer.type === "image" && layer.src.startsWith("blob:")) {
        URL.revokeObjectURL(layer.src);
      }
    }
    set({
      layers: [],
      selectedLayerId: null,
      isPreview: false,
      sideColor: "#d1d5db",
      cardId: null,
    });
  },
  setSelectedLayer: (id) => set(() => ({ selectedLayerId: id })),
  togglePreview: () =>
    set((state) => ({
      isPreview: !state.isPreview,
      selectedLayerId: null,
    })),
  clearSelection: () => set({ selectedLayerId: null }),
  saveCard: async (): Promise<string | null> => {
    const { layers, sideColor } = get();
    if (layers.length === 0) {
      return null;
    }

    set({ isSaving: true });

    try {
      const formData = new FormData();
      const processedLayers = await Promise.all(
        layers.map(async (layer, fileIndex) => {
          if (layer.type !== "image" || !layer.src?.startsWith("blob:")) {
            return layer;
          }

          try {
            // blob url에서 실제 blob 데이터 추출
            const response = await fetch(layer.src);
            const imageBlob = await response.blob();

            // 임시 UUID
            const fileKey = `image_file_${fileIndex}`;

            formData.append("files", imageBlob, fileKey);

            return { ...layer, src: fileKey };
          } catch (error) {
            console.error(`이미지 업로드 실패 (Layer ID: ${layer.id}):`, error);
            return layer;
          }
        }),
      );

      formData.append(
        "data",
        JSON.stringify({ layers: processedLayers, sideColor }),
      );

      const response = await apiClient.post<SaveCardResponse>("/api/card", formData);

      set((state) => ({ cardSaveVersion: state.cardSaveVersion + 1 }));
      return response.data.uuid;
    } catch (error) {
      console.error("카드 저장 프로세스 중 오류 발생:", error);
      return null;
    } finally {
      set({ isSaving: false });
    }
  },
  loadCard: async (uuid: string) => {
    set({ isLoading: true, isError: false, layers: [] });

    try {
      const response = await apiClient.get<LoadCardResponse>(`/api/card/${uuid}`);
      const data = response.data;

      set({
        layers: data.layers,
        sideColor: data.sideColor,
        isPreview: true,
        selectedLayerId: null,
      });
    } catch (error) {
      console.error("데이터 패칭 실패:", error);
      set({ isError: true });
    } finally {
      set({
        isLoading: false,
      });
    }
  },
}));
