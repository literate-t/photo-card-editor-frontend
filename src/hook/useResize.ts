import { useCallback } from "react";
import type { HandleDirection } from "../component/BoundingBox";
import { useEditorStore } from "../store/useEditorStore";

export default function useResize(layerId: string) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const setSelectedLayer = useEditorStore((state) => state.setSelectedLayer);
  const layer = useEditorStore((state) =>
    state.layers.find((l) => l.id == layerId),
  );

  const onResizeStart = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      direction: HandleDirection,
      cursor: string,
    ): void => {
      event.stopPropagation();
      if (!layer) {
        return;
      }

      // 포커스 레이어(useDrag에도 있지만 안전하게)
      setSelectedLayer(layerId);

      // 최초 스냅샷
      const startX = event.clientX;
      const startY = event.clientY;
      const startLayerX = layer.x;
      const startLayerY = layer.y;
      const startWidth = layer.width;
      const startHeight = layer.height;
      const rotation = layer.rotation || 0;
      const isResizing = true;

      // 최초 중심점
      const startCx = startLayerX + startWidth / 2;
      const startCy = startLayerY + startHeight / 2;

      const radian = (rotation * Math.PI) / 180;
      const cos = Math.cos(radian);
      const sin = Math.sin(radian);

      // 커서 스타일 전역 적용
      document.body.classList.add(cursor);

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizing || !direction) {
          return;
        }

        // 글로벌 델타(마우스 움직임)
        const globalDx = moveEvent.clientX - startX;
        const globalDy = moveEvent.clientY - startY;

        // 회전 역행렬을 통해 로컬 델타로 변환
        const localDx = globalDx * cos + globalDy * sin;
        const localDy = -globalDx * sin + globalDy * cos;

        let deltaWidth = 0;
        let deltaHeight = 0;

        // w, n은 로컬 델타와 길이 델타가 음의 상관관계
        if (direction.includes("e")) deltaWidth = localDx;
        if (direction.includes("w")) deltaWidth = -localDx;
        if (direction.includes("s")) deltaHeight = localDy;
        if (direction.includes("n")) deltaHeight = -localDy;

        // 최소 크기보다 작아질 수 없음
        const newWidth = Math.max(10, startWidth + deltaWidth);
        const newHeight = Math.max(10, startHeight + deltaHeight);

        // 최소 크기 제한 때문에 날아간, 실제 델타값 다시 구하기
        const actualWidthDelta = newWidth - startWidth;
        const actualHeightDelta = newHeight - startHeight;

        // 로컬 중심점 이동량 구하기
        let localCxDelta = 0;
        let localCyDelta = 0;

        if (direction.includes("e")) localCxDelta = actualWidthDelta / 2;
        if (direction.includes("w")) localCxDelta = -actualWidthDelta / 2;
        if (direction.includes("s")) localCyDelta = actualHeightDelta / 2;
        if (direction.includes("n")) localCyDelta = -actualHeightDelta / 2;

        // 정방향 행렬로 로컬 중심점 델타를 글로벌 중심점 델타로변경
        const globalCxDelta = cos * localCxDelta - sin * localCyDelta;
        const globalCyDelta = sin * localCxDelta + cos * localCyDelta;

        // 최종 글로벌 중심점
        const newCx = startCx + globalCxDelta;
        const newCy = startCy + globalCyDelta;

        // 최종 좌상단 좌표
        const newX = newCx - newWidth / 2;
        const newY = newCy - newHeight / 2;
        console.log("newX", newX);
        console.log("newY", newY);

        updateLayer(layerId, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        document.body.classList.remove(cursor);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [layer, updateLayer, setSelectedLayer, layerId],
  );

  return { onResizeStart };
}
