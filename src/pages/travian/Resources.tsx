import { useOutletContext } from "react-router-dom";
import type { TravianOutletCtx } from "../../layout/TravianShell";
import { useMemo } from "react";
import { useBuildingUpgrade } from "../../hooks/useBuildingUpgrade";

const ICON: Record<string, string> = {
  SAWMILL: "🪵",
  CLAY_PIT: "🧱",
  IRON_MINE: "⛏️",
  FARM: "🌾",
};

export default function ResourcesView() {
  const { activeVillage, reloadVillages } = useOutletContext<TravianOutletCtx>();
  const { onUpgrade, getQueueEta, canAfford } = useBuildingUpgrade(
    activeVillage,
    reloadVillages
  );

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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Recursos</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buildings.map((b) => {
          const eta = getQueueEta(b.id, (b as any).queuedUntil);
          const isQueued = !!eta;

          // custo dummy do próximo nível (exemplo)
          const nextLevelCost = {
            wood: (b.level + 1) * 50,
            stone: (b.level + 1) * 30,
            food: (b.level + 1) * 20,
            gold: (b.level + 1) * 10,
          };

          const affordable = canAfford(nextLevelCost);

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
                disabled={isQueued || !affordable}
                className={`rounded px-3 py-1 text-sm ${
                  affordable
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 cursor-not-allowed"
                } disabled:opacity-60`}
                onClick={() => onUpgrade(b.type, b.id)}
              >
                {isQueued ? "Na fila" : affordable ? "Upgrade" : "Recursos insuficientes"}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Painel rápido de recursos */}
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
