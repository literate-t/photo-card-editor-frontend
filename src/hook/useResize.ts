import { useCallback, useRef } from "react";
import type { HandleDirection } from "../component/BoundingBox";
import { useEditorStore, type TextLayer } from "../store/useEditorStore";

export default function useResize(layerId: string) {
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const setSelectedLayer = useEditorStore((state) => state.setSelectedLayer);
  const isResizing = useRef<boolean>(false);
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
      // const isResizing = true;
      isResizing.current = true;

      // 최초 중심점
      const startCx = startLayerX + startWidth / 2;
      const startCy = startLayerY + startHeight / 2;

      const radian = (rotation * Math.PI) / 180;
      const cos = Math.cos(radian);
      const sin = Math.sin(radian);

      // 커서 스타일 전역 적용
      document.body.classList.add(cursor);

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizing.current || !direction) {
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

        // 임시 크기
        const tempWidth = Math.max(10, startWidth + deltaWidth);
        const tempHeight = Math.max(10, startHeight + deltaHeight);

        // 최종 적용
        let finalWidth = tempWidth;
        let finalHeight = tempHeight;
        let finalFontSize: string | undefined = undefined;
        let autoHeightDelta = 0;

        if (layer.type === "text") {
          const isHorizontal = direction === "e" || direction === "w";
          const isDiagonal = direction.length === 2;
          const startFontSizeNumber =
            parseFloat(String(layer.fontSize).replace(/[^0-9.]/g, "")) || 16;

          if (isDiagonal) {
            // 대각선 핸들은 완벽한 비례 스케일링
            const scaleRatio = finalWidth / startWidth;
            finalHeight = startHeight * scaleRatio;
            finalFontSize = `${startFontSizeNumber * scaleRatio}px`;
          } else if (isHorizontal) {
            // 좌우 핸들: 폰트 고정, 너비 조절, 높이는 랩핑에 맞춰
            finalFontSize = `${startFontSizeNumber}px`;

            // DOM에 직접 접근해 텍스트 실제 높이 구하기
            const textEl = document.getElementById(`text-${layer.id}`);
            if (textEl) {
              // DOM에 접근해서 읽기 값만 구할 것이기 때문에 마지막에 되돌려놓는다
              // 제어권은 React에게
              const originalWidth = textEl.style.width;
              const originalHeight = textEl.style.height;

              // 랩핑이 적용됐을 때의 높이를 미리 계산하기 위함
              textEl.style.width = `${finalWidth}px`;
              textEl.style.height = "auto";

              // 랩핑이 반영된 높이 구하기
              finalHeight = Math.max(10, textEl.scrollHeight);
              autoHeightDelta = finalHeight - startHeight;

              textEl.style.width = originalWidth;
              textEl.style.height = originalHeight;
            }
          } else {
            finalWidth = startWidth;
            finalFontSize = `${startFontSizeNumber}px`;

            const textEl = document.getElementById(`text-${layer.id}`);
            if (textEl) {
              const minTextHeight = textEl.scrollHeight;
              finalHeight = Math.max(minTextHeight, tempHeight);
            }
          }
        }

        // 최소 크기 제한 때문에 날아간, 실제 델타값 다시 구하기
        const actualWidthDelta = finalWidth - startWidth;
        const actualHeightDelta = finalHeight - startHeight;

        // 로컬 중심점 이동량 구하기
        let localCxDelta = 0;
        let localCyDelta = 0;

        if (direction.includes("e")) localCxDelta = actualWidthDelta / 2;
        if (direction.includes("w")) localCxDelta = -actualWidthDelta / 2;

        if (direction.includes("s")) localCyDelta = actualHeightDelta / 2;
        else if (direction.includes("n")) localCyDelta = -actualHeightDelta / 2;
        else if (autoHeightDelta !== 0) localCyDelta = autoHeightDelta / 2;

        // 정방향 행렬로 로컬 중심점 델타를 글로벌 중심점 델타로변경
        const globalCxDelta = cos * localCxDelta - sin * localCyDelta;
        const globalCyDelta = sin * localCxDelta + cos * localCyDelta;

        // 최종 글로벌 중심점
        const newCx = startCx + globalCxDelta;
        const newCy = startCy + globalCyDelta;

        // 최종 좌상단 좌표
        const newX = newCx - finalWidth / 2;
        const newY = newCy - finalHeight / 2;

        const updatePayload: Partial<typeof layer> = {
          x: newX,
          y: newY,
          width: finalWidth,
          height: finalHeight,
        };

        if (layer.type === "text" && finalFontSize) {
          (updatePayload as TextLayer).fontSize = finalFontSize;
        }

        updateLayer(layerId, updatePayload);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        isResizing.current = false;
        document.body.classList.remove(cursor);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [layer, updateLayer, setSelectedLayer, layerId],
  );

  return { onResizeStart, isResizing };
}
