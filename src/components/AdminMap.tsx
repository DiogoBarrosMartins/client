import { useState, useMemo, useRef, useEffect } from "react";

export interface Tile {
  x: number;
  y: number;
  type: "village" | "outpost" | "resource" | "npc";
  owner?: string;
  name?: string;
}

interface AdminMapProps {
  tiles: Tile[];
  size: number; // world size (ex: 100 → 100x100)
  onSelect?: (x: number, y: number) => void;
  center?: { x: number; y: number }; // aldeia ativa
}

export default function AdminMap({
  tiles,
  size,
  onSelect,
  center,
}: AdminMapProps) {
  const [tilePx, setTilePx] = useState(16);

  // indexação rápida (x,y) → tile
  const byPos = useMemo(() => {
    const m = new Map<string, Tile>();
    for (const t of tiles) m.set(`${t.x},${t.y}`, t);
    return m;
  }, [tiles]);

  // scroll automático para aldeia ativa
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

  // traduzir tipo de tile para cor + ícone
  const getTileStyle = (tile?: Tile, isActive?: boolean) => {
    let bg = "bg-neutral-800";
    let icon = "";

    switch (tile?.type) {
      case "village":
        bg = "bg-emerald-600";
        icon = "🏰";
        break;
      case "outpost":
        bg = "bg-rose-600";
        icon = "⚑";
        break;
      case "resource":
        bg = "bg-amber-600";
        icon = "⛏️";
        break;
      case "npc":
        bg = "bg-purple-600";
        icon = "💀";
        break;
    }

    if (isActive) {
      bg += " ring-2 ring-white animate-pulse";
    }

    return { bg, icon };
  };

  return (
    <div className="space-y-2">
      {/* legenda + zoom */}
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-600" />{" "}
            Village
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-rose-600" />{" "}
            Outpost
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-600" />{" "}
            Resource
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-purple-600" />{" "}
            NPC
          </span>
        </div>
        <label className="flex items-center gap-2">
          Zoom
          <input
            type="range"
            min={10}
            max={28}
            value={tilePx}
            onChange={(e) => setTilePx(Number(e.target.value))}
          />
        </label>
      </div>

      {/* grid */}
      <div
        ref={containerRef}
        className="card overflow-auto max-w-full max-h-[70vh] p-2 bg-neutral-950 rounded-lg"
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
                center && center.x === x && center.y === y ? true : false;
              const { bg, icon } = getTileStyle(tile, isActive);

              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => onSelect?.(x, y)}
                  title={`${tile?.name ?? "Empty"}\n(${x},${y}) • ${
                    tile?.type ?? "empty"
                  }${tile?.owner ? ` (${tile.owner})` : ""}`}
                  className={`${bg} flex items-center justify-center transition-transform hover:scale-105 focus:outline-none`}
                  style={{
                    width: tilePx,
                    height: tilePx,
                    fontSize: tilePx <= 12 ? 8 : 10,
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
