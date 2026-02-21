import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { PriceChart } from "@/components/charts/PriceChart";
import { motion } from "framer-motion";
import { Zap, Lock, Brain } from "lucide-react";

export default function Login() {
  const { login, properties } = useAppStore();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    if (authMode === "register" && !formData.name.trim()) return;
    if (!formData.email.trim() || !formData.password.trim()) return;

    await new Promise((r) => setTimeout(r, 1000));
    login(authMode === "register" ? formData.name : formData.email);
  };

  const featuredProperty = properties[0];

  const last =
    featuredProperty?.priceHistory[
      featuredProperty.priceHistory.length - 2
    ]?.price ?? featuredProperty?.tokenPrice;

  const change =
    featuredProperty && last
      ? ((featuredProperty.tokenPrice - last) / last) * 100
      : 0;

  return (
    <div className="min-h-screen bg-background flex items-center relative overflow-hidden">

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_#00f0ff_1px,_transparent_1px)] bg-[size:40px_40px]" />

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-20 py-16 border-r border-border">

        <div className="max-w-2xl">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-xl text-foreground">
                Liqui-FI
              </span>
              <p className="text-xs text-muted-foreground">
                AI Liquidity Protocol
              </p>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-foreground leading-tight mb-6">
            The Liquidity Layer for
            <br />
            <span className="text-primary">
              Tokenized Real-World Assets.
            </span>
          </h1>

          <p className="text-muted-foreground text-lg mb-14">
            Institutional-grade infrastructure enabling fractional real estate
            liquidity through AI-powered automated market mechanics.
          </p>

          {/* 🔥 REAL DASHBOARD CHART */}
          {featuredProperty && (
            <div className="card-glass rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    AI Price Simulation (30D)
                  </p>
                  <p className="text-3xl font-semibold text-foreground">
                    ${featuredProperty.tokenPrice.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`font-medium ${
                      change >= 0 ? "text-gain" : "text-loss"
                    }`}
                  >
                    {change >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(change).toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    30d change
                  </p>
                </div>
              </div>

              <PriceChart property={featuredProperty} height={300} />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 relative">

        <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-lg bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-12 shadow-[0_0_60px_rgba(0,240,255,0.08)]"
        >

          <h2 className="text-3xl font-semibold text-foreground mb-2">
            Access Protocol
          </h2>

          <p className="text-sm text-muted-foreground mb-8">
            Live trading simulation — explore institutional liquidity mechanics.
          </p>

          {/* Tabs */}
          <div className="relative flex mb-8 border-b border-border">
            {["login", "register"].map((mode) => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode as any)}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  authMode === mode
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "login" ? "Login" : "Register"}
              </button>
            ))}

            <motion.div
              layout
              className="absolute bottom-0 h-[2px] bg-primary w-1/2"
              style={{ left: authMode === "login" ? 0 : "50%" }}
            />
          </div>

          <div className="space-y-5">

            {authMode === "register" && (
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-5 py-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg px-5 py-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg px-5 py-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            />

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-cyan-400 text-black font-semibold text-sm hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-primary/20"
            >
              {authMode === "login"
                ? "Enter Trading Terminal"
                : "Create Account"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => login("Demo User")}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Launch Demo Mode
            </button>
          </div>

          <div className="flex flex-col gap-3 text-xs text-muted-foreground mt-8">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure simulation
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" /> No wallet required
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-3 h-3" /> AI-powered pricing engine
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-10">
            Simulated environment • No real funds • Hackathon prototype
          </p>
        </motion.div>
      </div>
    </div>
  );
}