import { useEditorStore } from "../store/useEditorStore";

export default function SideColorPalette() {
  const PALETTE_COLORS = [
    "#ffffff",
    "#d1d5db",
    "#9ca3af",
    "#4b5563",
    "#000000",
    "#f87171",
    "#fb923c",
    "#facc15",
    "#4ade80",
    "#60a5fa",
    "#a78bfa",
  ];

  const sideColor = useEditorStore((state) => state.sideColor);
  const setSideColor = useEditorStore((state) => state.setSideColor);

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-200 border border-gray-400 rounded-xl shadow-sm w-fit">
      <span className="text-[10px] text-center font-normal text-gray-700">
        Side
      </span>
      <div className="flex gap-1">
        {PALETTE_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSideColor(color)}
            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 
                ${sideColor === color ? "border-blue-500 scale-110" : "border-gray-200"}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
