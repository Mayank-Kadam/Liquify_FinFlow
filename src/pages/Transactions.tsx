import { useAppStore } from "@/store/appStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Receipt } from "lucide-react";

export default function Transactions() {
  const { transactions } = useAppStore();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{transactions.length} total transactions</p>
      </motion.div>

      <div className="card-glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span>Type</span>
          <span className="col-span-2">Property</span>
          <span>Tokens / Price</span>
          <span>Total Value</span>
          <span>Date</span>
        </div>
        {transactions.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No transactions yet.</p>
          </div>
        ) : (
          transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-6 gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/10 transition-colors items-center"
            >
              <div>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded",
                  tx.type === "buy" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                )}>
                  {tx.type.toUpperCase()}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-foreground">{tx.propertyName}</p>
                <p className="text-[10px] text-muted-foreground font-mono">AI Conf: {tx.aiConfidence}%</p>
              </div>
              <div>
                <p className="text-xs font-mono text-foreground">{tx.tokenAmount} tokens</p>
                <p className="text-[10px] text-muted-foreground font-mono">@ ${tx.tokenPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className={cn("text-sm font-mono font-semibold", tx.type === "buy" ? "text-loss" : "text-gain")}>
                  {tx.type === "buy" ? "-" : "+"}${tx.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Fee: ${tx.fee.toFixed(2)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
