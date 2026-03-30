import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";

export const useDrag = (layerId: string) => {
  // 상태 변경 함수 가져오기
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const setSelectedLayer = useEditorStore((state) => state.setSelectedLayer);

  const isDragging = useRef<boolean>(false);
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) {
        return;
      }

      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;

      const { layers } = useEditorStore.getState();
      const targetLayer = layers.find((l) => l.id === layerId);

      if (targetLayer) {
        updateLayer(layerId, {
          x: targetLayer.x + deltaX,
          y: targetLayer.y + deltaY,
        });
      }

      lastPosition.current = { x: e.clientX, y: e.clientY };
    },
    [layerId, updateLayer],
  );

  // 드래그 종료
  const onMouseUp = useCallback(
    function handleMouseUp() {
      if (isDragging.current) {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    },
    [onMouseMove],
  );

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLayer(layerId);

    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return { onMouseDown };
};
