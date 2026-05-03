import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";
import Card3DContainer from "./Card3DContainer";
import LayerComponent from "./LayerComponent";
import LayerToolbar from "./LayerToolbar";
import SaveButton from "./SaveButton";

export default function EditorCanvas() {
  const layers = useEditorStore((state) => state.layers);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const removeLayer = useEditorStore((state) => state.removeLayer);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const isPreview = useEditorStore((state) => state.isPreview);
  const togglePreview = useEditorStore((state) => state.togglePreview);

  const handleBackgroundClick = () => {
    if (!isPreview) {
      clearSelection();
    }
  };

  const Layers = (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {layers.map((layer) => (
        <LayerComponent key={layer.id} layerId={layer.id} />
      ))}
    </div>
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPreview) {
        return;
      }

      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedLayerId) {
          removeLayer(selectedLayerId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLayerId, isPreview, removeLayer]);

  return (
    <div
      className="flex flex-col gap-y-4 items-center justify-center w-full h-screen bg-gray-100"
      onMouseDown={handleBackgroundClick}
    >
      {/* 컨트롤 패널 */}
      <div className="flex space-x-4">
        <LayerToolbar />
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePreview();
          }}
          className="px-4 py-2 mt-4 font-semibold text-white bg-indigo-600 rounded shadow hover:bg-indigo-700"
        >
          {isPreview ? "편집모드로 돌아가기" : "미리보기"}
        </button>
      </div>
      {/* 3D 캔버스 영역 */}
      {isPreview ? (
        <Card3DContainer width={400} height={600}>
          {Layers}
        </Card3DContainer>
      ) : (
        <div className="w-100 h-150">{Layers}</div>
      )}
      <SaveButton />
    </div>
  );
}
