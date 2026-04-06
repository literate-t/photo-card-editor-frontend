import { useRef } from "react";
import { useEditorStore, type Layer } from "../store/useEditorStore";
import LayerComponent from "./LayerComponent";

export default function EditorCanvas() {
  const layers = useEditorStore((state) => state.layers);
  const setSelectedLayer = useEditorStore((state) => state.setSelectedLayer);
  const addLayer = useEditorStore((state) => state.addLayer);
  const idRef = useRef<number>(0);

  return (
    <>
      <button
        className="bg-yellow-200"
        onClick={() => {
          const newLayer: Layer = {
            id: `id_${idRef.current++}`,
            content: "LAYER",
            type: "text",
            width: 100,
            height: 100,
            x: 30,
            y: 30,
          };

          addLayer(newLayer);
        }}
      >
        Add Text layer
      </button>
      <button
        className="bg-blue-200"
        onClick={() => {
          const newLayer: Layer = {
            id: `id_${idRef.current++}`,
            type: "image",
            src: "https://picsum.photos/400/400",
            blendMode: "multiply",
            width: 400,
            height: 400,
            x: 100,
            y: 100,
          };

          addLayer(newLayer);
        }}
      >
        Add Image layer
      </button>
      <div
        className="relative w-full h-full bg-white overflow-hidden"
        onMouseDown={() => setSelectedLayer(null)}
      >
        {layers.map((layer) => (
          <LayerComponent key={layer.id} layerId={layer.id} />
        ))}
      </div>
    </>
  );
}
