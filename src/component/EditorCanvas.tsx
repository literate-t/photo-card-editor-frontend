import { useEditorStore } from "../store/useEditorStore";
import Card3DContainer from "./Card3DContainer";
import LayerComponent from "./LayerComponent";
import LayerToolbar from "./LayerToolbar";

export default function EditorCanvas() {
  const layers = useEditorStore((state) => state.layers);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const isPreview = useEditorStore((state) => state.isPreview);
  const togglePreview = useEditorStore((state) => state.togglePreview);

  const handleBackgroundClick = () => {
    if (!isPreview) {
      clearSelection();
    }
  };

  const Layer = (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {layers.map((layer) => (
        <LayerComponent key={layer.id} layerId={layer.id} />
      ))}
    </div>
  );

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-screen bg-gray-100"
      onMouseDown={handleBackgroundClick}
    >
      {/* 컨트롤 패널 */}
      <div className="flex mb-6 space-x-4">
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
          {Layer}
        </Card3DContainer>
      ) : (
        <div className="w-100 h-150">{Layer}</div>
      )}
    </div>
  );
}
