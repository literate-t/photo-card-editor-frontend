import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Card3DContainer from "../component/Card3DContainer";
import LayerComponent from "../component/LayerComponent";
import { useEditorStore } from "../store/useEditorStore";

export default function CardPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const loadCard = useEditorStore((state) => state.loadCard);
  const layers = useEditorStore((state) => state.layers);
  const isLoading = useEditorStore((state) => state.isLoading);
  const isError = useEditorStore((state) => state.isError);

  useEffect(() => {
    loadCard(uuid as string);
  }, [loadCard, uuid]);

  // error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-content w-full h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">
          카드를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-gray-600">존재하지 않거나 삭제된 링크입니다</p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          새 카드 만들기
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-content w-full h-screen bg-gray-100">
        {/* 3D 컨테이너와 동일한 크기의 스켈레톤 */}
        <div className="w-100 h-150 bg-white rounded-lg shadow-md animate-pulse flex flex-col p-4">
          <div className="w-3/4 h-8  bg-gray-200 rounded" />
          <div className="w-full h-64  bg-gray-200 rounded mt-4" />
          <div className="w-1/2 h-6  bg-gray-200 rounded mt-4" />
        </div>
        <p className="mt-6 text-gray-500 font-medium animate-pulse">
          3D 카드를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-100">
      <Card3DContainer width={400} height={600}>
        <div className="relative w-full h-full overflow-hidden bg-white">
          {layers.map((layer) => (
            <LayerComponent key={layer.id} layerId={layer.id} />
          ))}
        </div>
      </Card3DContainer>
      <Link to="/" className="text-gray-500 underline hover:text-gray-800">
        포토카드 만들러 가기
      </Link>
    </div>
  );
}
