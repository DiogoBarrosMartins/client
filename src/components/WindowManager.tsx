/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import Window from "./Window";
import AdminMap from "./AdminMap";
import { trainTroops, getTroopDefinitions, getVillagesByPlayer } from "../api/api";
import type { Village } from "../types";
import { useAuth } from "../features/auth/AuthContext";

type UnitOption = { value: string; label: string };

export default function WindowManager() {
  const { user } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [busyVillageId, setBusyVillageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unitOptions, setUnitOptions] = useState<Record<string, UnitOption[]>>(
    {}
  );

  const refreshVillages = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const v = await getVillagesByPlayer(user.id);
      setVillages(v);

      // buscar defs para cada village
      const defs: Record<string, UnitOption[]> = {};
      for (const vill of v) {
        try {
          const resp = await getTroopDefinitions(vill.id);
          defs[vill.id] = resp.troops.map((t: any) => ({
            value: t.id,   // ✅ usa o ID (ex: "human_swordsman")
            label: t.name, // ex: "Swordsman"
          }));
        } catch {
          defs[vill.id] = [];
        }
      }
      setUnitOptions(defs);
    } catch {
      setError("Falha a carregar aldeias");
    }
  }, [user?.id]);

  useEffect(() => {
    refreshVillages();
  }, [refreshVillages]);

  async function handleTrain(
    villageId: string,
    unitType: string,
    count: number
  ) {
    setBusyVillageId(villageId);
    try {
      await trainTroops(villageId, unitType, count);
      await refreshVillages();
    } catch {
      setError("Training failed");
    } finally {
      setBusyVillageId(null);
    }
  }

  return (
    <div className="container-page">
      {error && (
        <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Window title="My Villages">
          <ul className="space-y-2">
            {villages.map((v) => (
              <li key={v.id} className="rounded-lg bg-neutral-800/60 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-slate-400">
                      ({v.x},{v.y}) · {v.playerName ?? "—"} · {v.race}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    🌾 {v.resourceAmounts.food}
                    <br />
                    🪵 {v.resourceAmounts.wood}
                    <br />
                    🪨 {v.resourceAmounts.stone}
                    <br />
                    🪙 {v.resourceAmounts.gold}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Window>

        <Window title="Train Troops">
          {villages.map((v) => (
            <form
              key={v.id}
              className="mb-3 grid grid-cols-1 gap-2 rounded-lg bg-neutral-800/60 p-2 last:mb-0"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const troopType = fd.get("unitType") as string;
                const count = Number(fd.get("count") || 0);
                if (!count || count < 1) return;
                handleTrain(v.id, troopType, count);
              }}
            >
              <div className="font-medium">{v.name}</div>
              <label className="text-xs">
                <span className="mb-1 block text-slate-300">Unit Type</span>
                <select name="unitType">
                  {(unitOptions[v.id] ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-slate-300">Count</span>
                <input name="count" type="number" min={1} defaultValue={10} />
              </label>
              <button
                disabled={busyVillageId === v.id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {busyVillageId === v.id ? "Training…" : "Train"}
              </button>
            </form>
          ))}
        </Window>

        <div className="md:col-span-2">
          <Window title="Admin Map">
            <AdminMap
              tiles={villages.map((v) => ({
                x: v.x,
                y: v.y,
                type: "village" as const,
                owner: v.playerName,
                name: v.name,
              }))}
              size={60}
            />
          </Window>
        </div>
      </div>
    </div>
  );
}
