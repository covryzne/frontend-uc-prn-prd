import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Pause, Play } from "lucide-react";
import { fetchServiceLogs, type ServiceId } from "@/services/logService";

interface ServiceLogTerminalProps {
  serviceId: ServiceId;
  serviceName: string;
  autoRefreshInterval?: number; // milliseconds
}

const LOG_TAIL_OPTIONS = [10, 20, 50, 100];

const getLogColor = (line: string): string => {
  const lower = line.toLowerCase();

  // Error/Red
  if (
    lower.includes("error") ||
    lower.includes("failed") ||
    lower.includes("failed") ||
    lower.includes("fatal") ||
    lower.includes("exception") ||
    lower.includes("✗")
  ) {
    return "text-red-400";
  }

  // Warning/Yellow
  if (
    lower.includes("warning") ||
    lower.includes("warn") ||
    lower.includes("throttle") ||
    lower.includes("retry") ||
    lower.includes("retrying") ||
    lower.includes("timeout")
  ) {
    return "text-yellow-400";
  }

  // Success/Green
  if (
    lower.includes("success") ||
    lower.includes("successful") ||
    lower.includes("completed") ||
    lower.includes("complete") ||
    lower.includes("✓") ||
    lower.includes("[complete]") ||
    lower.includes("[fetch]") ||
    lower.includes("[scrape]")
  ) {
    return "text-green-400";
  }

  // Default gray
  return "text-gray-300";
};

export function ServiceLogTerminal({
  serviceId,
  serviceName,
  autoRefreshInterval = 3000,
}: ServiceLogTerminalProps) {
  const [tail, setTail] = useState(20);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetchServiceLogs(serviceId, tail);
      if (response.logs) {
        // Extract only the `detail` field from each log and preserve raw formatting
        const logLines = response.logs.map((log) => log.detail).filter(Boolean);
        setLogs(logLines);
        setLastRefresh(new Date());

        // Auto-scroll to bottom after logs update
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, 0);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs(["Error: Gagal memuat logs. Coba refresh lagi."]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      return;
    }

    autoRefreshTimerRef.current = setInterval(() => {
      fetchLogs();
    }, autoRefreshInterval);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [autoRefresh, autoRefreshInterval]);

  // Fetch logs when tail changes
  const handleTailChange = async (newTail: number) => {
    setTail(newTail);
    setIsLoading(true);
    try {
      const response = await fetchServiceLogs(serviceId, newTail);
      if (response.logs) {
        const logLines = response.logs.map((log) => log.detail).filter(Boolean);
        setLogs(logLines);
        setLastRefresh(new Date());

        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, 0);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-950">
      <CardHeader className="border-b border-slate-700 pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-slate-200">
            {serviceName} Terminal
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(tail)}
              onValueChange={(v) => handleTailChange(Number(v))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-28 h-8 text-xs bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {LOG_TAIL_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={String(opt)}
                    className="text-slate-100"
                  >
                    Last {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-8 px-2 text-xs ${
                autoRefresh
                  ? "bg-green-900 border-green-700 text-green-100"
                  : "bg-slate-800 border-slate-600 text-slate-300"
              }`}
              title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            >
              {autoRefresh ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
              className="h-8 px-2 text-xs bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {lastRefresh && (
          <p className="text-xs text-slate-400 mt-2">
            Last updated:{" "}
            {lastRefresh.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
            {autoRefresh && " (auto-refresh ON)"}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={terminalRef}
          className="bg-slate-950 text-slate-100 p-4 rounded-b-lg overflow-y-auto max-h-96 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words"
        >
          {logs.length === 0 ? (
            <div className="text-slate-500">
              {isLoading
                ? "Memuat logs..."
                : "Belum ada log untuk ditampilkan."}
            </div>
          ) : (
            logs.map((line, idx) => (
              <div key={idx} className={`${getLogColor(line)}`}>
                {line}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
