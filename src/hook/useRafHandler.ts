import { useCallback, useEffect, useRef } from "react";

export default function useRafHandler<T>(callback: (arg: T) => void) {
  const frameRef = useRef<number | undefined>(undefined);
  const latestArgRef = useRef<T | null>(null);

  const handler = useCallback(
    (arg: T) => {
      latestArgRef.current = arg;

      if (frameRef.current) {
        return;
      }

      frameRef.current = requestAnimationFrame(() => {
        if (latestArgRef.current) {
          callback(latestArgRef.current);
          frameRef.current = 0; // 작업 완료 후 초기화
        }
      });
    },
    [callback],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return handler;
}
