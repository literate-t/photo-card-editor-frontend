import { useDrag } from "../hook/useDrag";
import { useEditorStore } from "../store/useEditorStore";
import BoundingBox from "./BoundingBox";

interface LayerComponentProps {
  layerId: string;
}

export default function LayerComponent({ layerId }: LayerComponentProps) {
  const layer = useEditorStore((state) =>
    state.layers.find((l) => l.id === layerId),
  );
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const { onDragStart } = useDrag(layerId);

  if (!layer) {
    return null;
  }

  const isSelected = selectedLayerId === layerId;

  return (
    <div
      onMouseDown={onDragStart}
      className={`absolute border-2 select-none ${isSelected ? "border-blue-500 cursor-grabbing" : "border-transparent cursor-grab"}`}
      style={{
        transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation || 0}deg)`,
        width: layer.width,
        height: layer.height,
        zIndex: layer.zIndex,
        // transform-origin은 기본값인 50% 50%가 적용되므로 요소의 중심을 축으로 회전
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
        <div className="w-full h-full pointer-events-none">{layer.content}</div>
      )}
      {isSelected && <BoundingBox layerId={layerId} />}
    </div>
  );
}
