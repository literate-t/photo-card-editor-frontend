import cn from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import useRafHandler from "../hook/useRafHandler";
import { useEditorStore } from "../store/useEditorStore";

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
  const sideColor = useEditorStore((state) => state.sideColor);

  const [rotation, setRotation] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [glare, setGlare] = useState({ angle: 0, opacity: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const THICKNESS = 8; // 단위: px
  const HALF_THICKNESS = THICKNESS / 2;
  const MAX_ROTATION_DEGREE = 45;

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
    setTimeout(() => setIsHovered(true), 300);
    // setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare({ angle: 0, opacity: 0 });
    setIsHovered(false);
  };

  const middleLayers = useMemo(() => {
    const layerCount = Math.floor(THICKNESS / 2);
    const stride = THICKNESS / (layerCount + 1); // 간격의 개수는 layer + 1

    return Array.from({ length: layerCount }).map((_, i) => {
      const zPos = -HALF_THICKNESS + stride * (i + 1);

      return (
        <div
          key={`layer-${i}`}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            transform: `translateZ(${zPos}px)`,
            backgroundColor: sideColor,
          }}
        />
      );
    });
  }, [THICKNESS, HALF_THICKNESS, sideColor]);

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
        className={cn("relative w-full h-full rounded-2xl", {
          "transition-transform duration-200 ease-out": !isHovered,
        })}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          willChange: isHovered ? "transform" : "auto",
        }}
      >
        {/* 뒷면: 뒤로 4px */}
        <div
          className="absolute inset-0 rounded-2xl bg-gray-400"
          style={{
            transform: `translateZ(-${HALF_THICKNESS}px) rotateY(180deg)`,
          }}
        />
        {middleLayers}
        {/* 앞면: 앞으로 4px */}
        <div
          className="absolute inset-0 rounded-2xl shadow-md overflow-hidden"
          style={{
            transform: `translateZ(${HALF_THICKNESS}px)`,
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          }}
        >
          {children}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none mix-blend-overlay z-999",
              {
                "transition-opacity duration-200 ease-out": !isHovered,
              },
            )}
            style={{
              backgroundImage: `linear-gradient(${glare.angle}deg, rgba(255, 255, 255, ${glare.opacity}), rgba(255, 255, 255, 0) 80%)`,
              transform: "translateZ(0)",
              willChange: isHovered ? "opacity, background-image" : "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
}
