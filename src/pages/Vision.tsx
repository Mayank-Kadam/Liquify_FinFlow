import { motion } from "framer-motion";
import { Building2, Zap, TrendingUp, Globe, Shield, Users } from "lucide-react";

export default function Vision() {
  const roadmap = [
    { phase: "Phase 1", title: "AI Liquidity Protocol", desc: "AMM-based instant exit for tokenized real estate. AI pricing engine live.", status: "live" },
    { phase: "Phase 2", title: "Cross-Border RWA", desc: "Expand to international markets: Dubai, Singapore, London. Multi-currency pools.", status: "upcoming" },
    { phase: "Phase 3", title: "Institutional LPs", desc: "Institutional liquidity providers with tiered access and enhanced yield structures.", status: "upcoming" },
    { phase: "Phase 4", title: "Rental Yield Distribution", desc: "On-chain rental income distributed automatically to token holders.", status: "future" },
    { phase: "Phase 5", title: "AI Risk Scoring", desc: "Property-level AI risk assessment using satellite data, macro indicators, foot traffic.", status: "future" },
  ];

  const revenue = [
    { stream: "Transaction Fee", value: "0.5%", desc: "Applied to every buy/sell execution" },
    { stream: "Asset Listing Fee", value: "$5K–$25K", desc: "Charged to property originators" },
    { stream: "Liquidity Spread", value: "0.2%", desc: "AMM spread margin retained by protocol" },
    { stream: "Institutional API", value: "$50K+/yr", desc: "Enterprise data & liquidity access" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-3xl text-foreground">Vision & Strategy</h1>
        <p className="text-muted-foreground mt-1">The thesis behind Liqui-FI</p>
      </motion.div>

      {/* Market Problem */}
      <div className="card-glass rounded-xl p-6 space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />The Illiquidity Problem</h2>
        <p className="text-muted-foreground leading-relaxed">Global real estate is a <span className="text-foreground font-semibold">$326 trillion</span> asset class — the world's largest store of value. Yet it remains the least liquid. Selling a property takes <span className="text-foreground font-semibold">60–180 days</span>, involves 5–8% transaction costs, and excludes 99% of investors from premium assets.</p>
        <div className="grid grid-cols-3 gap-4 pt-2">
          {[{ v: "$326T", l: "Global RE Value" }, { v: "180 days", l: "Avg. Exit Time" }, { v: "99%", l: "Investors Excluded" }].map((s) => (
            <div key={s.l} className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-2xl font-display font-bold text-primary font-mono">{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solution */}
      <div className="card-glass rounded-xl p-6 space-y-3">
        <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />The Liqui-FI Solution</h2>
        <p className="text-muted-foreground leading-relaxed">Liqui-FI tokenizes real estate into fungible ERC-20 tokens, backed 1:1 by legal property ownership. An AI-powered Automated Market Maker (AMM) provides <span className="text-foreground font-semibold">instant exit liquidity</span> — no counterparty, no waiting, no gatekeepers. The AI pricing engine dynamically adjusts token prices based on demand, supply, and macro signals.</p>
      </div>

      {/* Roadmap */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Roadmap</h2>
        {roadmap.map((item, i) => (
          <motion.div key={item.phase} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="card-glass rounded-xl p-4 flex items-start gap-4">
            <div className={`px-2 py-1 rounded text-[10px] font-bold flex-shrink-0 ${item.status === "live" ? "bg-gain/10 text-gain" : item.status === "upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {item.status === "live" ? "LIVE" : item.status === "upcoming" ? "NEXT" : "FUTURE"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.phase}: {item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Business Model */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Revenue Streams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {revenue.map((r) => (
            <div key={r.stream} className="card-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground">{r.stream}</p>
                <span className="text-primary font-mono font-bold text-sm">{r.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
