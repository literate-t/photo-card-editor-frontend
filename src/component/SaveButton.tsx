import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import BasicButton from "./BasicButton";

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
    <div className="flex flex-col items-center">
      <BasicButton
        onClick={handleSave}
        disabled={isSaving}
        className="hover:bg-indigo-600"
        text={isSaving ? "Saving to storage" : "Share"}
      />
      <div
        className={`grid transition-all duration-700 ease-in-out ${
          url
            ? "grid-rows-[1fr] opacity-100 mt-4"
            : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="font-light text-[12px] rounded select-all">
            <a
              href={url || "#"}
              target="_blank"
              rel="noreferrer noopener"
              className="px-2 py-1 font-light border-transparent rounded-xl text-gray-300 transition duration-200 hover:ring-1 hover:bg-amber-200 hover:text-gray-600"
            >
              {url}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
