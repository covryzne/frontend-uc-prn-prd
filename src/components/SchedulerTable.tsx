import React from "react";
import {
  ScheduleItem,
  startSchedule,
  stopSchedule,
  runNow,
} from "../services/scheduleService";
import formatInterval from "../utils/formatInterval";

type Props = {
  items: ScheduleItem[];
  onActionComplete?: () => void;
};

export default function SchedulerTable({ items, onActionComplete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Keyword
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Status
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Interval
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Last Run
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Next Run
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Running
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {it.keyword}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${it.status === "running" ? "bg-green-100 text-green-800" : it.status === "error" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {it.status || "-"}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                <div>{formatInterval(it.interval || undefined)}</div>
                {it.interval &&
                  it.interval.toLowerCase().startsWith("cron:") && (
                    <div className="text-xs text-gray-400">
                      {it.interval.replace(/cron:/i, "")}
                    </div>
                  )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {it.last_run_at
                  ? new Date(it.last_run_at).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {it.next_run_at
                  ? new Date(it.next_run_at).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {it.is_running ? "Yes" : "No"}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                    onClick={async () => {
                      try {
                        await startSchedule(it.id);
                        onActionComplete?.();
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                        alert("Start failed");
                      }
                    }}
                    disabled={it.status === "running"}
                  >
                    Start
                  </button>

                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm disabled:opacity-50"
                    onClick={async () => {
                      try {
                        await stopSchedule(it.id);
                        onActionComplete?.();
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                        alert("Stop failed");
                      }
                    }}
                    disabled={it.status !== "running"}
                  >
                    Stop
                  </button>

                  <button
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                    onClick={async () => {
                      try {
                        await runNow(it.id);
                        onActionComplete?.();
                      } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                        alert("Run now failed");
                      }
                    }}
                    disabled={it.is_running}
                  >
                    Run Now
                  </button>
                </div>

                {it.last_error && (
                  <details className="mt-2 text-xs text-red-600">
                    <summary className="cursor-pointer">Last error</summary>
                    <div className="whitespace-pre-wrap">{it.last_error}</div>
                  </details>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
