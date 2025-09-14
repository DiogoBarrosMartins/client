import { useEffect, useState } from "react";
import { getEvents } from "../../api/api";
import { useOutletContext } from "react-router-dom";
import type { Village } from "../../types";

type Ctx = { mainVillage?: Village };
type VillageEvent = { id: string; type: string; ts?: number; payload?: unknown };

export default function ReportsView() {
  const { mainVillage } = useOutletContext<Ctx>();
  const [events, setEvents] = useState<VillageEvent[]>([]);
  useEffect(() => {
    if (!mainVillage) return;
    getEvents(mainVillage.id).then(setEvents).catch(() => setEvents([]));
  }, [mainVillage]);

  return (
    <section className="rounded-xl border border-white/10 bg-neutral-900 p-4">
      <h3 className="font-semibold mb-2">Relatórios</h3>
      <ul className="text-sm space-y-1">
        {events.map((e) => (
          <li key={e.id} className="border-b border-white/10 pb-1">
            <span className="text-slate-300">{e.type}</span>{" "}
            <span className="text-slate-400">· {new Date(e.ts ?? Date.now()).toLocaleString()}</span>
          </li>
        ))}
        {events.length === 0 && (
          <li className="text-slate-400">Sem eventos ainda.</li>
        )}
      </ul>
    </section>
  );
}
