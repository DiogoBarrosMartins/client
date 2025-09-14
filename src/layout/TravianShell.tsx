import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import type { Village } from "../types";
import { useAuth } from "../features/auth/AuthContext";

function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

const STORAGE_ACTIVE_VILLAGE = "activeVillageId";

export type TravianOutletCtx = {
  villages: Village[];
  activeVillage?: Village;
  setActiveVillageId: (id: string) => void;
  reloadVillages: () => Promise<void>;
};

export default function TravianShell() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const villages = user?.villages ?? [];
  const [activeVillageId, setActiveVillageId] = useState<string | undefined>(
    () => localStorage.getItem(STORAGE_ACTIVE_VILLAGE) ?? villages[0]?.id
  );

  const activeVillage = useMemo(
    () => villages.find((v) => v.id === activeVillageId) ?? villages[0],
    [villages, activeVillageId]
  );

  function onSwitchVillage(id: string) {
    setActiveVillageId(id);
    localStorage.setItem(STORAGE_ACTIVE_VILLAGE, id);
  }

  // HUD
  const res = activeVillage?.resourceAmounts ?? {
    food: 0,
    wood: 0,
    stone: 0,
    gold: 0,
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <header className="border-b border-white/10 bg-neutral-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 py-2 flex items-center gap-4">
          <button
            onClick={() => navigate("/resources")}
            className="text-lg font-bold"
          >
            Babel
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="villageSel" className="text-xs text-slate-400">
              Aldeia:
            </label>
            <select
              id="villageSel"
              value={activeVillage?.id ?? ""}
              onChange={(e) => onSwitchVillage(e.target.value)}
              className="rounded bg-neutral-800 border border-white/10 px-2 py-1 text-sm"
              disabled={villages.length === 0}
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.x},{v.y})
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-4 text-sm">
            <span>🌾 {res.food}</span>
            <span>🪵 {res.wood}</span>
            <span>🪨 {res.stone}</span>
            <span>🪙 {res.gold}</span>

            <div className="pl-4 border-l border-white/10 flex items-center gap-2">
              <span className="text-slate-300 text-sm">
                {user?.username ?? "Jogador"}
              </span>
              <button
                onClick={logout}
                className="rounded bg-neutral-800 px-2 py-1 text-sm hover:bg-neutral-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <nav className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-3 py-2 flex gap-2 text-sm">
            <Tab to="/resources" label="Recursos" icon="🌾" />
            <Tab to="/village" label="Aldeia" icon="🏘️" />
            <Tab to="/map" label="Mapa" icon="🗺️" />
            <Tab to="/reports" label="Relatórios" icon="📜" />
            <Tab to="/messages" label="Mensagens" icon="💬" />
            <Tab to="/rally" label="Ponto de Reunião" icon="⚔️" />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet
          context={{
            villages,
            activeVillage,
            setActiveVillageId: onSwitchVillage,
            reloadVillages: refreshUser, // ✅ agora existe
          }}
        />
      </main>
    </div>
  );
}

function Tab({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "rounded-md px-3 py-1 hover:bg-white/10",
          isActive && "bg-white/10 font-semibold"
        )
      }
    >
      <span className="mr-1">{icon}</span>
      {label}
    </NavLink>
  );
}
