import { useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";
import BasicButton from "./BasicButton";

export default function LayerToolbar() {
  const addLayer = useEditorStore((state) => state.addLayer);
  const layers = useEditorStore((state) => state.layers);
  const isPreview = useEditorStore((state) => state.isPreview);
  const togglePreview = useEditorStore((state) => state.togglePreview);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTextLayer = () => {
    addLayer({
      id: crypto.randomUUID(),
      type: "text",
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      rotation: 0,
      zIndex: layers.length + 1,
      content: "<div>Text</div>",
      color: "#000000",
      fontWeight: "normal",
      fontSize: "14px",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("NO IMAGE");
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
    return (
      <BasicButton
        onClick={(e) => {
          e.stopPropagation();
          togglePreview();
        }}
        className="hover:bg-indigo-600"
        text={isPreview ? "Edit mode" : "Preview"}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <BasicButton onClick={handleAddTextLayer} text="Add text" />
      <BasicButton
        onClick={() => fileInputRef.current?.click()}
        text="Add image"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg, image/jpg"
        className="hidden"
      />
      <BasicButton
        onClick={(e) => {
          e.stopPropagation();
          togglePreview();
        }}
        className="hover:bg-indigo-600"
        text={isPreview ? "Edit mode" : "Preview"}
      />
    </div>
  );
}
