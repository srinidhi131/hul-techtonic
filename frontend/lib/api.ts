import type { Signal } from "@/components/SignalCard";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getSignals(): Promise<Signal[]> {
  const response = await fetch(`${API_BASE}/signals`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load signals");
  }

  return response.json();
}

export async function analyseTrend(payload: {
  trend: string;
  category?: string;
  market?: string;
}) {
  const response = await fetch(`${API_BASE}/analyse-trend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Trend analysis failed");
  }

  return response.json();
}
