import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import AdminMap from "../../components/AdminMap";
import type { Village } from "../../types";

// Tipo para o contexto vindo do TravianShell
type Ctx = {
  villages: Village[];
  mainVillage?: Village;
  activeVillage?: Village;
};

// Tipo minimal para um tile no mapa
type MapTile = {
  x: number;
  y: number;
  type: "village" | "outpost" | "resource" | "npc";
  owner?: string;
  name?: string;
};

export default function MapView() {
  const { activeVillage } = useOutletContext<Ctx>();
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  const [tiles, setTiles] = useState<MapTile[]>([]);

  useEffect(() => {
    fetch("/api/world/map") // 👈 chama o endpoint novo
      .then((res) => res.json())
      .then(setTiles)
      .catch((err) => console.error("Erro a carregar tiles:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <section className="rounded-xl border border-white/10 bg-neutral-900 p-4 overflow-auto">
       <AdminMap
  tiles={tiles.map((t) => ({
    x: t.x,
    y: t.y,
    type: t.type === "npc" ? "resource" : t.type, // 👈 conversão
    owner: t.owner,
    name: t.name,
  }))}
  size={60}
  onSelect={(x: number, y: number) => setSel({ x, y })}
  center={
    activeVillage
      ? { x: activeVillage.x, y: activeVillage.y }
      : undefined
  }
/>

      </section>
      <aside className="rounded-xl border border-white/10 bg-neutral-900 p-4">
        <h3 className="font-semibold mb-2">Tile</h3>
        {sel ? (
          <div className="text-sm text-slate-300">
            Coordenadas: ({sel.x},{sel.y})
          </div>
        ) : (
          <div className="text-sm text-slate-400">Clica num tile no mapa…</div>
        )}
      </aside>
    </div>
  );
}
