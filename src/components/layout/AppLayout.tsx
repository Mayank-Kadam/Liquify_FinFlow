import { useEffect, useRef } from "react";
import { AppSidebar } from "./AppSidebar";
import { useAppStore } from "@/store/appStore";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function MarketTicker() {
  const properties = useAppStore((s) => s.properties);

  return (
    <div className="h-8 border-b border-border bg-muted/30 overflow-hidden flex items-center">
      <div className="flex-shrink-0 px-3 text-[10px] font-mono text-primary font-semibold border-r border-border h-full flex items-center">
        LIVE
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-ticker flex gap-8 whitespace-nowrap px-4">
          {[...properties, ...properties].map((p, i) => {
            const last = p.priceHistory[p.priceHistory.length - 2];
            const current = p.priceHistory[p.priceHistory.length - 1];
            const change = last ? ((current?.price ?? p.tokenPrice) - last.price) / last.price * 100 : 0;
            const isUp = change >= 0;
            return (
              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-muted-foreground">{p.name.split(" ").slice(0, 2).join(" ")}</span>
                <span className="text-foreground font-medium">${p.tokenPrice.toFixed(2)}</span>
                <span className={change === 0 ? "text-muted-foreground" : isUp ? "text-gain" : "text-loss"}>
                  {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const tickMarket = useAppStore((s) => s.tickMarket);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Market ticks every 4 seconds
    intervalRef.current = setInterval(() => {
      tickMarket();
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [tickMarket]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MarketTicker />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <motion.div
            key={Math.random()}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
