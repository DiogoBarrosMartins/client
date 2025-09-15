import { useOutletContext } from "react-router-dom";
import type { TravianOutletCtx } from "../../layout/TravianShell";
import { useState, useMemo } from "react";
import TroopsPanel from "../../components/TroopsPanel";
import { useBuildingUpgrade } from "../../hooks/useBuildingUpgrade";

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

type BuildQueueInfo = { queuedUntil?: string | null };

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

function formatMs(ms: number) {
  if (ms <= 0) return "terminado";
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${hrs}h ${min}m ${sec}s`;
}

export default function VillageView() {
  const { activeVillage, reloadVillages } = useOutletContext<TravianOutletCtx>();
  const { onUpgrade, getQueueEta } = useBuildingUpgrade(activeVillage, reloadVillages);
  const [localQueued] = useState<Record<string, string>>({});

  const v = activeVillage;
  const buildings = useMemo(() => v?.buildings ?? [], [v?.buildings]);

  const sortedBuildings = useMemo(() => {
    return [...buildings].sort(sortBuildings);
  }, [buildings]);

  const queue = useMemo(() => {
    return buildings
      .map((b) => {
        const eta = getQueueEta(b.id, (b as any as BuildQueueInfo).queuedUntil);
        return eta ? { b, eta } : null;
      })
      .filter(Boolean) as Array<{ b: typeof buildings[number]; eta: string }>;
  }, [buildings, localQueued]);

  if (!v) return <p>Sem aldeias.</p>;
  if (buildings.length === 0) return <p>Sem dados de edifícios ainda.</p>;

  const resources = sortedBuildings.filter((b) =>
    ["SAWMILL", "CLAY_PIT", "IRON_MINE", "FARM"].includes(b.type)
  );
  const military = sortedBuildings.filter((b) =>
    ["BARRACKS", "STABLE", "WORKSHOP", "SMITHY", "WALL", "TOWER"].includes(b.type)
  );
  const others = sortedBuildings.filter(
    (b) => ![...resources, ...military].some((x) => x.id === b.id)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{v.name}</h1>

      {/* Fila */}
      {queue.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-3">
          <h2 className="font-medium mb-2">Fila de construção</h2>
          <ul className="text-sm space-y-2">
            {queue.map(({ b, eta }) => {
              const end = new Date(eta).getTime();
              const remaining = end - Date.now();
              const duration = 60_000; // dummy 1 min
              const progress = Math.max(0, 100 - (remaining / duration) * 100);

              return (
                <li key={b.id}>
                  <div className="flex justify-between">
                    <span>
                      {ICON[b.type] ?? "🏗️"} {b.name} → nível {b.level + 1}
                    </span>
                    <span className="text-amber-300">{formatMs(remaining)}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded mt-1">
                    <div
                      className="h-1 bg-amber-400 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Categorias */}
      <Section title="Recursos" buildings={resources} onUpgrade={onUpgrade} getQueueEta={getQueueEta} />
      <Section title="Militares" buildings={military} onUpgrade={onUpgrade} getQueueEta={getQueueEta} />
      <Section title="Outros edifícios" buildings={others} onUpgrade={onUpgrade} getQueueEta={getQueueEta} />

      <TroopsPanel troops={v.troops ?? []} training={v.trainingTasks ?? []} />
    </div>
  );
}

function Section({
  title,
  buildings,
  onUpgrade,
  getQueueEta,
}: {
  title: string;
  buildings: any[];
  onUpgrade: (type: string, buildingId: string) => void;
  getQueueEta: (id: string, queuedUntil?: string | null) => string | null;
}) {
  return (
    <section>
      <h2 className="font-medium mb-2">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {buildings.map((b) => {
          const eta = getQueueEta(b.id, (b as any).queuedUntil);
          const isQueued = !!eta;

          return (
            <li key={b.id} className="rounded-lg border border-white/10 bg-neutral-900/60 p-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ICON[b.type] ?? "🏗️"}</span>
                  <span className="font-medium">{b.name}</span>
                </div>
                <span className="text-sm text-slate-300">Nível {b.level}</span>
              </div>
              {isQueued && (
                <p className="text-xs text-amber-300">
                  ⏳ até {new Date(eta!).toLocaleTimeString()}
                </p>
              )}
              <button
                disabled={isQueued}
                onClick={() => onUpgrade(b.type, b.id)}
                className="mt-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1 text-sm"
              >
                {isQueued ? "Na fila" : "Upgrade"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
