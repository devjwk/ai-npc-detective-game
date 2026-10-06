type MetricEvent = {
  name: string;
  durationMs?: number;
  tokens?: number;
  cacheHit?: boolean;
  timestamp: number;
};

const events: MetricEvent[] = [];

export function trackMetric(event: Omit<MetricEvent, "timestamp">) {
  events.push({ ...event, timestamp: Date.now() });
  if (events.length > 1000) events.shift();
}

export function summarizeMetrics() {
  const total = events.length;
  const byName = new Map<string, MetricEvent[]>();
  for (const event of events) {
    const list = byName.get(event.name) ?? [];
    list.push(event);
    byName.set(event.name, list);
  }

  const summary = Array.from(byName.entries()).map(([name, list]) => {
    const durationValues = list.map((item) => item.durationMs ?? 0).filter((n) => n > 0);
    const tokenValues = list.map((item) => item.tokens ?? 0).filter((n) => n > 0);
    const cacheHits = list.filter((item) => item.cacheHit).length;

    const avgDuration = durationValues.length
      ? durationValues.reduce((a, b) => a + b, 0) / durationValues.length
      : 0;
    const avgTokens = tokenValues.length
      ? tokenValues.reduce((a, b) => a + b, 0) / tokenValues.length
      : 0;

    return {
      name,
      count: list.length,
      avgDurationMs: Number(avgDuration.toFixed(2)),
      avgTokens: Number(avgTokens.toFixed(2)),
      cacheHitRate: Number((cacheHits / list.length).toFixed(2))
    };
  });

  return {
    totalEvents: total,
    summary,
    recentEvents: events.slice(-20)
  };
}
