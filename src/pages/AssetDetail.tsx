import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { PriceChart } from "@/components/charts/PriceChart";
import { RiskMeter } from "@/components/shared/RiskMeter";
import { LiquidityMeter } from "@/components/shared/LiquidityMeter";
import { AiConfidence } from "@/components/shared/AiConfidence";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Zap, MapPin, Calendar, Maximize2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMarketTicker } from "@/hooks/useMarketTicker";

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { properties, holdings, executeBuy, executeSell, user } = useAppStore();
  useMarketTicker(2000); // animate price chart
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const property = properties.find((p) => p.id === id);
  if (!property) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Property not found.
      </div>
    );
  }

  const holding = holdings.find((h) => h.propertyId === id);
  const tokenAmt = parseFloat(amount) || 0;
  const estimatedValue = tokenAmt * property.tokenPrice;
  const estimatedFee = estimatedValue * 0.005;
  const lastPrice = property.priceHistory[property.priceHistory.length - 2]?.price ?? property.tokenPrice;
  const priceChange = ((property.tokenPrice - lastPrice) / lastPrice) * 100;
  const isUp = priceChange >= 0;

  const aiConfScore = Math.round(
    Math.min(
      (property.liquidityPool / (property.availableSupply * property.tokenPrice)) * 60 + 30 - property.volatilityIndex * 25,
      99
    )
  );

  const handleTrade = async () => {
    if (tokenAmt <= 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result =
      tradeType === "buy"
        ? executeBuy(property.id, tokenAmt)
        : executeSell(property.id, tokenAmt);
    setLoading(false);
    setAmount("");
    toast({
      title: result.success ? "Trade Executed" : "Trade Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate("/marketplace")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full h-56 rounded-2xl overflow-hidden"
      >
        <img
          src={property.imageUrl}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm border",
              property.type === "Commercial" && "bg-primary/20 text-primary border-primary/30",
              property.type === "Residential" && "bg-gain/20 text-gain border-gain/30",
              property.type === "Mixed-Use" && "bg-warning/20 text-warning border-warning/30",
            )}>
              {property.type}
            </span>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm bg-gain/20 text-gain border border-gain/30 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              Instant Exit
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground">{property.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {property.location}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Price Chart */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-display font-semibold text-foreground">AI Price Simulation</h2>
                <p className="text-xs text-muted-foreground">Real-time AMM pricing with AI adjustments</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  ${property.tokenPrice.toFixed(2)}
                </p>
                <p className={cn("text-sm font-mono", isUp ? "text-gain" : "text-loss")}>
                  {isUp ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
                </p>
              </div>
            </div>
            <PriceChart property={property} height={260} />
          </div>

          {/* Property Details */}
          <div className="card-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-4">Property Details</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{property.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Market Value", value: `$${(property.marketValue / 1_000_000).toFixed(1)}M` },
                { label: "Annual Yield", value: `${property.yield}%`, color: "text-gain" },
                { label: "Square Footage", value: `${property.sqft.toLocaleString()} sq ft` },
                { label: "Year Built", value: property.yearBuilt.toString() },
              ].map((detail) => (
                <div key={detail.label} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{detail.label}</p>
                  <p className={cn("text-sm font-mono font-bold", detail.color ?? "text-foreground")}>{detail.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tokenomics */}
          <div className="card-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-4">Tokenomics</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Total Supply", value: property.totalSupply.toLocaleString() },
                { label: "Available", value: property.availableSupply.toLocaleString() },
                { label: "Circulating", value: (property.totalSupply - property.availableSupply).toLocaleString() },
              ].map((t) => (
                <div key={t.label} className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t.label}</p>
                  <p className="text-sm font-mono font-bold text-foreground">{t.value}</p>
                </div>
              ))}
            </div>
            {/* Supply bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Available supply</span>
                <span>{((property.availableSupply / property.totalSupply) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(property.availableSupply / property.totalSupply) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Trade Panel */}
        <div className="space-y-5">
          {/* Metrics */}
          <div className="card-glass rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground">AI Analytics</h2>
            <AiConfidence score={aiConfScore} />
            <RiskMeter level={property.riskLevel} />
            <LiquidityMeter liquidityPool={property.liquidityPool} marketValue={property.marketValue} />
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Volatility Index</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", property.volatilityIndex > 0.5 ? "bg-loss" : property.volatilityIndex > 0.3 ? "bg-warning" : "bg-gain")}
                    style={{ width: `${property.volatilityIndex * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{(property.volatilityIndex * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Trade Interface */}
          <div className="card-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-4">Trade</h2>

            {/* Buy/Sell toggle */}
            <div className="flex rounded-lg overflow-hidden border border-border mb-4">
              <button
                onClick={() => setTradeType("buy")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                  tradeType === "buy"
                    ? "bg-gain/10 text-gain"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Buy
              </button>
              <button
                onClick={() => setTradeType("sell")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                  tradeType === "sell"
                    ? "bg-loss/10 text-loss"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Sell
              </button>
            </div>

            {/* Holdings info */}
            {holding && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your tokens</span>
                  <span className="font-mono text-foreground">{holding.tokenAmount}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Avg entry</span>
                  <span className="font-mono text-foreground">${holding.averageEntryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Unrealized P/L</span>
                  <span className={cn("font-mono", (property.tokenPrice - holding.averageEntryPrice) >= 0 ? "text-gain" : "text-loss")}>
                    {((property.tokenPrice - holding.averageEntryPrice) / holding.averageEntryPrice * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Amount input */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Token Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all text-sm font-mono"
                />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {[10, 50, 100, 500].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAmount(n.toString())}
                    className="flex-1 py-1 text-[10px] rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Cost breakdown */}
              {tokenAmt > 0 && (
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token price</span>
                    <span className="font-mono">${property.tokenPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">${estimatedValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protocol fee (0.5%)</span>
                    <span className="font-mono text-muted-foreground">-${estimatedFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
                    <span>{tradeType === "buy" ? "Total cost" : "You receive"}</span>
                    <span className="font-mono text-foreground">
                      ${tradeType === "buy"
                        ? (estimatedValue + estimatedFee).toLocaleString("en-US", { minimumFractionDigits: 2 })
                        : (estimatedValue - estimatedFee).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Balance */}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cash balance</span>
                <span className="font-mono">${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>

              <button
                onClick={handleTrade}
                disabled={loading || tokenAmt <= 0}
                className={cn(
                  "w-full py-3 rounded-lg font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40",
                  tradeType === "buy"
                    ? "bg-gain/10 hover:bg-gain/20 text-gain border border-gain/20 hover:border-gain/40"
                    : "bg-loss/10 hover:bg-loss/20 text-loss border border-loss/20 hover:border-loss/40"
                )}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Executing…</>
                ) : (
                  <><Zap className="w-4 h-4" /> {tradeType === "buy" ? "Buy Tokens" : "Sell Tokens"}</>
                )}
              </button>
            </div>
          </div>

          {/* Fee info */}
          <div className="card-glass rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              Simulation Note
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This is a hackathon simulation. All prices are AI-generated using AMM mechanics. No real funds are at risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
