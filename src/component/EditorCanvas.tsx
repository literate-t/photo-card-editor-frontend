import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";
import Card3DContainer from "./Card3DContainer";
import CardListPanel from "./CardListPanel";
import LayerComponent from "./LayerComponent";
import LayerToolbar from "./LayerToolbar";
import LogoutButton from "./LogoutButton";
import SaveButton from "./SaveButton";
import SideColorPalette from "./SideColorPalette";

export default function EditorCanvas() {
  const layers = useEditorStore((state) => state.layers);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const removeLayer = useEditorStore((state) => state.removeLayer);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const isPreview = useEditorStore((state) => state.isPreview);

  const handleBackgroundClick = () => {
    if (!isPreview) {
      clearSelection();
    }
  };

  const Layers = (
    <div className="relative w-full h-full rounded-2xl bg-gray-100 overflow-hidden object-cover">
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
    <div className="relative flex h-screen w-full bg-[#2a2b2d]">
      {/* 우상단(카드 리스트 패널 왼쪽 옆) 로그아웃 버튼 */}
      <div className="absolute top-3 right-64 z-40">
        <LogoutButton />
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center"
        onMouseDown={handleBackgroundClick}
      >
        {/* 컨트롤 패널 */}
        <LayerToolbar />
        {/* 3D 캔버스 영역 */}
        <div className="mt-2">
          {isPreview ? (
            <Card3DContainer width={400} height={600}>
              {Layers}
            </Card3DContainer>
          ) : (
            <div className="flex items-start gap-x-0.5">
              <div className="w-100 h-150">{Layers}</div>
            </div>
          )}
        </div>
        <div
          className={`mt-1 transition-all duration-300 ease-in-out overflow-hidden ${isPreview ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <SideColorPalette />
        </div>
        <div className="mt-3">{!isPreview && <SaveButton />}</div>
      </div>
      <CardListPanel />
    </div>
  );
}
