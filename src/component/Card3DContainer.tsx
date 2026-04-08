import cn from "classnames";
import { useCallback, useRef, useState } from "react";
import useRafHandler from "../hook/useRafHandler";

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
  const [glare, setGlare] = useState({ angle: 0, opacity: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const THICKNESS = 8; // 단위: px
  const HALF_THICKNESS = THICKNESS / 2;
  const MAX_ROTATION_DEGREE = 20;

  const updateMouseEffect = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // 중심점 기준의 offset 만들기
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // 중심점을 기준으로 떨어질 거리를 -1.0 ~ 1.0으로 정규화
      const ratioX = deltaX / (rect.width / 2);
      const ratioY = deltaY / (rect.height / 2);

      // 틸트 회전
      // 마우스롤 좌우로 왔다갔다 하면 Y축 회전
      const rotateY = ratioX * MAX_ROTATION_DEGREE;
      // 마우스롤 위아래로 왔다갔다 하면 X축 회전
      const rotateX = ratioY * MAX_ROTATION_DEGREE * -1; // -1을 곱해야 정상적인 방향이 나온다

      // 광택
      // Math.atan2를 통해 마우스 방향을 향하는 각도
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90; // to degree
      // 정규화된 값으로 거리 구하기(최대 1.414)
      const distance = Math.sqrt(ratioX * ratioX + ratioY * ratioY);
      // 거리에 따른 투명도 변화
      const opacity = Math.min(0.5, distance * 0.5);

      setRotation({ x: rotateX, y: rotateY });
      setGlare({ angle, opacity });
    },
    [],
  );

  const handleMouseMove = useRafHandler(updateMouseEffect);

  const handleMouseEnter = () => {
    // 순간 이동 틸팅되는 걸 방지
    setTimeout(() => setIsHovered(true), 150);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setGlare({ angle: 0, opacity: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
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
          <div
            className={cn(
              "absolute inset-0 pointer-events-none mix-blend-overlay",
              {
                "transition-opacity duration-200 ease-out": !isHovered,
              },
            )}
            style={{
              backgroundImage: `linear-gradient(${glare.angle}deg, rgba(255, 255, 255, ${glare.opacity}), rgba(255, 255, 255, 0) 80%)`,
              transform: "translateZ(0)",
              willChange: "opacity, background-image",
            }}
          />
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
          className="absolute top-0 left-0 origin-top bg-gray-300 "
          style={{
            width: "100%",
            height: `${THICKNESS}px`,
            transform: `rotateX(90deg) translateY(-${HALF_THICKNESS}px)`,
          }}
        />
        {/* 아래쪽 측면 */}
        <div
          className="absolute bottom-0 left-0 origin-bottom bg-gray-500"
          style={{
            width: "100%",
            height: `${THICKNESS}px`,
            transform: `rotateX(-90deg) translateY(${HALF_THICKNESS}px)`,
          }}
        />
        {/* 왼쪽 측면 */}
        <div
          className="absolute top-0 left-0 origin-left bg-gray-300"
          style={{
            width: `${THICKNESS}px`,
            height: "100%",
            transform: `rotateY(-90deg) translateX(-${HALF_THICKNESS}px)`,
          }}
        />
        {/* 오른쪽 측면 */}
        <div
          className="absolute top-0 right-0 origin-right bg-gray-500"
          style={{
            width: `${THICKNESS}px`,
            height: "100%",
            transform: `rotateY(90deg) translateX(${HALF_THICKNESS}px)`,
          }}
        />
      </div>
    </div>
  );
}
