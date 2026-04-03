import { useCallback, useEffect, useRef } from "react";
import type { HandleDirection } from "../component/BoundingBox";
import { useEditorStore } from "../store/useEditorStore";

const MIN_SIZE = 10;
export default function useResize(layerId: string) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const layer = useEditorStore((state) =>
    state.layers.find((l) => l.id == layerId),
  );

  const resizeState = useRef<{
    isResizing: boolean;
    direction: HandleDirection | null;
    startX: number;
    startY: number;
    startLayerX: number;
    startLayerY: number;
    startWidth: number;
    startHeight: number;
  }>({
    isResizing: false,
    direction: null,
    startX: 0,
    startY: 0,
    startLayerX: 0,
    startLayerY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const onResizeStart = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      direction: HandleDirection,
    ): void => {
      event.stopPropagation();
      if (!layer || resizeState.current.isResizing) {
        return;
      }

      resizeState.current = {
        isResizing: true,
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startLayerX: layer.x,
        startLayerY: layer.y,
        startWidth: layer.width,
        startHeight: layer.height,
      };
    },
    [layer],
  );

  const onMouseMove = useCallback(
    (event: MouseEvent): void => {
      const state = resizeState.current;
      if (!state.isResizing || !state.direction) {
        return;
      }

      const direction = state.direction;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      let newWidth = state.startWidth;
      let newHeight = state.startHeight;
      let newX = state.startLayerX;
      let newY = state.startLayerY;

      if (direction.includes("e")) {
        newWidth = newWidth + dx;
      }
      if (direction.includes("w")) {
        newWidth = newWidth - dx;
        newX = newX + dx;
      }

      if (direction.includes("s")) {
        newHeight = newHeight + dy;
      }

      if (direction.includes("n")) {
        newHeight = newHeight - dy;
        newY = newY + dy;
      }

      if (newWidth < MIN_SIZE) {
        newWidth = MIN_SIZE;
        if (direction.includes("w")) {
          newX = state.startLayerX + state.startWidth - MIN_SIZE;
        }
      }

      if (newHeight < MIN_SIZE) {
        newHeight = MIN_SIZE;
        if (direction.includes("n")) {
          newY = state.startLayerY + state.startHeight - MIN_SIZE;
        }
      }

      updateLayer(layerId, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    },
    [updateLayer, layerId],
  );

  const onMouseUp = useCallback(() => {
    resizeState.current.isResizing = false;
    resizeState.current.direction = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return { onResizeStart };
}
