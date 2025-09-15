import api from "./client";
import type { Village } from "../types";

// —— Tipos auxiliares ——
export type GameEvent = {
  id: string;
  type: string;
  ts: number;
  payload: unknown;
};

export async function getVillagesByPlayer(playerId: string): Promise<Village[]> {
  const res = await api.get(`/villages/${playerId}`);
  return res.data as Village[];
}

export async function getResources(villageId: string) {
  const res = await api.get(`/villages/${villageId}/resources`);
  return res.data as { food: number; wood: number; stone: number; gold: number };
}

export async function getEvents(villageId: string) {
  const res = await api.get(`/villages/${villageId}/events`);
  return res.data as GameEvent[];
}


export type UpgradeResponse = { buildingId: string; finishAt: string };
export async function upgradeBuilding(villageId: string, type: string): Promise<UpgradeResponse> {
  const res = await api.post<UpgradeResponse>("/buildings/upgrade", { villageId, type });
  return res.data;
}

export type TrainResponse = { taskId: string; finishAt: string };

// api.ts
export async function trainTroops(
  villageId: string,
  troopType: string,
  count: number
): Promise<TrainResponse> {
  console.log("📤 Sending trainTroops request:", { villageId, troopType, count });

  const res = await api.post<TrainResponse>(
    `/villages/${villageId}/troops`,
    { troopType, count }   // 👈 agora igual ao backend
  );
  return res.data;
}



export async function getTroopDefinitions(villageId: string) {
  const res = await api.get<{
    troops: Array<{
      id: string;          // chave que o backend entende (ex: "human_swordsman")
      name: string;        // friendly label (ex: "Swordsman")
      type: string;        // redundante, podes usar se precisares
      tier: string;
      buildingType: string;
      requiredLevel: number;
      unlocked: boolean;
    }>;
  }>(`/villages/${villageId}/troops/definitions`);
  return res.data;
}
export async function getWorldMap() {
  const res = await api.get<{
    x: number;
    y: number;
    type: string;
    name?: string;
    playerName?: string;
  }[]>("/world/map");

  return res.data;
}
