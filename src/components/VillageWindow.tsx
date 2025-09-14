// src/components/VillageWindow.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { Village } from "../types";
import ResourcesPanel from "./ResourcesPanel";
import BuildingsPanel from "./BuildingsPanel";
import TrainingPanel from "./TrainingPanel";
import TroopsPanel from "./TroopsPanel";

export default function VillageWindow({ village }: { village: Village }) {
  return (
    <Card className="p-4 mb-6">
      <h1 className="text-xl font-bold mb-4">
        {village.name} ({village.playerName ?? "—"})
      </h1>

      <CardContent className="space-y-6">
        <ResourcesPanel
          amounts={village.resourceAmounts}
          rates={village.resourceProductionRates}
        />
        <BuildingsPanel buildings={village.buildings} />
        <TroopsPanel troops={village.troops} training={village.trainingTasks} />
        <TrainingPanel trainingTasks={village.trainingTasks} />
      </CardContent>
    </Card>
  );
}
