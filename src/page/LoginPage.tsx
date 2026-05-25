import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data } = await apiClient.post<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });
      setAccessToken(data.accessToken);
      navigate("/", { replace: true });
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left panel */}
      <div className="w-1/2 bg-zinc-950 flex items-center justify-center">
        <span className="text-white text-5xl font-light tracking-widest select-none">
          Phocady
        </span>
      </div>

      {/* Right panel */}
      <div className="w-1/2 bg-white flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-80 flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-b border-zinc-300 py-2 text-zinc-900 outline-none focus:border-zinc-900 transition-colors bg-transparent placeholder-zinc-300"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-b border-zinc-300 py-2 text-zinc-900 outline-none focus:border-zinc-900 transition-colors bg-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-zinc-900 text-white text-sm tracking-wide hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-xs text-zinc-300">or</span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full py-2.5 border border-zinc-900 text-zinc-900 text-sm tracking-wide hover:bg-zinc-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
