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
      <BasicButton
        onClick={handleSave}
        disabled={isSaving}
        className="hover:bg-indigo-600"
        text={isSaving ? "Saving to storage" : "Share"}
      />
    </div>
  );
}
