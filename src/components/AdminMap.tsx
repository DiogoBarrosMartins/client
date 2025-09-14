import { useMemo, useState } from "react";

export interface Tile {
  x: number;
  y: number;
  type: "village" | "outpost" | "resource";
  owner?: string;
  name?: string;
}

interface AdminMapProps {
  tiles: Tile[];
  size: number;
  onSelect?: (x: number, y: number) => void;
}

export default function AdminMap({ tiles, size, onSelect }: AdminMapProps) {
  const [tilePx, setTilePx] = useState(16);

  const byPos = useMemo(() => {
    const m = new Map<string, Tile>();
    for (const t of tiles) m.set(`${t.x},${t.y}`, t);
    return m;
  }, [tiles]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-600" /> Village
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-rose-600" /> Outpost
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-600" /> Resource
          </span>
        </div>
        <label className="flex items-center gap-2">
          Zoom
          <input type="range" min={10} max={28} value={tilePx} onChange={(e) => setTilePx(Number(e.target.value))} />
        </label>
      </div>

      <div className="card overflow-auto max-w-full max-h-[60vh] p-2">
        <div style={{ width: tilePx * size }}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, ${tilePx}px)` }}>
            {Array.from({ length: size * size }).map((_, i) => {
              const x = i % size;
              const y = Math.floor(i / size);
              const tile = byPos.get(`${x},${y}`);

              let bg = "bg-neutral-800";
              let icon = "";
              if (tile?.type === "village") { bg = "bg-emerald-600"; icon = "🏰"; }
              else if (tile?.type === "outpost") { bg = "bg-rose-600"; icon = "⚑"; }
              else if (tile?.type === "resource") { bg = "bg-amber-600"; icon = "⛏️"; }

              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => onSelect?.(x, y)}
                  title={`${x},${y} • ${tile?.type ?? "empty"}${tile?.owner ? ` (${tile.owner})` : ""}`}
                  className={`${bg} transition-transform hover:scale-105 focus:outline-none`}
                  style={{ width: tilePx, height: tilePx, fontSize: tilePx <= 12 ? 8 : 10, lineHeight: 1 }}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
