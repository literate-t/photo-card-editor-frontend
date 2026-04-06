import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDrag } from "../hook/useDrag";
import { useEditorStore, type BlendMode } from "../store/useEditorStore";
import BoundingBox from "./BoundingBox";

interface LayerComponentProps {
  layerId: string;
}

export default function LayerComponent({ layerId }: LayerComponentProps) {
  const layer = useEditorStore((state) =>
    state.layers.find((l) => l.id === layerId),
  );
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const { onDragStart } = useDrag(layerId);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      range.collapse(false); // 커서를 맨 끝으로
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  if (!layer) {
    return null;
  }

  const isSelected = selectedLayerId === layerId;
  const isTextLayer = layer.type === "text";
  const isImageLayer = layer.type === "image";

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isTextLayer) {
      return;
    }

    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInput = () => {
    if (textRef.current && isTextLayer) {
      const height = textRef.current.offsetHeight;

      updateLayer(layerId, {
        height: Math.max(layer.height, height),
      });
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current && isTextLayer) {
      updateLayer(layerId, { content: textRef.current.innerText });
    }
  };

  const currentBlendMode: BlendMode = isImageLayer ? layer.blendMode : "normal";

  return (
    <div
      onMouseDown={(e) => {
        if (isEditing) {
          e.stopPropagation();
        } else {
          onDragStart(e);
        }
      }}
      onDoubleClick={handleDoubleClick}
      className={cn("absolute border-2 select-none", {
        "border-blue-500 cursor-grab": isSelected,
        "border-transparent cursor-default": !isSelected,
        "cursor-text": isEditing,
      })}
      style={{
        transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation || 0}deg)`,
        width: layer.width,
        height: layer.height,
        zIndex: layer.zIndex,
        mixBlendMode: currentBlendMode as never,
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
        <div
          id={`text-${layer.id}`}
          ref={textRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          onBlur={handleBlur}
          onInput={handleInput}
          className={`w-full outline-none wrap-break-word ${!isEditing ? "pointer-events-none select-none" : ""}`}
          style={{
            fontSize: layer.fontSize,
            color: layer.color,
            fontWeight: layer.fontWeight,
          }}
        >
          {layer.content}
        </div>
      )}
      {isSelected && <BoundingBox layerId={layerId} />}
    </div>
  );
}
