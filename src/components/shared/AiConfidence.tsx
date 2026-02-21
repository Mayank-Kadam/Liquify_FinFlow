import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";

interface AiConfidenceProps {
  score: number; // 0–100
  className?: string;
  size?: "sm" | "md";
}

export function AiConfidence({ score, className, size = "md" }: AiConfidenceProps) {
  const getColor = () => {
    if (score >= 80) return "text-gain";
    if (score >= 60) return "text-warning";
    return "text-loss";
  };

  const getBgColor = () => {
    if (score >= 80) return "bg-gain";
    if (score >= 60) return "bg-warning";
    return "bg-loss";
  };

  const getLabel = () => {
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Brain className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4", getColor())} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Confidence</span>
          <span className={cn("text-xs font-mono font-bold", getColor())}>{score}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", getBgColor())}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className={cn("text-[10px] font-medium", getColor())}>{getLabel()}</span>
    </div>
  );
}
