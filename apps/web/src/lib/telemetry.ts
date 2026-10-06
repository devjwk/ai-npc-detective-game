import { trackMetric } from "./metrics";

type CapturedError = {
  source: string;
  message: string;
  timestamp: number;
};

const errors: CapturedError[] = [];

export function captureError(source: string, err: unknown) {
  const message = err instanceof Error ? err.message : "unknown_error";
  errors.push({ source, message, timestamp: Date.now() });
  if (errors.length > 200) errors.shift();
  trackMetric({ name: "error", durationMs: 0 });
}

export function getRecentErrors() {
  return errors.slice(-30);
}
