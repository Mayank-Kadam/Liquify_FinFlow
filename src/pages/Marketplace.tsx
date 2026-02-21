import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Zap, Building2, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useMarketTicker } from "@/hooks/useMarketTicker";

type FilterType = "All" | "Commercial" | "Residential" | "Mixed-Use";
type SortType = "price-asc" | "price-desc" | "yield" | "liquidity";
type MarketTab = "live" | "primary";

export default function Marketplace() {
  const { properties, offerings, simulateDemand } = useAppStore();
  useMarketTicker(2000); // animate price charts
  const [tab, setTab] = useState<MarketTab>("live");
  const [filter, setFilter] = useState<FilterType>("All");
  const [sort, setSort] = useState<SortType>("yield");
  const [search, setSearch] = useState("");

  const filters: FilterType[] = ["All", "Commercial", "Residential", "Mixed-Use"];

  const filtered = properties
    .filter((p) => {
      if (filter !== "All" && p.type !== filter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.location.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.tokenPrice - b.tokenPrice;
      if (sort === "price-desc") return b.tokenPrice - a.tokenPrice;
      if (sort === "yield") return b.yield - a.yield;
      if (sort === "liquidity") return b.liquidityPool - a.liquidityPool;
      return 0;
    });

  const totalLiquidity = properties.reduce((s, p) => s + p.liquidityPool, 0);
  const avgYield = properties.length > 0
    ? properties.reduce((s, p) => s + p.yield, 0) / properties.length
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {properties.length} tokenized assets • AI-powered AMM pricing
            </p>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Pool Depth</p>
              <p className="text-lg font-mono font-bold text-foreground">${(totalLiquidity / 1_000_000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Yield</p>
              <p className="text-lg font-mono font-bold text-gain">{avgYield.toFixed(1)}%</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-gain/10 border border-gain/20 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-gain" />
              <span className="text-xs text-gain font-semibold">Instant Liquidity</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab("live")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
              tab === "live"
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
            )}
          >
            Live Trading
          </button>
          <button
            onClick={() => setTab("primary")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-1.5",
              tab === "primary"
                ? "bg-warning/10 text-warning border-warning/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
            )}
          >
            Primary Offerings
            {offerings.length > 0 && (
              <span className="ml-1 text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-full font-mono">
                {offerings.length}
              </span>
            )}
          </button>
        </div>

        {/* Search + Filter bar (only for live) */}
        {tab === "live" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by property name or city…"
                className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    filter === f
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="yield">Sort: Highest Yield</option>
                <option value="price-asc">Sort: Price ↑</option>
                <option value="price-desc">Sort: Price ↓</option>
                <option value="liquidity">Sort: Liquidity</option>
              </select>
            </div>
          </div>
        )}
      </motion.div>

      {/* Content */}
      {tab === "live" ? (
        filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No properties match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        )
      ) : offerings.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No active primary offerings. Launch one from the Issuance page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {offerings.map((offering, i) => {
            const fundingPct = (offering.tokensSold / offering.totalTokens) * 100;
            return (
              <motion.div
                key={offering.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card-glass rounded-xl overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={offering.imageUrl} alt={offering.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm bg-warning/20 text-warning border border-warning/30">
                      Primary Offering
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 text-right">
                    <p className="text-xs text-muted-foreground">Fixed Price</p>
                    {/* eslint-disable-next-line */}
                    <p className="text-lg font-bold text-foreground">${offering.tokenPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm">{offering.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{offering.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Tokens Sold</p>
                      <p className="font-mono font-semibold text-foreground">{offering.tokensSold.toLocaleString()} / {offering.totalTokens.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Capital Raised</p>
                      <p className="font-mono font-semibold text-gain">${(offering.capitalRaised / 1_000_000).toFixed(2)}M</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground uppercase tracking-wider">Funding</span>
                      <span className="font-mono text-foreground font-semibold">{fundingPct.toFixed(1)}%</span>
                    </div>
                    <Progress value={fundingPct} className="h-2 bg-muted" />
                  </div>
                  <button
                    onClick={() => simulateDemand(offering.id, Math.ceil(offering.totalTokens * 0.12))}
                    disabled={fundingPct >= 100}
                    className={cn(
                      "w-full py-2 rounded-lg text-sm font-semibold border transition-all duration-150 flex items-center justify-center gap-2",
                      fundingPct >= 100
                        ? "bg-gain/10 text-gain border-gain/30 cursor-default"
                        : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 hover:border-primary/40"
                    )}
                  >
                    {fundingPct >= 100 ? (
                      <><TrendingUp className="w-4 h-4" />Fully Funded</>
                    ) : (
                      <><Users className="w-4 h-4" />Simulate Demand</>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}