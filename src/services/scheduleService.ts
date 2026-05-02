import ENDPOINTS from "../constants/endpoint";

export interface ScheduleItem {
  id: string;
  keyword: string;
  status: string | null;
  interval: string | null;
  crawl_engine: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
  is_running: boolean;
  last_error?: string | null;
}

async function getSchedules(): Promise<ScheduleItem[]> {
  const res = await fetch(ENDPOINTS.SCHEDULES, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load schedules");
  const data = await res.json();
  return data || [];
}

async function startSchedule(id: string) {
  const res = await fetch(ENDPOINTS.SCHEDULE_START(id), {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Start failed");
  return res.json();
}

async function stopSchedule(id: string) {
  const res = await fetch(ENDPOINTS.SCHEDULE_STOP(id), {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Stop failed");
  return res.json();
}

async function runNow(id: string) {
  const res = await fetch(ENDPOINTS.SCHEDULE_RUN_NOW(id), {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Run now failed");
  return res.json();
}

async function updateSchedule(
  id: string,
  interval?: string,
  start?: boolean,
  crawlEngine?: string,
) {
  const body: {
    interval?: string;
    start?: boolean;
    crawl_engine?: string;
  } = {};
  if (interval !== undefined) body.interval = interval;
  if (start !== undefined) body.start = start;
  if (crawlEngine !== undefined) body.crawl_engine = crawlEngine;

  const res = await fetch(ENDPOINTS.SCHEDULE_UPDATE(id), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Update schedule failed");
  return res.json();
}

export { getSchedules, startSchedule, stopSchedule, runNow, updateSchedule };
export default {
  getSchedules,
  startSchedule,
  stopSchedule,
  runNow,
  updateSchedule,
};
