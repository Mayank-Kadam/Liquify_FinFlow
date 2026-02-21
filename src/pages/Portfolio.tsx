import { useAppStore } from "@/store/appStore";
import { PriceChart } from "@/components/charts/PriceChart";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { useMarketTicker } from "@/hooks/useMarketTicker";

export default function Portfolio() {
  const { properties, holdings } = useAppStore();
  const navigate = useNavigate();
  useMarketTicker(2000); // update prices every 2 seconds for chart animations

  const enrichedHoldings = holdings.map((h) => {
    const prop = properties.find((p) => p.id === h.propertyId)!;
    const currentValue = prop.tokenPrice * h.tokenAmount;
    const costBasis = h.averageEntryPrice * h.tokenAmount;
    const pl = currentValue - costBasis;
    const plPercent = (pl / costBasis) * 100;
    return { ...h, prop, currentValue, costBasis, pl, plPercent };
  });

  const totalValue = enrichedHoldings.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = enrichedHoldings.reduce((s, h) => s + h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your tokenized real estate holdings</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Value",
            value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            accent: "text-foreground",
          },
          {
            label: "Total Invested",
            value: `$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            accent: "text-foreground",
          },
          {
            label: "Unrealized P/L",
            value: `${totalPL >= 0 ? "+" : ""}$${totalPL.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            sub: `${totalPLPercent >= 0 ? "+" : ""}${totalPLPercent.toFixed(2)}%`,
            accent: totalPL >= 0 ? "text-gain" : "text-loss",
          },
        ].map((c) => (
          <div key={c.label} className="card-glass rounded-xl p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{c.label}</p>
            {/* eslint-disable-next-line */}
            <p className={cn("text-2xl font-bold", c.accent)}>{c.value}</p>
            {c.sub && <p className={cn("text-xs font-mono mt-0.5", c.accent)}>{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Holdings */}
      {enrichedHoldings.length === 0 ? (
        <div className="card-glass rounded-xl p-16 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No holdings yet. Visit the Marketplace to invest.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/20 transition-all"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrichedHoldings.map((h, i) => (
            <motion.div
              key={h.propertyId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-glass rounded-xl overflow-hidden cursor-pointer hover:border-primary/20 transition-all"
              onClick={() => navigate(`/asset/${h.propertyId}`)}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-48 h-32 lg:h-auto flex-shrink-0 overflow-hidden relative">
                  <img
                    src={h.prop.imageUrl}
                    alt={h.prop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 hidden lg:block" />
                </div>

                {/* Details */}
                <div className="flex-1 p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
                  <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                    <p className="text-sm font-semibold text-foreground">{h.prop.name.split(" ").slice(0, 3).join(" ")}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{h.prop.location.split(",")[0]}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{h.prop.type}</p>
                  </div>

                  {[
                    { label: "Tokens", value: h.tokenAmount.toLocaleString() },
                    { label: "Entry Price", value: `$${h.averageEntryPrice.toFixed(2)}` },
                    { label: "Current Price", value: `$${h.prop.tokenPrice.toFixed(2)}` },
                  ].map((col) => (
                    <div key={col.label}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{col.label}</p>
                      <p className="text-sm font-mono font-semibold text-foreground">{col.value}</p>
                    </div>
                  ))}

                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">P/L</p>
                    <div className="flex items-center gap-1">
                      {h.pl >= 0
                        ? <TrendingUp className="w-3.5 h-3.5 text-gain" />
                        : <TrendingDown className="w-3.5 h-3.5 text-loss" />}
                      <p className={cn("text-sm font-mono font-bold", h.pl >= 0 ? "text-gain" : "text-loss")}>
                        {h.plPercent >= 0 ? "+" : ""}{h.plPercent.toFixed(2)}%
                      </p>
                    </div>
                    <p className={cn("text-[10px] font-mono", h.pl >= 0 ? "text-gain" : "text-loss")}>
                      {h.pl >= 0 ? "+" : ""}${h.pl.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="w-full lg:w-48 h-20 p-3 flex-shrink-0">
                  <PriceChart property={h.prop} height={56} compact />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
