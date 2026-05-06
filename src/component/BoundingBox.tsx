import useResize from "../hook/useResize";
import { useEditorStore } from "../store/useEditorStore";

export type HandleDirection = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";
interface BoundingBoxProps {
  layerId: string;
}
export default function BoundingBox({ layerId }: BoundingBoxProps) {
  // 리사이즈 훅
  const { onResizeStart } = useResize(layerId);
  // const { onRotateStart } = useRotation(layerId);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const isSelected = selectedLayerId === layerId;

  const handles: {
    direction: HandleDirection;
    cursor: string;
    positionClass: string;
  }[] = [
    {
      direction: "nw",
      cursor: "cursor-nwse-resize",
      positionClass: "-top-[3px] -left-[3px]",
    },
    {
      direction: "n",
      cursor: "cursor-ns-resize",
      positionClass: "-top-[3px] left-1/2 -translate-x-1/2",
    },
    {
      direction: "ne",
      cursor: "cursor-nesw-resize",
      positionClass: "-top-[3px] -right-[3px]",
    },
    {
      direction: "w",
      cursor: "cursor-ew-resize",
      positionClass: "top-1/2 -left-[3px] -translate-y-1/2",
    },
    {
      direction: "e",
      cursor: "cursor-ew-resize",
      positionClass: "top-1/2 -right-[3px] -translate-y-1/2",
    },
    {
      direction: "sw",
      cursor: "cursor-nesw-resize",
      positionClass: "-bottom-[3px] -left-[3px]",
    },
    {
      direction: "s",
      cursor: "cursor-ns-resize",
      positionClass: "-bottom-[3px] left-1/2 -translate-x-1/2",
    },
    {
      direction: "se",
      cursor: "cursor-nwse-resize",
      positionClass: "-bottom-[3px] -right-[3px]",
    },
  ];

  return (
    <>
      {/* 2. 리사이즈 조절점 렌더링 */}
      {handles.map((handle) => (
        <div
          key={handle.direction}
          className={`absolute w-1.5 h-1.5 bg-gray-100 border border-gray-500 rounded-full transition-opacity duration-200 ${handle.positionClass} ${handle.cursor} 
          ${isSelected ? "opacity-100" : "opacity-0"}`}
          onMouseDown={(e) => onResizeStart(e, handle.direction, handle.cursor)}
        />
      ))}

      {/* TODO: 개선 */}
      {/* 3. 회전(Rotate) 조절점 및 연결 선 렌더링 */}
      {/* <div
        className="absolute w-1.5 h-1.5 bg-white border border-gray-500 rounded-full cursor-rotate -top-10.25 left-1/2 -translate-x-1/2"
        onMouseDown={onRotateStart}
      />
      {/* 회전 조절점이 요소와 연결되어 있음을 보여주는 시각적 가이드라인 */}
      {/* <div className="absolute w-px h-8 bg-gray-500 -top-8.75 left-1/2 -translate-x-1/2 pointer-events-none" /> */}
    </>
  );
}
