export function formatInterval(interval: string | null | undefined): string {
  if (!interval) return "-";

  const value = interval.trim();

  if (value.endsWith("h")) {
    const hours = value.replace(/h$/i, "");
    return `Every ${hours} hour${hours !== "1" ? "s" : ""}`;
  }

  if (value.toLowerCase().startsWith("cron:")) {
    const raw = value.replace(/cron:/i, "");
    const match = raw.match(/\*\/(\d+)/);
    if (match) {
      const hours = match[1];
      return `Every ${hours} hours (cron: ${raw})`;
    }
    return `Custom schedule (cron: ${raw})`;
  }

  // fallback: show raw but friendly
  return value;
}

export default formatInterval;
