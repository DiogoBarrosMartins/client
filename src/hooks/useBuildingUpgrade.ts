// src/hooks/useBuildingUpgrade.ts
import { useState } from "react";
import { upgradeBuilding } from "../api/api";
import type { TravianOutletCtx } from "../layout/TravianShell";

export function useBuildingUpgrade(
  village: TravianOutletCtx["activeVillage"],
  reloadVillages: () => Promise<void>
) {
  const [localQueued, setLocalQueued] = useState<Record<string, string>>({});

  async function onUpgrade(type: string, buildingId: string) {
    if (!village) return;
    try {
      const res = await upgradeBuilding(village.id, type);
      setLocalQueued((m) => ({ ...m, [buildingId]: res.finishAt }));
      await reloadVillages();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upgrade failed");
    }
  }

  function getQueueEta(buildingId: string, queuedUntil?: string | null) {
    const localEta = localQueued[buildingId];
    return localEta ?? queuedUntil ?? null;
  }

  function canAfford(cost: { food: number; wood: number; stone: number; gold: number }) {
    if (!village) return false;
    const r = village.resourceAmounts;
    return (
      r.food >= cost.food &&
      r.wood >= cost.wood &&
      r.stone >= cost.stone &&
      r.gold >= cost.gold
    );
  }

  return { onUpgrade, getQueueEta, canAfford };
}
