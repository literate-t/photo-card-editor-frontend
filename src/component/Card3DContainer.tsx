import cn from "classnames";
import { useRef, useState } from "react";

interface Card3DContainerProps {
  children: React.ReactNode;
  width: number;
  height: number;
}

export default function Card3DContainer({
  children,
  width,
  height,
}: Card3DContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [rotation, setRotation] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const THICKNESS = 4; // 단위: px
  const HALF_THICKNESS = THICKNESS / 2;

  // TODO: 틸트 물리 엔진

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        perspective: "1000px",
      }}
    >
      {/* 3D 몸체 켄테이너(틸트 회전 담당) */}
      <div
        className={cn("relative w-full h-full", {
          "transition-transform duration-200 ease-out": !isHovered,
        })}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* 앞면: 앞으로 2px 밀어내기 */}
        <div
          className="absolute inset-0 bg-white shadow-md overflow-hidden"
          style={{
            transform: `translateZ(${HALF_THICKNESS}px)`,
          }}
        >
          {children}
        </div>
        {/* 뒷면: 뒤집어서 뒤로 2px 밀어내기 */}
        <div
          className="absolute inset-0 bg-gray-200"
          style={{
            transform: `rotateY(180deg) translateZ(${HALF_THICKNESS})`,
          }}
        />
        {/* 위쪽 측면 */}
        <div
          className="absolute top-0 left-0 bg-gray-300 origin-top"
          style={{
            width: "100%",
            height: `${THICKNESS}px`,
            transform: `rotateX(90deg) translateY(-${HALF_THICKNESS}px)`,
          }}
        />
        {/* 아래쪽 측면 */}
        {/* 왼쪽 측면 */}
        {/* 오른쪽 측면 */}
      </div>
    </div>
  );
}
