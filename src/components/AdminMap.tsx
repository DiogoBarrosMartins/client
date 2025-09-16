/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Container, Graphics } from "@pixi/react-pixi";
import type { FederatedPointerEvent } from "pixi.js";

export interface Tile {
  x: number;
  y: number;
  type: "village" | "outpost" | "resource" | "npc" | "empty";
  owner?: string;
  name?: string;
  resourceType?: "wood" | "stone" | "iron" | "crop";
  biome?: string;
}

interface AdminMapProps {
  tiles: Tile[];
  size: number;
  onSelect?: (x: number, y: number) => void;
  center?: { x: number; y: number };
}

export default function AdminMap({ tiles, size, onSelect, center }: AdminMapProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 400, y: 300 });
  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const radius = 18;
  const hexHeight = Math.sqrt(3) * radius;

  const byPos = useMemo(() => {
    const m = new Map<string, Tile>();
    for (const t of tiles) m.set(`${t.x},${t.y}`, t);
    return m;
  }, [tiles]);

  // calcula pontos do hexágono
  const hexPts = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      pts.push(radius * Math.cos(angle), radius * Math.sin(angle));
    }
    return pts;
  }, [radius]);

  // centra no activeVillage
  useEffect(() => {
    if (center) {
      setOffset({
        x: 400 - center.x * (radius * 1.5),
        y: 300 - center.y * hexHeight,
      });
    }
  }, [center, radius, hexHeight]);

  function getTileColor(tile?: Tile): number {
    if (!tile) return 0x222222;
    switch (tile.type) {
      case "village":
        return 0x2ecc71;
      case "outpost":
        return 0xe74c3c;
      case "resource":
        switch (tile.resourceType) {
          case "wood":
            return 0x27ae60;
          case "stone":
            return 0x95a5a6;
          case "iron":
            return 0x7f8c8d;
          default:
            return 0xf1c40f;
        }
      case "npc":
        return 0x8e44ad;
      default:
        return 0x333333;
    }
  }

  // handlers de panning
  function onPointerDown(e: FederatedPointerEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp() {
    dragging.current = false;
    lastPos.current = null;
  }
  function onPointerMove(e: FederatedPointerEvent) {
    if (dragging.current && lastPos.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((s) => Math.min(3, Math.max(0.3, s * factor)));
  }

  // listener de wheel
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("wheel", onWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", onWheel);
    }
  }, []);

  return (
    <div className="space-y-2">
      {/* HUD */}
      <div className="flex justify-between items-center text-xs text-slate-300">
        <div className="flex gap-3 flex-wrap">
          <span>🏰 Village</span>
          <span>⚑ Outpost</span>
          <span>🌾 Crop</span>
          <span>🌲 Wood</span>
          <span>🪨 Stone</span>
          <span>⛓️ Iron</span>
          <span>💀 NPC</span>
        </div>
      </div>

      {/* PIXI Stage */}
      <Stage width={800} height={600} options={{ backgroundColor: 0x111111, antialias: true }}>
        <Container
          position={offset}
          scale={{ x: scale, y: scale }}
          interactive
          pointerdown={onPointerDown}
          pointerup={onPointerUp}
          pointerupoutside={onPointerUp}
          pointermove={onPointerMove}
            {...({ children: undefined } as any)}
        >
          {Array.from({ length: size * size }).map((_, i) => {
            const q = i % size;
            const r = Math.floor(i / size);

            const x = q * (radius * 1.5);
            const y = r * hexHeight + (q % 2) * (hexHeight / 2);

            const tile = byPos.get(`${q},${r}`);
            const color = getTileColor(tile);

            return (
              <Graphics
                key={`${q}-${r}`}
                x={x}
                y={y}
                interactive
                pointerdown={() => onSelect?.(q, r)}
                draw={(g) => {
                  g.clear();
                  g.beginFill(color);
                  g.drawPolygon(hexPts);
                  g.endFill();
                }}
              />
            );
          })}
        </Container>
      </Stage>
    </div>
  );
}
