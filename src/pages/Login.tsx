/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc.state?.from?.pathname ?? "/resources";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(username, password);
      nav(from, { replace: true });
    } catch {
      setErr("Credenciais inválidas");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-950 text-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl backdrop-blur p-6">
        <h1 className="text-2xl font-bold mb-1">Entrar no Babel</h1>
        <p className="text-sm text-slate-400 mb-4">Usa a tua conta para continuar.</p>

        {err && (
          <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Username</span>
            <input
              className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:border-blue-500 text-slate-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="shadowknight"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Password</span>
            <input
              type="password"
              className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:border-blue-500 text-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={!username || !password || loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-2 font-medium"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-400">
          Não tens conta? <Link to="/register" className="text-slate-200 underline">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
