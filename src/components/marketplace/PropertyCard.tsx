import { Property } from "@/lib/mockData";
import { RiskMeter } from "@/components/shared/RiskMeter";
import { LiquidityMeter } from "@/components/shared/LiquidityMeter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, TrendingUp } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const navigate = useNavigate();

  const lastPrice =
    property.priceHistory[property.priceHistory.length - 2]?.price ??
    property.tokenPrice;

  const priceChange =
    lastPrice !== 0
      ? ((property.tokenPrice - lastPrice) / lastPrice) * 100
      : 0;

  const isUp = priceChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      onClick={() => navigate(`/asset/${property.id}`)}
      className="card-glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_35px_hsl(192_100%_50%/0.12)] group"
    >
      {/* PROPERTY IMAGE */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Strong Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        {/* PROPERTY TYPE BADGE (Primary) */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "px-3 py-1 text-[11px] font-semibold rounded-full backdrop-blur-md border shadow-md",
              property.type === "Commercial" &&
                "bg-cyan-500/15 text-cyan-400 border-cyan-400/30",
              property.type === "Residential" &&
                "bg-emerald-500/15 text-emerald-400 border-emerald-400/30",
              property.type === "Mixed-Use" &&
                "bg-amber-500/15 text-amber-400 border-amber-400/30",
              property.type === "Industrial" &&
                "bg-muted/30 text-muted-foreground border-border"
            )}
          >
            {property.type}
          </span>
        </div>

        {/* INSTANT EXIT BADGE (Secondary) */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 text-[11px] font-medium rounded-full bg-black/40 backdrop-blur-md border border-primary/40 text-primary shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Instant Exit
          </span>
        </div>

        {/* TOKEN PRICE OVERLAY */}
        <div className="absolute bottom-4 right-4 text-right z-10">
          <p className="text-xs text-muted-foreground">Token Price</p>
          {/* eslint-disable-next-line */}
          <p className="text-lg font-bold text-white">
            ${property.tokenPrice.toFixed(2)}
          </p>
          <p
            className={cn(
              "text-xs font-mono font-medium",
              isUp ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isUp ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm leading-tight">
            {property.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {property.location}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">
              Market Value
            </p>
            <p className="font-mono font-semibold text-foreground">
              ${(property.marketValue / 1_000_000).toFixed(1)}M
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">
              Annual Yield
            </p>
            <p className="font-mono font-semibold text-emerald-400">
              {property.yield}%
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">
              Available
            </p>
            <p className="font-mono font-semibold text-foreground">
              {property.availableSupply.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">
              Risk
            </p>
            <RiskMeter
              level={property.riskLevel}
              size="sm"
              showLabel={false}
            />
          </div>
        </div>

        <LiquidityMeter
          liquidityPool={property.liquidityPool}
          marketValue={property.marketValue}
        />

        <button className="w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold border border-primary/20 hover:border-primary/40 transition-all duration-150 flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" />
          View & Trade
        </button>
      </div>
    </motion.div>
  );
}