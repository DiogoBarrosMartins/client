import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import AdminMap from "../../components/AdminMap";
import type { Village } from "../../types";

type Ctx = { villages: Village[]; mainVillage?: Village };

export default function MapView() {
  const { villages } = useOutletContext<Ctx>();
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <section className="rounded-xl border border-white/10 bg-neutral-900 p-4 overflow-auto">
        <AdminMap
          tiles={villages.map((v) => ({
            x: v.x,
            y: v.y,
            type: "village" as const,
            owner: v.name,
            name: v.name,
          }))}
          size={60}
          onSelect={(x, y) => setSel({ x, y })}
        />
      </section>
      <aside className="rounded-xl border border-white/10 bg-neutral-900 p-4">
        <h3 className="font-semibold mb-2">Tile</h3>
        {sel ? (
          <div className="text-sm text-slate-300">Coordenadas: ({sel.x},{sel.y})</div>
        ) : (
          <div className="text-sm text-slate-400">Clica num tile no mapa…</div>
        )}
      </aside>
    </div>
  );
}
