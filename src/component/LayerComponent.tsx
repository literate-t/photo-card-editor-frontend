import { useDrag } from "../hook/useDrag";
import { useEditorStore } from "../store/useEditorStore";

interface LayerComponentProps {
  layerId: string;
}

export default function LayerComponent({ layerId }: LayerComponentProps) {
  const layer = useEditorStore((state) =>
    state.layers.find((l) => l.id === layerId),
  );
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const { onMouseDown } = useDrag(layerId);

  if (!layer) {
    return null;
  }

  const isSelected = selectedLayerId === layerId;

  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute border-2 ${isSelected ? "border-blue-500 cursor-grabbing" : "border-transparent cursor-grab"}`}
      style={{
        transform: `traslate(${layer.x}px, ${layer.y}px)`,
        width: layer.width,
        height: layer.height,
        zIndex: layer.zIndex,
      }}
    >
      {/* 포인터 이벤트를 제거해 최상위 div가 받는다 */}
      {layer.type === "image" ? (
        <img
          src={layer.src}
          alt={`layer-${layer.id}`}
          className="w-full h-full pointer-events-none"
        />
      ) : (
        <div className="w-full h-full pointer-events-none"></div>
      )}
    </div>
  );
}
