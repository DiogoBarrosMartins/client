import { useOutletContext } from "react-router-dom";
import type { Village } from "../../types";
import { upgradeBuilding } from "../../api/api";
import { useState } from "react";

type Ctx = { villages: Village[]; mainVillage?: Village };

const RESOURCE_TO_BUILDING: Record<string, string> = {
  wood: "SAWMILL",
  food: "FARM",
  stone: "CLAY_PIT",
  gold: "IRON_MINE",
};

export default function ResourcesView() {
  const { mainVillage } = useOutletContext<Ctx>();
  const [loading, setLoading] = useState<string | null>(null);

  if (!mainVillage) return <p>Sem aldeias.</p>;

  const r = mainVillage.resourceAmounts;

  const cards = [
    { key: "wood",   name: "Bosque",     emoji: "🌲", amount: r?.wood ?? 0 },
    { key: "food",   name: "Fazendas",   emoji: "🌾", amount: r?.food ?? 0 },
    { key: "stone",  name: "Pedreiras",  emoji: "🪨", amount: r?.stone ?? 0 },
    { key: "gold",   name: "Mina de Ouro", emoji: "⛏️", amount: r?.gold ?? 0 },
  ];

  async function handleUpgrade(resourceKey: string) {
    try {
      const buildingType = RESOURCE_TO_BUILDING[resourceKey];
      if (!buildingType) throw new Error("Edifício não mapeado para recurso");

      setLoading(resourceKey);

      await upgradeBuilding(mainVillage.id, buildingType);

      alert(`${buildingType} em upgrade!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha no upgrade");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <section
          key={c.key}
          className="rounded-xl border border-white/10 bg-neutral-900 p-4"
        >
          <header className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">
              {c.emoji} {c.name}
            </h2>
            <span className="text-sm text-slate-300">{c.amount}</span>
          </header>
          <p className="text-xs text-slate-400 mb-3">
            Produção e upgrades dos campos de {c.name.toLowerCase()}.
          </p>
          <button
            disabled={loading === c.key}
            className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-50"
            onClick={() => handleUpgrade(c.key)}
          >
            {loading === c.key ? "A subir..." : "Subir Nível"}
          </button>
        </section>
      ))}
    </div>
  );
}
