"use client";

import { useEffect, useState } from "react";

type MetricSummary = {
  name: string;
  count: number;
  avgDurationMs: number;
  avgTokens: number;
  cacheHitRate: number;
};

type ErrorLog = {
  source: string;
  message: string;
  timestamp: number;
};

export default function AdminPage() {
  const [summary, setSummary] = useState<MetricSummary[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    async function run() {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      setSummary(data.summary ?? []);
      setTotalEvents(data.totalEvents ?? 0);
      setErrors(data.errors ?? []);
    }
    run();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Admin Metrics</h1>
      <p className="mt-2 text-sm text-slate-300">Total events: {totalEvents}</p>
      <div className="mt-4 space-y-3">
        {summary.map((item) => (
          <div key={item.name} className="rounded border border-slate-600 bg-slate-900/60 p-3 text-sm">
            <div className="font-semibold">{item.name}</div>
            <div>Count: {item.count}</div>
            <div>Avg Duration: {item.avgDurationMs}ms</div>
            <div>Avg Tokens: {item.avgTokens}</div>
            <div>Cache Hit Rate: {item.cacheHitRate}</div>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-semibold">Recent Errors</h2>
      <div className="mt-3 space-y-2">
        {errors.length === 0 && <p className="text-sm text-slate-400">No captured errors yet.</p>}
        {errors.map((err, idx) => (
          <div key={`${err.timestamp}-${idx}`} className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-sm">
            <div>Source: {err.source}</div>
            <div>Message: {err.message}</div>
            <div>At: {new Date(err.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
