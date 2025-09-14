import type { Troop, TrainingTask } from "../types";

const ICON: Record<string, string> = {
  human_swordsman: "⚔️",
  human_archer: "🏹",
  human_paladin: "🛡️",
  human_cleric: "⛪",
};

export default function TroopsPanel({
  troops,
  training,
}: {
  troops: Troop[];
  training: TrainingTask[];
}) {
  return (
    <div className="space-y-4">
      <section>
        <h2 className="font-semibold mb-2">Tropas</h2>
        {troops.length === 0 ? (
          <p className="text-slate-400">Sem tropas ainda.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {troops.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span>
                  {ICON[t.troopType] ?? "👤"} {t.troopType}
                </span>
                <span>x{t.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Fila de treino</h2>
        {training.length === 0 ? (
          <p className="text-slate-400">Nenhum treino em progresso.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {training.map((task) => (
              <li key={task.id} className="flex justify-between">
                <span>
                  {ICON[task.troopType] ?? "👤"} {task.count} {task.troopType}
                </span>
                <span>
                  {task.status} ·{" "}
                  {task.endTime &&
                    new Date(task.endTime).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
