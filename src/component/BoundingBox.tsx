import useResize from "../hook/useResize";
import useRotation from "../hook/useRotation";

export type HandleDirection = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";
interface BoundingBoxProps {
  layerId: string;
}
export default function BoundingBox({ layerId }: BoundingBoxProps) {
  // 리사이즈 훅
  const { onResizeStart } = useResize(layerId);
  const { onRotateStart } = useRotation(layerId);

  const handles: {
    direction: HandleDirection;
    cursor: string;
    positionClass: string;
  }[] = [
    {
      direction: "nw",
      cursor: "cursor-nwse-resize",
      positionClass: "-top-[5px] -left-[5px]",
    },
    {
      direction: "n",
      cursor: "cursor-ns-resize",
      positionClass: "-top-[5px] left-1/2 -translate-x-1/2",
    },
    {
      direction: "ne",
      cursor: "cursor-nesw-resize",
      positionClass: "-top-[5px] -right-[5px]",
    },
    {
      direction: "w",
      cursor: "cursor-ew-resize",
      positionClass: "top-1/2 -left-[5px] -translate-y-1/2",
    },
    {
      direction: "e",
      cursor: "cursor-ew-resize",
      positionClass: "top-1/2 -right-[5px] -translate-y-1/2",
    },
    {
      direction: "sw",
      cursor: "cursor-nesw-resize",
      positionClass: "-bottom-[5px] -left-[5px]",
    },
    {
      direction: "s",
      cursor: "cursor-ns-resize",
      positionClass: "-bottom-[5px] left-1/2 -translate-x-1/2",
    },
    {
      direction: "se",
      cursor: "cursor-nwse-resize",
      positionClass: "-bottom-[5px] -right-[5px]",
    },
  ];

  return (
    <>
      {/* 2. 리사이즈 조절점 렌더링 */}
      {handles.map((handle) => (
        <div
          key={handle.direction}
          className={`absolute w-2 h-2 bg-white border-2 border-blue-500 rounded-full ${handle.positionClass} ${handle.cursor}`}
          onMouseDown={(e) => onResizeStart(e, handle.direction, handle.cursor)}
        />
      ))}

      {/* 3. 회전(Rotate) 조절점 및 연결 선 렌더링 */}
      <div
        className="absolute w-2 h-2 bg-white border-2 border-green-500 rounded-full cursor-rotate -top-11.25 left-1/2 -translate-x-1/2"
        onMouseDown={onRotateStart}
      />
      {/* 회전 조절점이 요소와 연결되어 있음을 보여주는 시각적 가이드라인 */}
      <div className="absolute w-0.5 h-8 bg-green-500 -top-9.25 left-1/2 -translate-x-1/2 pointer-events-none" />
    </>
  );
}
