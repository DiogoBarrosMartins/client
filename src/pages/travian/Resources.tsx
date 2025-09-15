import { useOutletContext } from "react-router-dom";
import type { TravianOutletCtx } from "../../layout/TravianShell";
import { upgradeBuilding } from "../../api/api";
import { useState, useMemo } from "react";

const ICON: Record<string, string> = {
  SAWMILL: "🪵",
  CLAY_PIT: "🧱",
  IRON_MINE: "⛏️",
  FARM: "🌾",
};

type BuildQueueInfo = {
  status?: "idle" | "queued" | "in_progress";
  queuedUntil?: string | null;
};

export default function ResourcesView() {
  const { activeVillage, reloadVillages } = useOutletContext<TravianOutletCtx>();
  const [localQueued, setLocalQueued] = useState<Record<string, string>>({});

  if (!activeVillage) return <p>Sem aldeias.</p>;
  const r = activeVillage.resourceAmounts;

  // apenas os edifícios de recurso
  const buildings = useMemo(
    () =>
      (activeVillage.buildings ?? []).filter((b) =>
        ["SAWMILL", "CLAY_PIT", "IRON_MINE", "FARM"].includes(b.type)
      ),
    [activeVillage.buildings]
  );

  async function onUpgrade(type: string, buildingId: string) {
    try {
      const res = await upgradeBuilding(activeVillage!.id, type);
      setLocalQueued((m) => ({ ...m, [buildingId]: res.finishAt }));
      await reloadVillages();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upgrade failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Recursos</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buildings.map((b) => {
          const q = b as unknown as BuildQueueInfo;
          const localEta = localQueued[b.id];
          const eta = localEta ?? q.queuedUntil ?? null;
          const isQueued = !!eta;

          // custo dummy do próximo nível (podes ligar à tua lógica de blueprint)
          const nextLevelCost = {
            wood: (b.level + 1) * 50,
            stone: (b.level + 1) * 30,
            food: (b.level + 1) * 20,
            gold: (b.level + 1) * 10,
          };

          return (
            <li
              key={b.id}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4 flex flex-col justify-between"
            >
              <header className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className="text-2xl">{ICON[b.type]}</span>
                  {b.name}
                </h2>
                <span className="text-sm text-slate-300">Nível {b.level}</span>
              </header>

              <p className="text-xs text-slate-400 mb-2">
                Produção ligada ao campo de {b.type.toLowerCase()}.
              </p>

              <div className="text-xs text-slate-300 mb-2">
                Próximo nível → custo: 🌾 {nextLevelCost.food} 🪵 {nextLevelCost.wood} 🪨{" "}
                {nextLevelCost.stone} 🪙 {nextLevelCost.gold}
              </div>

              {isQueued && (
                <p className="text-xs text-amber-300 mb-2">
                  ⏳ em construção até {new Date(eta!).toLocaleTimeString()}
                </p>
              )}

              <button
                disabled={isQueued}
                className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-60"
                onClick={() => onUpgrade(b.type, b.id)}
              >
                {isQueued ? "Na fila" : "Upgrade"}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <section className="rounded-xl border border-white/10 bg-neutral-900 p-4">
          <h2 className="font-semibold mb-1">🌲 Bosque</h2>
          <span className="text-sm text-slate-300">{r?.wood ?? 0}</span>
        </section>
        <section className="rounded-xl border border-white/10 bg-neutral-900 p-4">
          <h2 className="font-semibold mb-1">🌾 Fazendas</h2>
          <span className="text-sm text-slate-300">{r?.food ?? 0}</span>
        </section>
        <section className="rounded-xl border border-white/10 bg-neutral-900 p-4">
          <h2 className="font-semibold mb-1">🪨 Pedreiras</h2>
          <span className="text-sm text-slate-300">{r?.stone ?? 0}</span>
        </section>
        <section className="rounded-xl border border-white/10 bg-neutral-900 p-4">
          <h2 className="font-semibold mb-1">⛏️ Mina de Ouro</h2>
          <span className="text-sm text-slate-300">{r?.gold ?? 0}</span>
        </section>
      </div>
    </div>
  );
}
