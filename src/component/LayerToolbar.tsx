import { useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";

export default function LayerToolbar() {
  const addLayer = useEditorStore((state) => state.addLayer);
  const layers = useEditorStore((state) => state.layers);
  const isPreview = useEditorStore((state) => state.isPreview);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTextLayer = () => {
    addLayer({
      id: crypto.randomUUID(),
      type: "text",
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      rotation: 0,
      zIndex: layers.length + 1,
      content: "Layer Text",
      color: "#000000",
      fontWeight: "normal",
      fontSize: "16px",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // 임시 url
    const imageUrl = URL.createObjectURL(file);

    addLayer({
      id: crypto.randomUUID(),
      type: "image",
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      rotation: 0,
      zIndex: layers.length + 1,
      src: imageUrl,
      blendMode: "multiply",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isPreview) {
    return null;
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAddTextLayer}
        className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
      >
        +텍스트
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-5"
      >
        +이미지
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg, image/jpg"
        className="hidden"
      />
    </div>
  );
}
