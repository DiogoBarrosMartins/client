import { useOutletContext } from "react-router-dom";
import type { TravianOutletCtx } from "../../layout/TravianShell";
import { upgradeBuilding } from "../../api/api";
import { useState, useMemo } from "react";
import TroopsPanel from "../../components/TroopsPanel";

const ICON: Record<string, string> = {
  SAWMILL: "🪵",
  CLAY_PIT: "🧱",
  IRON_MINE: "⛏️",
  FARM: "🌾",
  WAREHOUSE: "📦",
  GRANARY: "🥖",
  MARKET: "🛒",
  BARRACKS: "⚔️",
  STABLE: "🏇",
  WORKSHOP: "🏗️",
  WALL: "🧱",
  TOWER: "🗼",
  SMITHY: "⚒️",
  EMBASSY: "🏛️",
  ACADEMY: "🎓",
  SHRINE: "⛩️",
};

type BuildQueueInfo = {
  status?: "idle" | "queued" | "in_progress";
  queuedUntil?: string | null;
};

const BUILDING_ORDER: string[] = [
  "SAWMILL",
  "CLAY_PIT",
  "IRON_MINE",
  "FARM",
  "WAREHOUSE",
  "GRANARY",
  "MARKET",
  "EMBASSY",
  "BARRACKS",
  "STABLE",
  "WORKSHOP",
  "SMITHY",
  "WALL",
  "TOWER",
  "ACADEMY",
  "SHRINE",
];

function sortBuildings(a: { type: string; name: string }, b: { type: string; name: string }) {
  const ai = BUILDING_ORDER.indexOf(a.type);
  const bi = BUILDING_ORDER.indexOf(b.type);
  if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}

export default function VillageView() {
  const { activeVillage } = useOutletContext<TravianOutletCtx>();
  const [localQueued, setLocalQueued] = useState<Record<string, string>>({});

  const v = activeVillage;

  const buildings = useMemo(() => v?.buildings ?? [], [v?.buildings]);

  const sortedBuildings = useMemo(() => {
    return [...buildings].sort(sortBuildings);
  }, [buildings]);

  const queue = useMemo(() => {
    return buildings
      .map((b) => {
        const q = b as unknown as BuildQueueInfo;
        const localEta = localQueued[b.id];
        const eta = localEta ?? q.queuedUntil ?? null;
        return eta ? { b, eta } : null;
      })
      .filter(Boolean) as Array<{ b: typeof buildings[number]; eta: string }>;
  }, [buildings, localQueued]);

  queue.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());

  if (!v) return <p>Sem aldeias.</p>;
  if (buildings.length === 0) return <p>Sem dados de edifícios ainda.</p>;

  async function onUpgrade(type: string, buildingId: string) {
    try {
      const res = await upgradeBuilding(v!.id, type);
      setLocalQueued((m) => ({ ...m, [buildingId]: res.finishAt }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upgrade failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{v.name}</h1>

      {queue.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-3">
          <h2 className="font-medium mb-2">Fila de construção</h2>
          <ul className="text-sm space-y-1">
            {queue.map(({ b, eta }) => (
              <li key={b.id} className="flex items-center justify-between">
                <span>{ICON[b.type] ?? "🏗️"} {b.name}</span>
                <span className="text-slate-300">
                  até {new Date(eta).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedBuildings.map((b) => {
          const q = b as unknown as BuildQueueInfo;
          const localEta = localQueued[b.id];
          const eta = localEta ?? q.queuedUntil ?? null;
          const isQueued = !!eta;

          return (
            <li
              key={b.id}
              className="rounded-lg border border-white/10 bg-neutral-900/60 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ICON[b.type] ?? "🏗️"}</span>
                  <span className="font-medium">{b.name}</span>
                </div>
                <span className="text-sm text-slate-300">Nível {b.level}</span>
              </div>

              <div className="text-xs text-slate-400 mb-2">
                Tipo: <code className="opacity-80">{b.type}</code>
                {isQueued && (
                  <span className="ml-2 text-amber-300">
                    • a construir até {new Date(eta!).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <button
                disabled={isQueued}
                onClick={() => onUpgrade(b.type, b.id)}
                className="rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1 text-sm"
              >
                {isQueued ? "Em fila" : "Upgrade"}
              </button>
            </li>
          );
        })}
      </ul>

      <TroopsPanel troops={v.troops ?? []} training={v.trainingTasks ?? []} />
    </div>
  );
}
