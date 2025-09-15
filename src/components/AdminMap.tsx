import { useState, useMemo, useRef, useEffect } from "react";

export interface Tile {
  x: number;
  y: number;
  type: "village" | "outpost" | "resource" | "npc" | "empty";
  owner?: string;
  name?: string;
  resourceType?: "wood" | "stone" | "iron" | "crop";
}

interface AdminMapProps {
  tiles: Tile[];
  size: number; // world size (ex: 100 → 100x100)
  onSelect?: (x: number, y: number) => void;
  center?: { x: number; y: number };
}

export default function AdminMap({
  tiles,
  size,
  onSelect,
  center,
}: AdminMapProps) {
  const [tilePx, setTilePx] = useState(22);

  const byPos = useMemo(() => {
    const m = new Map<string, Tile>();
    for (const t of tiles) m.set(`${t.x},${t.y}`, t);
    return m;
  }, [tiles]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (center && containerRef.current) {
      const { x, y } = center;
      const scrollX = x * tilePx - containerRef.current.clientWidth / 2;
      const scrollY = y * tilePx - containerRef.current.clientHeight / 2;
      containerRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: "smooth",
      });
    }
  }, [center, tilePx]);

  const getTileStyle = (tile?: Tile, isActive?: boolean) => {
    let bg = "bg-neutral-800 border border-neutral-900";
    let icon = "";

    if (tile) {
      switch (tile.type) {
        case "village":
          bg = "bg-emerald-600 border border-emerald-800";
          icon = "🏰";
          break;
        case "outpost":
          bg = "bg-red-600 border border-red-800";
          icon = "⚑";
          break;
        case "resource":
          switch (tile.resourceType) {
            case "wood":
              bg = "bg-green-700 border border-green-900";
              icon = "🌲";
              break;
            case "stone":
              bg = "bg-stone-500 border border-stone-700";
              icon = "🪨";
              break;
            case "iron":
              bg = "bg-slate-500 border border-slate-700";
              icon = "⛓️";
              break;
            case "crop":
            default:
              bg = "bg-yellow-400 border border-yellow-600";
              icon = "🌾";
              break;
          }
          break;
        case "npc":
          bg = "bg-amber-900 border border-amber-950";
          icon = "💀";
          break;
      }
    }

    if (isActive) {
      bg += " ring-2 ring-yellow-300 animate-pulse";
    }

    return { bg, icon };
  };

  return (
    <div className="space-y-2">
      {/* legenda */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1">🏰 Village</span>
          <span className="inline-flex items-center gap-1">⚑ Outpost</span>
          <span className="inline-flex items-center gap-1">🌾 Crop</span>
          <span className="inline-flex items-center gap-1">🌲 Wood</span>
          <span className="inline-flex items-center gap-1">🪨 Stone</span>
          <span className="inline-flex items-center gap-1">⛓️ Iron</span>
          <span className="inline-flex items-center gap-1">💀 NPC</span>
        </div>
        <label className="flex items-center gap-2">
          Zoom
          <input
            type="range"
            min={12}
            max={40}
            value={tilePx}
            onChange={(e) => setTilePx(Number(e.target.value))}
          />
        </label>
      </div>

      {/* grid */}
      <div
        ref={containerRef}
        className="card overflow-auto max-w-full max-h-[70vh] p-2 bg-neutral-950 rounded-lg shadow-inner"
      >
        <div style={{ width: tilePx * size }}>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${size}, ${tilePx}px)` }}
          >
            {Array.from({ length: size * size }).map((_, i) => {
              const x = i % size;
              const y = Math.floor(i / size);
              const tile = byPos.get(`${x},${y}`);
              const isActive =
                center && center.x === x && center.y === y;
              const { bg, icon } = getTileStyle(tile, isActive);

              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => onSelect?.(x, y)}
                  title={`${tile?.name ?? "Empty"}\n(${x},${y}) • ${
                    tile?.type ?? "empty"
                  }${tile?.owner ? ` (${tile.owner})` : ""}`}
                  className={`${bg} flex items-center justify-center hover:scale-105 transition-transform`}
                  style={{
                    width: tilePx,
                    height: tilePx,
                    fontSize: tilePx <= 14 ? 8 : 11,
                    lineHeight: 1,
                  }}
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
