import { useOutletContext } from "react-router-dom";
import type { TravianOutletCtx } from "../../layout/TravianShell";
import { useMemo } from "react";
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

type BuildQueueInfo = {
  status?: "idle" | "queued" | "in_progress";
  queuedUntil?: string | null;
};

function formatMs(ms: number) {
  if (ms <= 0) return "terminado";
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${hrs}h ${min}m ${sec}s`;
}

// -----------------
// Item da fila
// -----------------
function QueueItem({
  b,
  eta,
}: {
  b: { id: string; name: string; type: string; level: number };
  eta: string;
}) {
  const end = new Date(eta).getTime();
  const remaining = end - Date.now();
  const duration = 60 * 1000; // placeholder → ideal: vir do backend
  const progress = Math.max(0, 100 - (remaining / duration) * 100);

  return (
    <li>
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
}

// -----------------
// Item de edifício
// -----------------
function BuildingCard({
  b,
  eta,
  onUpgrade,
}: {
  b: { id: string; name: string; type: string; level: number; queuedUntil?: string | null };
  eta: string | null;
  onUpgrade: (type: string, id: string) => void;
}) {
  const isQueued = !!eta;

  return (
    <li className="rounded-lg border border-white/10 bg-neutral-900/60 p-3">
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
}

// -----------------
// Componente principal
// -----------------
export default function VillageView() {
  const { activeVillage, reloadVillages } = useOutletContext<TravianOutletCtx>();
  const { onUpgrade, getQueueEta } = useBuildingUpgrade(activeVillage, reloadVillages);

  if (!activeVillage) return <p>Sem aldeias.</p>;
  const buildings = activeVillage.buildings ?? [];

  // Categorias
  const resources = buildings.filter((b) =>
    ["SAWMILL", "CLAY_PIT", "IRON_MINE", "FARM"].includes(b.type)
  );
  const military = buildings.filter((b) =>
    ["BARRACKS", "STABLE", "WORKSHOP", "SMITHY", "WALL", "TOWER"].includes(b.type)
  );
  const others = buildings.filter(
    (b) => ![...resources, ...military].some((x) => x.id === b.id)
  );

  // Queue ordenada
  const queue = useMemo(() => {
    return buildings
      .map((b) => {
        const eta = getQueueEta(b.id, (b as BuildQueueInfo).queuedUntil);
        return eta ? { b, eta } : null;
      })
      .filter(Boolean) as Array<{ b: typeof buildings[number]; eta: string }>;
  }, [buildings, getQueueEta]);

  queue.sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());

  if (buildings.length === 0) return <p>Sem dados de edifícios ainda.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{activeVillage.name}</h1>

      {queue.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-3">
          <h2 className="font-medium mb-2">Fila de construção</h2>
          <ul className="text-sm space-y-2">
            {queue.map(({ b, eta }) => (
              <QueueItem key={b.id} b={b} eta={eta} />
            ))}
          </ul>
        </div>
      )}

      <section>
        <h2 className="font-medium mb-2">Recursos</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((b) => (
            <BuildingCard
              key={b.id}
              b={b}
              eta={getQueueEta(b.id, (b as BuildQueueInfo).queuedUntil)}
              onUpgrade={onUpgrade}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium mb-2">Militares</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {military.map((b) => (
            <BuildingCard
              key={b.id}
              b={b}
              eta={getQueueEta(b.id, (b as BuildQueueInfo).queuedUntil)}
              onUpgrade={onUpgrade}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium mb-2">Outros edifícios</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((b) => (
            <BuildingCard
              key={b.id}
              b={b}
              eta={getQueueEta(b.id, (b as BuildQueueInfo).queuedUntil)}
              onUpgrade={onUpgrade}
            />
          ))}
        </ul>
      </section>

      <TroopsPanel troops={activeVillage.troops ?? []} training={activeVillage.trainingTasks ?? []} />
    </div>
  );
}
