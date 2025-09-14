/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/travian/Rallypoint.tsx
import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { TravianOutletCtx } from "../../layout/TravianShell";
import { trainTroops, getTroopDefinitions } from "../../api/api";
import type { TrainingTask } from "../../types";

type TroopDefinition = {
  id: string;
  type: string;
  name: string;
  tier: string;
  buildingType: string;
  requiredLevel: number;
  unlocked: boolean;
  cost: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
  };
};

// -----------------
// Hook para countdown
// -----------------
function useCountdown(targetTime: number | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!targetTime) return;
    const interval = setInterval(() => {
      setRemaining(Math.max(0, targetTime - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return remaining;
}

function formatMs(ms: number) {
  if (ms <= 0) return "terminado";
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${hrs}h ${min}m ${sec}s`;
}

// -----------------
// Componente principal
// -----------------
export default function Rallypoint() {
  const { activeVillage, reloadVillages } = useOutletContext<TravianOutletCtx>();
  const [definitions, setDefinitions] = useState<TroopDefinition[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // carregar defs
  useEffect(() => {
    if (activeVillage) {
      getTroopDefinitions(activeVillage.id).then((res) => {
        setDefinitions(res.troops as TroopDefinition[]);
      });
    }
  }, [activeVillage]);

  // -----------------
  // Training queue
  // -----------------
  const tasks: TrainingTask[] = activeVillage?.trainingTasks ?? [];

  const totalQueueEnd = useMemo(() => {
    if (!tasks.length) return null;
    const last = tasks[tasks.length - 1];
    return last?.endTime ? new Date(last.endTime).getTime() : null;
  }, [tasks]);

  const remaining = useCountdown(totalQueueEnd);

  async function handleTrain(type: string, count: number, def: TroopDefinition) {
    try {
      const res = activeVillage?.resourceAmounts;
      if (!res) return;

      const maxByFood = def.cost.food > 0 ? Math.floor(res.food / def.cost.food) : Infinity;
      const maxByWood = def.cost.wood > 0 ? Math.floor(res.wood / def.cost.wood) : Infinity;
      const maxByStone = def.cost.stone > 0 ? Math.floor(res.stone / def.cost.stone) : Infinity;
      const maxByGold = def.cost.gold > 0 ? Math.floor(res.gold / def.cost.gold) : Infinity;

      const maxTrainable = Math.min(maxByFood, maxByWood, maxByStone, maxByGold);

      if (count > maxTrainable) {
        count = maxTrainable;
        setCounts((prev) => ({ ...prev, [def.id]: count }));
      }

      if (count <= 0) {
        alert("Recursos insuficientes!");
        return;
      }

      console.log("👉 handleTrain ajustado:", { type, count, maxTrainable });

      await trainTroops(activeVillage!.id, type, count);
      await reloadVillages();
    } catch (err) {
      console.error("❌ trainTroops error:", err);
      alert("Falha a treinar tropa");
    }
  }

  if (!activeVillage) return <p>Sem aldeias.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ponto de Reunião</h1>

      <section>
        <h2 className="font-medium">Treinar tropas</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {definitions.map((d) => {
            const count = counts[d.id] ?? 1;

            const res = activeVillage?.resourceAmounts;
            let maxTrainable = Infinity;
            if (res) {
              const maxByFood = d.cost.food > 0 ? Math.floor(res.food / d.cost.food) : Infinity;
              const maxByWood = d.cost.wood > 0 ? Math.floor(res.wood / d.cost.wood) : Infinity;
              const maxByStone = d.cost.stone > 0 ? Math.floor(res.stone / d.cost.stone) : Infinity;
              const maxByGold = d.cost.gold > 0 ? Math.floor(res.gold / d.cost.gold) : Infinity;
              maxTrainable = Math.min(maxByFood, maxByWood, maxByStone, maxByGold);
            }

            const totalCost = {
              food: d.cost.food * count,
              wood: d.cost.wood * count,
              stone: d.cost.stone * count,
              gold: d.cost.gold * count,
            };

            return (
              <li key={d.id} className="rounded border border-white/10 p-2">
                <div className="flex justify-between">
                  <span>{d.name}</span>
                  <span>
                    {d.buildingType} lvl {d.requiredLevel}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  Custo unitário: 🌾 {d.cost.food} 🪵 {d.cost.wood} 🪨 {d.cost.stone} 🪙 {d.cost.gold}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    value={count}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val > maxTrainable) val = maxTrainable;
                      if (val < 1) val = 1;
                      setCounts((prev) => ({ ...prev, [d.id]: val }));
                    }}
                    className="w-20 rounded bg-neutral-800 border border-white/10 px-1 py-0.5 text-sm"
                  />
                  <span className="text-xs text-slate-400">
                    Total: 🌾 {totalCost.food} 🪵 {totalCost.wood} 🪨 {totalCost.stone} 🪙 {totalCost.gold}
                  </span>
                </div>

                <button
                  disabled={!d.unlocked}
                  onClick={() => handleTrain(d.id, count, d)}
                  className="mt-1 rounded bg-green-600 px-2 py-1 text-sm disabled:opacity-50"
                >
                  {d.unlocked ? "Treinar" : "Bloqueado"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-medium mt-4">Fila de treino</h2>

        {totalQueueEnd && (
          <div className="mb-2 text-sm text-slate-300">
            Queue termina em: {formatMs(remaining)}
          </div>
        )}

        <ul className="space-y-1">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex justify-between rounded border border-white/10 px-2 py-1 text-sm"
            >
              <span>
                {t.count}x {t.troopType}
              </span>
              <span>{t.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
