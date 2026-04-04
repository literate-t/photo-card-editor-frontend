import { useCallback, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";

export default function useRotation(layerId: string) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const layer = useEditorStore((state) =>
    state.layers.find((l) => l.id === layerId),
  );

  const rotateState = useRef<{
    isRotating: boolean;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  }>({
    isRotating: false,
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    startRotation: 0,
  });

  const onRotateStart = useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      if (!layer) {
        return;
      }

      // 요소의 물리적 좌표
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;

      // 중심점으로부터 현재 마우스 위치까지의 각도
      const dy = e.clientY - centerY;
      const dx = e.clientX - centerX;
      const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      const startRotation = layer.rotation || 0;

      rotateState.current = {
        isRotating: true,
        centerX,
        centerY,
        startAngle,
        startRotation,
      };

      document.body.classList.add("cursor-rotate");

      const onMouseMove = (e: MouseEvent): void => {
        const state = rotateState.current;
        if (!state.isRotating) {
          return;
        }

        const dy = e.clientY - state.centerY;
        const dx = e.clientX - state.centerX;
        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

        const deltaAngle = currentAngle - state.startAngle;
        const newRotation = (state.startRotation + deltaAngle) % 360;

        updateLayer(layerId, {
          rotation: newRotation,
        });
      };

      const onMouseUp = () => {
        rotateState.current.isRotating = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        document.body.classList.remove("cursor-rotate");
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [layer, layerId, updateLayer],
  );

  return { onRotateStart };
}
