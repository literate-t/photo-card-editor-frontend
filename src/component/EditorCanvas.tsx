import { useEditorStore } from "../store/useEditorStore";
import Card3DContainer from "./Card3DContainer";
import LayerComponent from "./LayerComponent";

export default function EditorCanvas() {
  const layers = useEditorStore((state) => state.layers);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const isPreview = useEditorStore((state) => state.isPreview);
  const togglePreview = useEditorStore((state) => state.togglePreview);
  // const addLayer = useEditorStore((state) => state.addLayer);
  // const idRef = useRef<number>(0);

  const handleBackgroundClick = () => {
    if (!isPreview) {
      clearSelection();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-screen bg-gray-100"
      onMouseDown={handleBackgroundClick}
    >
      {/* 컨트롤 패널 */}
      <div className="mb-6 space-x-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePreview();
          }}
          className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded shadow hover:bg-indigo-700"
        >
          {isPreview ? "편집모드로 돌아가기" : "미리보기"}
        </button>
      </div>
      {/* 3D 캔버스 영역 */}
      <Card3DContainer width={400} height={600}>
        <div className="relative w-full h-full bg-white overflow-hidden">
          {layers.map((layer) => (
            <LayerComponent key={layer.id} layerId={layer.id} />
          ))}
        </div>
      </Card3DContainer>
    </div>
  );
}
