import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/apiClient";

const rules = [
  { label: "8자 이상", test: (p: string) => p.length >= 8 },
  { label: "영문 대문자 포함", test: (p: string) => /[A-Z]/.test(p) },
  { label: "특수문자 포함", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const checkedRules = rules.map((r) => ({ ...r, pass: r.test(password) }));
  const allRulesPass = checkedRules.every((r) => r.pass);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const isValid = allRulesPass && passwordsMatch;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", { email, password });
      navigate("/login", { replace: true });
    } catch {
      setError("이미 사용 중인 이메일이거나 오류가 발생했습니다.");
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
            {/* Email */}
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

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="border-b border-zinc-300 py-2 text-zinc-900 outline-none focus:border-zinc-900 transition-colors bg-transparent"
                  placeholder="••••••••"
                />
              </div>

              {/* Password rules */}
              {password.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {checkedRules.map((r) => (
                    <li
                      key={r.label}
                      className={`text-xs flex items-center gap-1.5 ${
                        r.pass ? "text-green-500" : "text-zinc-400"
                      }`}
                    >
                      <span>{r.pass ? "✓" : "✗"}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 uppercase tracking-widest">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className={`border-b py-2 text-zinc-900 outline-none transition-colors bg-transparent ${
                  confirm.length === 0
                    ? "border-zinc-300 focus:border-zinc-900"
                    : passwordsMatch
                    ? "border-green-400"
                    : "border-red-400"
                }`}
                placeholder="••••••••"
              />
              {confirm.length > 0 && (
                <p
                  className={`text-xs ${
                    passwordsMatch ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordsMatch
                    ? "비밀번호가 일치합니다"
                    : "비밀번호가 일치하지 않습니다"}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-2.5 bg-zinc-900 text-white text-sm tracking-wide hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors text-center"
            >
              Already have an account? Sign In →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
