import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerPlayer } from "../api/player";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [race, setRace]         = useState("HUMAN");
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await registerPlayer({ username, email, password, race });
      nav("/login");
    } catch {
      setErr("Falha a criar conta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl backdrop-blur p-6">
        <h1 className="text-2xl font-bold mb-1">Criar conta</h1>
        <p className="text-sm text-slate-400 mb-4">Escolhe um nome e uma raça.</p>

        {err && (
          <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Username</span>
            <input className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2"
                   value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Email</span>
            <input type="email" className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2"
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Password</span>
            <input type="password" className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Raça</span>
            <select className="w-full rounded-lg bg-neutral-800 border border-white/10 px-3 py-2"
                    value={race} onChange={(e) => setRace(e.target.value)}>
              <option value="HUMAN">Human</option>
              <option value="ELF">Elf</option>
              <option value="ORC">Orc</option>
              <option value="DWARF">Dwarf</option>
              <option value="UNDEAD">Undead</option>
            </select>
          </label>
          <button type="submit" disabled={busy}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2">
            {busy ? "A criar…" : "Criar conta"}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-400">
          Já tens conta? <Link to="/login" className="text-slate-200 underline">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
