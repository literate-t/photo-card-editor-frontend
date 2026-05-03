import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";

export default function SaveButton() {
  const saveCard = useEditorStore((state) => state.saveCard);
  const isSaving = useEditorStore((state) => state.isSaving);
  const [url, setUrl] = useState<string | null>(null);

  const handleSave = async () => {
    const uuid = await saveCard(); // 백엔드에서 내려주는 uuid(v7)

    if (uuid) {
      setUrl(`${window.location.origin}/card/${uuid}`);
    } else {
      alert("카드 저장 실패");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-4 py-2 font-semibold text-white bg-green-600 rounded shadow hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSaving ? "클라우드에 저장 중" : "저장 및 공유"}
      </button>
      {url && (
        <div className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded select-all">
          <span className="font-bold text-gray-700 mr-2">링크:</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-600 underline"
          >
            {url}
          </a>
        </div>
      )}
    </div>
  );
}
