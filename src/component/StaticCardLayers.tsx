import type { ImageLayer, Layer, TextLayer } from "../store/useEditorStore";

interface StaticCardLayersProps {
  layers: Layer[];
}

export function StaticCardLayers({ layers }: StaticCardLayersProps) {
  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden rounded-2xl">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="absolute pointer-events-none select-none"
          style={{
            transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation || 0}deg)`,
            width: layer.width,
            height: layer.height,
            zIndex: layer.zIndex,
          }}
        >
          {layer.type === "image" ? (
            <img
              src={(layer as ImageLayer).src}
              alt=""
              className="w-full h-full"
              style={{ mixBlendMode: (layer as ImageLayer).blendMode as never }}
            />
          ) : (
            <div
              className="w-full outline-none"
              style={{
                fontSize: (layer as TextLayer).fontSize,
                color: (layer as TextLayer).color,
                fontWeight: (layer as TextLayer).fontWeight,
              }}
              dangerouslySetInnerHTML={{
                __html: (layer as TextLayer).content,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
