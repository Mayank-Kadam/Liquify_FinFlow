import { cn } from "@/lib/utils";

interface RiskMeterProps {
  level: "Low" | "Medium" | "High" | "Critical";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const riskConfig = {
  Low: { color: "bg-gain", textColor: "text-gain", bars: 1, label: "Low Risk" },
  Medium: { color: "bg-warning", textColor: "text-warning", bars: 2, label: "Medium Risk" },
  High: { color: "bg-loss", textColor: "text-loss", bars: 3, label: "High Risk" },
  Critical: { color: "bg-loss", textColor: "text-loss", bars: 4, label: "Critical Risk" },
};

export function RiskMeter({ level, size = "md", showLabel = true, className }: RiskMeterProps) {
  const config = riskConfig[level];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "rounded-sm transition-all duration-300",
              size === "sm" ? "w-1" : size === "md" ? "w-1.5" : "w-2",
              bar <= config.bars ? config.color : "bg-muted"
            )}
            style={{
              height: size === "sm" ? `${bar * 4 + 4}px` : size === "md" ? `${bar * 5 + 5}px` : `${bar * 6 + 6}px`,
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", config.textColor)}>{config.label}</span>
      )}
    </div>
  );
}
