// src/types.ts

export type Race = "HUMAN" | "ORC" | "ELF" | "DWARF" | "UNDEAD";

export type ResourceAmounts = {
  food: number;
  wood: number;
  stone: number;
  gold: number;
};

export type BuildingStatus = "idle" | "queued" | "in_progress";

export type Building = {
  id: string;
  name: string;
  type: string;
  level: number;
  status?: BuildingStatus;
  queuedUntil?: string | null;
};

export type Troop = {
  id: string;
  villageId: string;
  troopType: string; // ex: "human_swordsman"
  quantity: number;
  status: "idle" | "on_route" | "training";
};

export type TrainingTask = {
  id: string;
  villageId: string;
  troopId: string;
  troopType: string;
  buildingType: string;
  count: number;
  remaining: number;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
};


export type Village = {
  id: string;
  name: string;
  x: number;
  y: number;
  race: Race;
  playerId: string;
  playerName?: string;
  resourceAmounts: ResourceAmounts;
  resourceProductionRates: ResourceAmounts;
  buildings: Building[];
  troops: Troop[];
  trainingTasks: TrainingTask[];
};

export type Player = {
  id: string;
  username: string;
  race: Race;
  villages: Village[];
};
