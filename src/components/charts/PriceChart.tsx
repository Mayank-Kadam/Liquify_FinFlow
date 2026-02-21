import { Property, PricePoint } from "@/lib/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PriceChartProps {
  priceHistory?: PricePoint[];
  currentPrice?: number;
  propertyId?: string;
  height?: number;
  compact?: boolean;
  className?: string;
  property?: Property;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-mono font-bold text-primary">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function PriceChart({
  priceHistory,
  currentPrice,
  propertyId = "default",
  height = 200,
  compact = false,
  className,
  property,
}: PriceChartProps) {
  // ----------------------------
  // SAFE DATA RESOLUTION
  // ----------------------------

  const historyFromProp = priceHistory ?? [];
  const historyFromProperty = property?.priceHistory ?? [];

  const effectiveHistory =
    historyFromProp.length > 0 ? historyFromProp : historyFromProperty;

  const effectivePrice = currentPrice ?? property?.tokenPrice ?? 0;
  const effectiveId =
    propertyId !== "default" ? propertyId : property?.id ?? "default";

  if (!effectiveHistory || effectiveHistory.length === 0) {
    return (
      <div
        className={cn("w-full bg-muted/10 rounded-md animate-pulse", className)}
        style={{ height }}
      />
    );
  }

  // ----------------------------
  // TRANSFORM DATA
  // ----------------------------

  const data = effectiveHistory.map((point) => ({
    time: format(
      new Date(point.timestamp),
      compact ? "MM/dd" : "MM/dd HH:mm"
    ),
    price: point.price,
  }));

  const prices = data.map((d) => d.price);

  if (prices.length === 0) {
    return (
      <div
        className={cn("w-full bg-muted/10 rounded-md animate-pulse", className)}
        style={{ height }}
      />
    );
  }

  // 🔥 KEY FIX: CONSISTENT DOMAIN CALCULATION
  const minRaw = Math.min(...prices);
  const maxRaw = Math.max(...prices);

  const padding = (maxRaw - minRaw) * 0.05 || minRaw * 0.002;

  const minPrice = minRaw - padding;
  const maxPrice = maxRaw + padding;

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isUp = lastPrice >= firstPrice;

  // ----------------------------
  // RENDER
  // ----------------------------

  return (
    <div className={cn("w-full", className)}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              AI Price Simulation (30d)
            </p>
            <p className="text-xl font-bold text-foreground">
              ${effectivePrice.toFixed(2)}
            </p>
          </div>

          <div className="text-right">
            <p
              className={cn(
                "text-sm font-mono font-bold",
                isUp ? "text-gain" : "text-loss"
              )}
            >
              {isUp ? "▲" : "▼"}{" "}
              {Math.abs(
                ((lastPrice - firstPrice) / firstPrice) * 100
              ).toFixed(2)}
              %
            </p>
            <p className="text-[10px] text-muted-foreground">
              30d change
            </p>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient
              id={`grad-${effectiveId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={
                  isUp
                    ? "hsl(152 100% 45%)"
                    : "hsl(350 90% 58%)"
                }
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={
                  isUp
                    ? "hsl(152 100% 45%)"
                    : "hsl(350 90% 58%)"
                }
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          {!compact && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222 30% 14%)"
              vertical={false}
            />
          )}

          {!compact && (
            <XAxis
              dataKey="time"
              tick={{
                fill: "hsl(215 15% 50%)",
                fontSize: 10,
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
          )}

          {/* 🔥 ALWAYS ENFORCE DOMAIN (CRITICAL FIX) */}
          <YAxis
            domain={[minPrice, maxPrice]}
            hide={compact}
            tick={{
              fill: "hsl(215 15% 50%)",
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={50}
          />

          {!compact && <Tooltip content={<CustomTooltip />} />}

          <Area
            type="monotone"
            dataKey="price"
            stroke={
              isUp
                ? "hsl(152 100% 45%)"
                : "hsl(350 90% 58%)"
            }
            strokeWidth={compact ? 1.5 : 2}
            fill={`url(#grad-${effectiveId})`}
            dot={false}
            activeDot={
              compact
                ? false
                : {
                    r: 4,
                    fill: isUp
                      ? "hsl(152 100% 45%)"
                      : "hsl(350 90% 58%)",
                  }
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}