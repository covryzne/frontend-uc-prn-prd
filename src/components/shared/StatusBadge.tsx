import { cn } from "@/lib/utils";
import type { DomainStatus, LogStatus } from "@/types";

const domainStatusStyles: Record<DomainStatus, string> = {
  Pornografi: "bg-destructive/10 text-destructive",
  "Non-Pornografi": "bg-success/10 text-success",
  "Manual Check": "bg-warning/10 text-warning",
};

const logStatusStyles: Record<LogStatus, string> = {
  Ok: "bg-success/10 text-success",
  Error: "bg-destructive/10 text-destructive",
  Warning: "bg-warning/10 text-warning",
};

const serviceStatusStyles: Record<string, string> = {
  Online: "bg-success/10 text-success",
  Offline: "bg-destructive/10 text-destructive",
  Unknown: "bg-muted text-muted-foreground",
  Error: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, type = "domain" }: { status: string; type?: "domain" | "log" | "service" | "role" }) {
  const styles =
    type === "log" ? logStatusStyles : type === "service" ? serviceStatusStyles :
    type === "role" ? { Admin: "bg-primary/10 text-primary", Verifikator: "bg-success/10 text-success" } :
    domainStatusStyles;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", (styles as Record<string, string>)[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}
