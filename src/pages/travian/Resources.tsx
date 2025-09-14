import { useOutletContext } from "react-router-dom";
import type { Village } from "../../types";

type Ctx = { villages: Village[]; mainVillage?: Village };

export default function ResourcesView() {
  const { mainVillage } = useOutletContext<Ctx>();

  const r = mainVillage?.resourceAmounts;

  const cards = [
    { key: "wood",   name: "Bosque",    emoji: "🌲", amount: r?.wood ?? 0 },
    { key: "food",   name: "Fazendas",  emoji: "🌾", amount: r?.food ?? 0 },
    { key: "stone",  name: "Pedreiras", emoji: "🪨", amount: r?.stone ?? 0 },
    { key: "gold",   name: "Mina de Ouro", emoji: "⛏️", amount: r?.gold ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <section key={c.key} className="rounded-xl border border-white/10 bg-neutral-900 p-4">
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
            className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700"
            onClick={() => alert("TODO: ligar ao endpoint de upgrade de edifício")}
          >
            Subir Nível
          </button>
        </section>
      ))}
    </div>
  );
}
