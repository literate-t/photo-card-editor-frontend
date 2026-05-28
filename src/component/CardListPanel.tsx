import { useEffect, useRef, useState } from "react";
import apiClient from "../lib/apiClient";
import type { Layer } from "../store/useEditorStore";
import { useEditorStore } from "../store/useEditorStore";
import { StaticCardLayers } from "./StaticCardLayers";

interface CardListItem {
  uuid: string;
  createdAt: string;
  sideColor: string;
}

interface PreviewState {
  uuid: string;
  y: number;
  sideColor: string;
  data: { layers: Layer[] } | null;
  loading: boolean;
}

export default function CardListPanel() {
  const [cards, setCards] = useState<CardListItem[]>([]);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardSaveVersion = useEditorStore((state) => state.cardSaveVersion);

  useEffect(() => {
    apiClient
      .get<CardListItem[]>("/api/card")
      .then((res) => setCards(res.data))
      .catch(() => {});
  }, [cardSaveVersion]);

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const startLeaveTimer = () => {
    clearLeaveTimer();
    leaveTimerRef.current = setTimeout(() => setPreview(null), 200);
  };

  const handleMouseEnterItem = (
    card: CardListItem,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    clearLeaveTimer();

    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setPreview({
      uuid: card.uuid,
      y: rect.top,
      sideColor: card.sideColor,
      data: null,
      loading: true,
    });

    fetchTimerRef.current = setTimeout(() => {
      apiClient
        .get<{ layers: Layer[] }>(`/api/card/${card.uuid}`)
        .then((res) => {
          setPreview((prev) =>
            prev?.uuid === card.uuid
              ? { ...prev, data: res.data, loading: false }
              : prev,
          );
        })
        .catch(() => {
          setPreview((prev) =>
            prev?.uuid === card.uuid ? { ...prev, loading: false } : prev,
          );
        });
    }, 120);
  };

  const previewTop = preview
    ? Math.min(Math.max(preview.y, 8), window.innerHeight - 316)
    : 0;

  return (
    <>
      <div className="w-60 h-screen bg-[#1e1f21] flex flex-col shrink-0">
        <p className="px-4 pt-5 pb-3 text-zinc-400 text-xs uppercase tracking-widest">
          My Cards
        </p>
        <div className="flex-1 overflow-y-auto">
          {cards.map((card, i) => (
            <div
              key={card.uuid}
              className="px-4 py-3 cursor-default hover:bg-[#2e2f31] border-b border-zinc-800"
              onMouseEnter={(e) => handleMouseEnterItem(card, e)}
              onMouseLeave={startLeaveTimer}
            >
              <p className="text-zinc-200 text-sm font-medium">
                #{cards.length - i}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">
                {card.uuid.slice(0, 8)}&nbsp;·&nbsp;
                {card.createdAt.slice(0, 10)}
              </p>
            </div>
          ))}
          {cards.length === 0 && (
            <p className="px-4 py-3 text-zinc-600 text-xs">저장된 카드 없음</p>
          )}
        </div>
      </div>

      {preview && (
        <div
          className="fixed z-50 pointer-events-auto"
          style={{ right: 252, top: previewTop }}
          onMouseEnter={clearLeaveTimer}
          onMouseLeave={startLeaveTimer}
        >
          {preview.loading || !preview.data ? (
            <div className="w-50 h-75 rounded-2xl bg-[#2a2b2d] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-50 h-75">
              <StaticCardLayers layers={preview.data.layers} scale={0.5} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
