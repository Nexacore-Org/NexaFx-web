const ALERTS_KEY = "rateAlerts";

export interface RateAlert {
  id: string;
  pair: string;
  condition: "above" | "below";
  targetRate: number;
  createdAt: string;
}

export function getRateAlerts(): RateAlert[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(ALERTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addRateAlert(
  alert: Omit<RateAlert, "id" | "createdAt">,
): RateAlert {
  const alerts = getRateAlerts();
  const newAlert: RateAlert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event("storage"));
  return newAlert;
}

export function removeRateAlert(id: string): void {
  const alerts = getRateAlerts().filter((a) => a.id !== id);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event("storage"));
}

export function checkRateAlerts(
  pair: string,
  currentRate: number,
): RateAlert[] {
  const alerts = getRateAlerts().filter((a) => a.pair === pair);
  const triggered: RateAlert[] = [];

  for (const alert of alerts) {
    if (
      (alert.condition === "above" && currentRate >= alert.targetRate) ||
      (alert.condition === "below" && currentRate <= alert.targetRate)
    ) {
      triggered.push(alert);
    }
  }

  return triggered;
}
