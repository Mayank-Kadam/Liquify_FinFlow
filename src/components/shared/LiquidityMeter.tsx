import { cn } from "@/lib/utils";

interface LiquidityMeterProps {
  liquidityPool: number;    // USD in pool
  marketValue: number;      // total market value
  className?: string;
}

export function LiquidityMeter({ liquidityPool, marketValue, className }: LiquidityMeterProps) {
  const ratio = Math.min(liquidityPool / marketValue, 1);
  const percentage = (ratio * 100).toFixed(1);

  const getColor = () => {
    if (ratio >= 0.6) return "bg-gain";
    if (ratio >= 0.35) return "bg-warning";
    return "bg-loss";
  };

  const getLabel = () => {
    if (ratio >= 0.6) return "Deep";
    if (ratio >= 0.35) return "Moderate";
    return "Shallow";
  };

  const getLabelColor = () => {
    if (ratio >= 0.6) return "text-gain";
    if (ratio >= 0.35) return "text-warning";
    return "text-loss";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Liquidity Depth</span>
        <div className="flex items-center gap-1.5">
          <span className={cn("font-medium", getLabelColor())}>{getLabel()}</span>
          <span className="text-muted-foreground font-mono">{percentage}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor())}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>${(liquidityPool / 1000).toFixed(0)}K pool</span>
        <span>${(marketValue / 1_000_000).toFixed(1)}M total</span>
      </div>
    </div>
  );
}
