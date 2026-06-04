import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../store/useAuthStore";

export default function LogoutButton() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // 서버 측 세션 무효화(Redis RT 삭제 + invalidate_before 갱신 + 쿠키 삭제)
      await apiClient.post("/auth/logout");
    } catch {
      // 서버 무효화 실패해도 로컬 정리는 진행
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-gray-300 font-light text-[12px] border-transparent rounded-xl shadow-sm transition duration-200 hover:ring-1 hover:ring-gray-500 disabled:opacity-40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
