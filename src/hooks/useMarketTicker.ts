import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";

// Hook that periodically updates market prices to create chart fluctuations
export function useMarketTicker(intervalMs: number = 2000) {
  const tickMarket = useAppStore((s) => s.tickMarket);

  useEffect(() => {
    const interval = setInterval(() => {
      tickMarket();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [tickMarket, intervalMs]);
}
