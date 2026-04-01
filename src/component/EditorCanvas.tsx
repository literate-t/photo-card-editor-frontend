import { useEditorStore } from "../store/useEditorStore";
import LayerComponent from "./LayerComponent";

export default function EditorCanvas() {
  const layers = useEditorStore((state) => state.layers);
  const setSelectedLayer = useEditorStore((state) => state.setSelectedLayer);

  return (
    <>
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
