import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import AdminMap, { type Tile } from "../../components/AdminMap"; // 👈 usar import type
import type { Village } from "../../types";

// contexto vindo do TravianShell
type Ctx = {
  villages: Village[];
  mainVillage?: Village;
  activeVillage?: Village;
};

// resposta crua do backend
interface RawTile {
  x: number;
  y: number;
  type: string; // backend manda "VILLAGE", "OUTPOST", etc.
  playerName?: string;
  name?: string;
}

export default function MapView() {
  const { activeVillage } = useOutletContext<Ctx>();
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    fetch("/api/world/map")
      .then((res) => res.json())
      .then((data: RawTile[]) =>
        data.map<Tile>((t) => ({
          x: t.x,
          y: t.y,
          type: t.type.toLowerCase() as Tile["type"], // 👈 cast seguro
          owner: t.playerName,
          name: t.name,
        }))
      )
      .then(setTiles)
      .catch((err) => console.error("Erro a carregar tiles:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      {/* mapa */}
      <section className="rounded-xl border border-white/10 bg-neutral-900 p-4 overflow-hidden">
        <AdminMap
          tiles={tiles}
          size={100} // deve corresponder ao WORLD_SIZE do backend
          onSelect={(x, y) => setSel({ x, y })}
          center={
            activeVillage
              ? { x: activeVillage.x, y: activeVillage.y }
              : undefined
          }
        />
      </section>

      {/* detalhes do tile */}
      <aside className="rounded-xl border border-white/10 bg-neutral-900 p-4">
        <h3 className="font-semibold mb-2">Tile</h3>
        {sel ? (
          (() => {
            const t = tiles.find((tt) => tt.x === sel.x && tt.y === sel.y);
            return t ? (
              <div className="text-sm text-slate-300 space-y-1">
                <div>
                  <strong>Coords:</strong> ({t.x},{t.y})
                </div>
                <div>
                  <strong>Type:</strong> {t.type}
                </div>
                {t.name && (
                  <div>
                    <strong>Name:</strong> {t.name}
                  </div>
                )}
                {t.owner && (
                  <div>
                    <strong>Owner:</strong> {t.owner}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                Coordenadas: ({sel.x},{sel.y}) • vazio
              </div>
            );
          })()
        ) : (
          <div className="text-sm text-slate-400">
            Clica num tile no mapa…
          </div>
        )}
      </aside>
    </div>
  );
}
