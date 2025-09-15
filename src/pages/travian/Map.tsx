/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import AdminMap, { type Tile } from "../../components/AdminMap";
import type { Village } from "../../types";
import { getWorldMap } from "../../api/api";

type Ctx = {
  villages: Village[];
  mainVillage?: Village;
  activeVillage?: Village;
};

export default function MapView() {
  const { activeVillage } = useOutletContext<Ctx>();
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getWorldMap()
      .then((data) =>
        setTiles(
          data.map((t: any) => ({
            x: t.x,
            y: t.y,
            type: t.type.toLowerCase() as Tile["type"],
            owner: t.playerName,
            name: t.name,
            resourceType: t.resourceType ?? undefined,
          }))
        )
      )
      .catch((err) => {
        console.error("Erro a carregar tiles:", err);
        setError("Falha ao carregar o mapa. Tenta mais tarde.");
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedTile = sel
    ? tiles.find((tt) => tt.x === sel.x && tt.y === sel.y)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      {/* mapa */}
      <section className="rounded-xl border border-white/10 bg-neutral-900 p-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh] text-slate-400">
            A carregar mapa…
          </div>
        ) : error ? (
          <div className="text-red-400 text-center p-4">{error}</div>
        ) : (
          <AdminMap
            tiles={tiles}
            size={100}
            onSelect={(x, y) => setSel({ x, y })}
            center={
              activeVillage
                ? { x: activeVillage.x, y: activeVillage.y }
                : undefined
            }
          />
        )}
      </section>

      {/* detalhes */}
      <aside className="rounded-xl border border-white/10 bg-neutral-900 p-4">
        <h3 className="font-semibold mb-2">Tile</h3>
        {!sel && (
          <div className="text-sm text-slate-400">
            Clica num tile no mapa…
          </div>
        )}

        {sel && !selectedTile && (
          <div className="text-sm text-slate-400">
            Coordenadas: ({sel.x},{sel.y}) • vazio
          </div>
        )}

        {selectedTile && (
          <div className="text-sm text-slate-300 space-y-1">
            <div>
              <strong>Coords:</strong> ({selectedTile.x},{selectedTile.y})
            </div>
            <div>
              <strong>Type:</strong> {selectedTile.type}
            </div>
            {selectedTile.resourceType && (
              <div>
                <strong>Resource:</strong> {selectedTile.resourceType}
              </div>
            )}
            {selectedTile.name && (
              <div>
                <strong>Name:</strong> {selectedTile.name}
              </div>
            )}
            {selectedTile.owner && (
              <div>
                <strong>Owner:</strong> {selectedTile.owner}
              </div>
            )}

            {/* futuras ações */}
            {selectedTile.type === "village" && (
              <div className="pt-2 flex gap-2">
                <button className="btn-xs bg-red-600 hover:bg-red-700 rounded text-white">
                  Atacar
                </button>
                <button className="btn-xs bg-blue-600 hover:bg-blue-700 rounded text-white">
                  Espiar
                </button>
              </div>
            )}
            {selectedTile.type === "resource" && (
              <div className="pt-2">
                <button className="btn-xs bg-emerald-600 hover:bg-emerald-700 rounded text-white">
                  Colonizar
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
