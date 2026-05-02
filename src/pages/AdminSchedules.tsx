import React, { useCallback, useEffect, useState } from "react";
import SchedulerTable from "../components/SchedulerTable";
import { getSchedules, ScheduleItem } from "../services/scheduleService";

export default function AdminSchedulesPage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchedules();
      setItems(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Crawl Scheduler</h1>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-full" />
        </div>
      ) : (
        <SchedulerTable items={items} onActionComplete={load} />
      )}
    </div>
  );
}
