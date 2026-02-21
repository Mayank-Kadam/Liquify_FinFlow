import { useAppStore } from "@/store/appStore";
import { StatCard } from "@/components/shared/StatCard";
import { PriceChart } from "@/components/charts/PriceChart";
import { RiskMeter } from "@/components/shared/RiskMeter";
import { AiConfidence } from "@/components/shared/AiConfidence";
import {
  DollarSign,
  Coins,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { runStressTest } from "@/lib/pricingEngine";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketTicker } from "@/hooks/useMarketTicker";

export default function Dashboard() {
  const { properties, holdings, transactions, user } = useAppStore();
  const navigate = useNavigate();
  const [stressResult, setStressResult] = useState<{ maxDrawdown: number; finalPrice: number } | null>(null);
  const [stressTesting, setStressTesting] = useState(false);
  useMarketTicker(2000); // update prices for real-time chart animations

  // Portfolio calculations
  const portfolioValue = holdings.reduce((sum, h) => {
    const prop = properties.find((p) => p.id === h.propertyId);
    return sum + (prop ? prop.tokenPrice * h.tokenAmount : 0);
  }, 0);

  const costBasis = holdings.reduce((sum, h) => sum + h.averageEntryPrice * h.tokenAmount, 0);
  const unrealizedPL = portfolioValue - costBasis;
  const plPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0;

  const totalLiquidity = properties.reduce((s, p) => s + p.liquidityPool, 0);
  const totalTokens = holdings.reduce((s, h) => s + h.tokenAmount, 0);
  const avgAIConfidence = Math.round(
    properties.reduce((s, p) => {
      const lastTwo = p.priceHistory.slice(-2);
      return s + 75;
    }, 0) / properties.length
  );

  const marketSentiment = properties.reduce((s, p) => {
    const last = p.priceHistory.slice(-2);
    if (last.length < 2) return s;
    return s + (last[1].price - last[0].price);
  }, 0);

  const handleStressTest = async () => {
    setStressTesting(true);
    const prop = properties[5]; // use most volatile
    const result = runStressTest({
      currentPrice: prop.tokenPrice,
      liquidityPoolBalance: prop.liquidityPool,
      availableSupply: prop.availableSupply,
      totalSupply: prop.totalSupply,
      volatilityIndex: prop.volatilityIndex,
    });
    await new Promise((r) => setTimeout(r, 1200));
    setStressResult(result);
    setStressTesting(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
            <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} •{" "}
            <span className="text-primary font-mono text-xs">Protocol: Active</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="card-glass rounded-lg px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground">Cash Balance</p>
            <p className="text-sm font-mono font-bold text-foreground">${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={handleStressTest}
            disabled={stressTesting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-loss/10 border border-loss/20 text-loss text-sm font-semibold hover:bg-loss/20 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            {stressTesting ? "Testing…" : "Stress Test"}
          </button>
        </div>
      </motion.div>

      {/* Stress test result */}
      {stressResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card-glass rounded-xl p-4 border border-loss/30 bg-loss/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-loss" />
              <div>
                <p className="text-sm font-semibold text-foreground">Bank Run Stress Test — Sunset Boulevard Commercial</p>
                <p className="text-xs text-muted-foreground">Simulated: 40% supply sold in rapid succession</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-[10px] text-muted-foreground">Max Drawdown</p>
                <p className="text-lg font-mono font-bold text-loss">-{stressResult.maxDrawdown.toFixed(1)}%</p>
              </div>
              <button onClick={() => setStressResult(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={`$${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          trendValue={`${Math.abs(plPercent).toFixed(2)}%`}
          trend={plPercent >= 0 ? "up" : "down"}
          subValue="total assets"
          icon={<DollarSign className="w-4 h-4" />}
          accent={plPercent >= 0 ? "gain" : "loss"}
        />
        <StatCard
          label="Unrealized P/L"
          value={`${unrealizedPL >= 0 ? "+" : ""}$${unrealizedPL.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          trendValue={`${Math.abs(plPercent).toFixed(2)}%`}
          trend={plPercent >= 0 ? "up" : "down"}
          subValue="vs cost basis"
          icon={<TrendingUp className="w-4 h-4" />}
          accent={unrealizedPL >= 0 ? "gain" : "loss"}
        />
        <StatCard
          label="Tokens Held"
          value={totalTokens.toLocaleString()}
          subValue={`across ${holdings.length} properties`}
          icon={<Coins className="w-4 h-4" />}
          accent="primary"
        />
        <StatCard
          label="Protocol Liquidity"
          value={`$${(totalLiquidity / 1_000_000).toFixed(1)}M`}
          subValue="total pool depth"
          icon={<Activity className="w-4 h-4" />}
          accent="default"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="lg:col-span-2 card-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-foreground">Price Trends</h2>
              <p className="text-xs text-muted-foreground">AI-simulated 30d price movement</p>
            </div>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <PriceChart property={properties[0]} height={220} />
        </div>

        {/* Market Intelligence */}
        <div className="card-glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">Market Intel</h2>
            <Zap className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">AI Macro Sentiment</p>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", marketSentiment >= 0 ? "bg-gain" : "bg-loss")} />
                <span className={cn("text-sm font-semibold", marketSentiment >= 0 ? "text-gain" : "text-loss")}>
                  {marketSentiment >= 0 ? "Bullish" : "Bearish"}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {marketSentiment >= 0 ? "▲" : "▼"} {Math.abs(marketSentiment * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <AiConfidence score={avgAIConfidence} />

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Property Risk Overview</p>
              {properties.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">{p.name.split(" ").slice(0, 2).join(" ")}</span>
                  <RiskMeter level={p.riskLevel} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity + Top assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Recent Activity</h2>
            <button onClick={() => navigate("/transactions")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                    tx.type === "buy" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                  )}>
                    {tx.type === "buy" ? "B" : "S"}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{tx.propertyName.split(" ").slice(0, 3).join(" ")}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {tx.tokenAmount} tokens @ ${tx.tokenPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-mono font-semibold", tx.type === "buy" ? "text-loss" : "text-gain")}>
                    {tx.type === "buy" ? "-" : "+"}${tx.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Properties */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Live Prices</h2>
            <button onClick={() => navigate("/marketplace")} className="text-xs text-primary hover:underline">Marketplace</button>
          </div>
          <div className="space-y-2">
            {properties.map((p) => {
              const last = p.priceHistory[p.priceHistory.length - 2]?.price ?? p.tokenPrice;
              const change = ((p.tokenPrice - last) / last) * 100;
              const isUp = change >= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/asset/${p.id}`)}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/20 rounded px-1 transition-colors"
                >
                  <div>
                    <p className="text-xs font-medium text-foreground">{p.name.split(" ").slice(0, 3).join(" ")}</p>
                    <p className="text-[10px] text-muted-foreground">{p.location.split(",")[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-foreground">${p.tokenPrice.toFixed(2)}</p>
                    <p className={cn("text-[10px] font-mono", isUp ? "text-gain" : "text-loss")}>
                      {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
