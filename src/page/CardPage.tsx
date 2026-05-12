import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card3DContainer from "../component/Card3DContainer";
import LayerComponent from "../component/LayerComponent";
import { useEditorStore } from "../store/useEditorStore";

export default function CardPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const loadCard = useEditorStore((state) => state.loadCard);
  const layers = useEditorStore((state) => state.layers);
  const clearLayers = useEditorStore((state) => state.clearLayers);
  const isLoading = useEditorStore((state) => state.isLoading);
  const isError = useEditorStore((state) => state.isError);
  const navigate = useNavigate();

  useEffect(() => {
    loadCard(uuid as string);
  }, [loadCard, uuid]);

  const handleStartFresh = () => {
    clearLayers();
    navigate("/", { replace: true });
  };

  // error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#2a2b2d]">
        <h1 className="text-2xl font-bold text-gray-100">Card not found.</h1>
        <Link
          to="/"
          className="mt-4 px-4 py-2 text-white bg-indigo-500 rounded-xl hover:bg-blue-700"
        >
          Let's make some photo cards
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#2a2b2d]">
        {/* 3D 컨테이너와 동일한 크기의 스켈레톤 */}
        <div className="w-100 h-150 bg-white rounded-lg shadow-md animate-pulse flex flex-col p-4">
          <div className="w-3/4 h-8  bg-gray-200 rounded" />
          <div className="w-full h-64  bg-gray-200 rounded mt-4" />
          <div className="w-1/2 h-6  bg-gray-200 rounded mt-4" />
        </div>
        <p className="mt-6 text-gray-500 font-medium animate-pulse">
          Loading 3D card...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[#2a2b2d]">
      <Card3DContainer width={400} height={600}>
        <div className="relative w-full h-full overflow-hidden bg-gray-300">
          {layers.map((layer) => (
            <LayerComponent key={layer.id} layerId={layer.id} />
          ))}
        </div>
      </Card3DContainer>
      <button
        onClick={handleStartFresh}
        className="mt-2 text-gray-500 underline hover:text-gray-200"
      >
        Let's make some photo cards
      </button>
    </div>
  );
}
