import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  accent?: "default" | "gain" | "loss" | "warning" | "primary";
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  accent = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "card-glass rounded-xl p-5 relative overflow-hidden",
        className
      )}
    >
      {/* Subtle gradient accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2",
          accent === "gain" && "bg-gain",
          accent === "loss" && "bg-loss",
          accent === "warning" && "bg-warning",
          accent === "primary" && "bg-primary",
          accent === "default" && "bg-muted"
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          {icon && (
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              accent === "gain" && "bg-gain/10 text-gain",
              accent === "loss" && "bg-loss/10 text-loss",
              accent === "warning" && "bg-warning/10 text-warning",
              accent === "primary" && "bg-primary/10 text-primary",
              accent === "default" && "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
          )}
        </div>

        <p className="text-2xl font-display font-bold text-foreground font-mono mb-1">
          {value}
        </p>

        {(subValue || trendValue) && (
          <div className="flex items-center gap-2">
            {trendValue && (
              <span
                className={cn(
                  "text-xs font-mono font-medium",
                  trend === "up" && "text-gain",
                  trend === "down" && "text-loss",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" ? "▲" : trend === "down" ? "▼" : "–"} {trendValue}
              </span>
            )}
            {subValue && (
              <span className="text-xs text-muted-foreground">{subValue}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
