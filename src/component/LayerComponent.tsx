import cn from "classnames";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDrag } from "../hook/useDrag";
import {
  useEditorStore,
  type BlendMode,
  type TextLayer,
} from "../store/useEditorStore";
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
  const isPreview = useEditorStore((state) => state.isPreview);
  const { onDragStart } = useDrag(layerId);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const textRef = useRef<HTMLDivElement>(null);

  // stale한 값을 참조하지 않도록
  const layerRef = useRef<TextLayer>(layer as TextLayer);
  useLayoutEffect(() => {
    layerRef.current = layer as TextLayer;
  }, [layer]);

  useEffect(() => {
    const targetElement = textRef.current;
    if (!targetElement || !isEditing || layer?.type !== "text") {
      return;
    }

    targetElement.innerHTML = layerRef.current.content;

    targetElement.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(targetElement);
    range.collapse(); // 커서를 맨 끝으로
    selection?.removeAllRanges();
    selection?.addRange(range);

    const handleNativeInput = () => {
      const height = targetElement.offsetHeight;
      const currentLayer = layerRef.current;

      if (currentLayer) {
        updateLayer(layerId, {
          height: Math.max(layer.height, height),
          content: targetElement.innerHTML,
        });
      }
    };

    const handleNativeBlur = () => {
      setIsEditing(false);
    };

    targetElement.addEventListener("input", handleNativeInput);
    targetElement.addEventListener("blur", handleNativeBlur);

    return () => {
      targetElement.removeEventListener("input", handleNativeInput);
      targetElement.removeEventListener("blur", handleNativeBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, updateLayer, layerId]);

  if (!layer) {
    return null;
  }

  const isSelected = selectedLayerId === layerId;
  const isTextLayer = layer.type === "text";
  const isImageLayer = layer.type === "image";

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isTextLayer || isPreview) {
      return;
    }

    e.stopPropagation();
    setIsEditing(true);
  };

  const currentBlendMode: BlendMode = isImageLayer ? layer.blendMode : "normal";

  return (
    <div
      onMouseDown={(e) => {
        if (isPreview) {
          return;
        }
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
          className={`w-full outline-none wrap-break-word ${!isEditing ? "pointer-events-none select-none" : ""}`}
          style={{
            fontSize: layer.fontSize,
            color: layer.color,
            fontWeight: layer.fontWeight,
          }}
          dangerouslySetInnerHTML={
            isEditing ? undefined : { __html: layer.content }
          }
        />
      )}
      {isSelected && <BoundingBox layerId={layerId} />}
    </div>
  );
}
