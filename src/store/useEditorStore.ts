import { supabase } from "../lib/supabase";
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
  isSaving: boolean;
  isLoading: boolean;
  isError: boolean;

  // actions
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updatedLayer: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;
  togglePreview: () => void;
  clearSelection: () => void;
  saveCard: () => Promise<string | null>;
  loadCard: (uuid: string) => Promise<void>;
}

// Zustand store
export const useEditorStore = createStore<EditorState>((set, get) => ({
  // Initial state
  cardId: null,
  cardBackgroundColor: "#fffff",
  cardBackgroundImage: null,
  layers: [],
  selectedLayerId: null,
  isPreview: false,
  isSaving: false,
  isLoading: false,
  isError: false,

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
  setSelectedLayer: (id) => set(() => ({ selectedLayerId: id })),
  togglePreview: () =>
    set((state) => ({
      isPreview: !state.isPreview,
      selectedLayerId: null,
    })),
  clearSelection: () => set({ selectedLayerId: null }),
  saveCard: async (): Promise<string | null> => {
    const { layers } = get();
    if (layers.length === 0) {
      return null;
    }

    set({ isSaving: true });

    try {
      const processedLayers = await Promise.all(
        layers.map(async (layer) => {
          if (layer.type !== "image" || !layer.src?.startsWith("blob:")) {
            return layer;
          }

          try {
            // blob url에서 실제 blob 데이터 추출
            const response = await fetch(layer.src);
            const imageBlob = await response.blob();

            // 임시 UUID
            const fileName = `${crypto.randomUUID()}.png`;
            const filePath = `images/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("cards")
              .upload(filePath, imageBlob, {
                contentType: "image/jpeg",
              });
            if (uploadError) {
              throw uploadError;
            }

            // 업로드된 파일의 공개 url 가져오기
            const {
              data: { publicUrl },
            } = supabase.storage.from("cards").getPublicUrl(filePath);

            URL.revokeObjectURL(layer.src);

            return { ...layer, src: publicUrl };
          } catch (error) {
            console.error(`이미지 업로드 실패 (Layer ID: ${layer.id}):`, error);
            return layer;
          }
        }),
      );

      // 공개 url이 적용된 데이터를 json으로 직렬화
      const payload = JSON.stringify({ layers: processedLayers });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
        },
      );

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const responseData = await response.json();

      return responseData.uuid;
    } catch (error) {
      console.error("카드 저장 프로세스 중 오류 발생:", error);
      return null;
    } finally {
      set({ isSaving: false });
    }
  },
  loadCard: async (uuid: string) => {
    set({ isLoading: true, isError: false });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/card/${uuid}`,
      );

      if (!response.ok) {
        throw new Error("카드 정보를 찾을 수 없습니다");
      }

      const data = await response.json();

      // 편집이 불가능하도록 설정
      set({
        layers: data.layers,
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
