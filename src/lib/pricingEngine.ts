// ─────────────────────────────────────────────────────────────────────────────
// Liqui-FI AI Pricing Engine
// Implements strict AMM + directional pressure pricing model
// ─────────────────────────────────────────────────────────────────────────────

export interface PricingInput {
  currentPrice: number;
  buyVolume: number;      // tokens being bought
  sellVolume: number;     // tokens being sold
  liquidityPoolBalance: number; // total USD in pool
  availableSupply: number;      // tokens available
  totalSupply: number;
  volatilityIndex: number; // 0–1
}

export interface PricingOutput {
  newPrice: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  aiConfidence: number; // 0–100
  liquidityImpact: number; // percentage
  priceChange: number;  // percentage
  ammPrice: number;     // pure AMM price
}

export interface AMMState {
  tokenSupply: number;         // x
  liquidityPoolBalance: number; // y
  k: number;                   // constant product x * y = k
}

/**
 * Core AMM price calculation using constant-product model.
 * price = liquidityPool / availableSupply
 * BUY: supply↓, pool↑ → price↑
 * SELL: supply↑, pool↓ → price↓
 */
export function calculateAMMPrice(state: AMMState): number {
  if (state.tokenSupply <= 0) return 0;
  return state.liquidityPoolBalance / state.tokenSupply;
}

/**
 * Update AMM state after a trade.
 * BUY: user pays USD → pool increases, supply decreases
 * SELL: user receives USD ← pool decreases, supply increases
 */
export function updateAMMState(
  state: AMMState,
  buyVolume: number,
  sellVolume: number,
  tokenPrice: number
): AMMState {
  const buyUSD = buyVolume * tokenPrice;
  const sellUSD = sellVolume * tokenPrice;

  const newSupply = state.tokenSupply - buyVolume + sellVolume;
  const newPool = state.liquidityPoolBalance + buyUSD - sellUSD;

  const safeSupply = Math.max(newSupply, 1);
  const safePool = Math.max(newPool, 1000);

  return {
    tokenSupply: safeSupply,
    liquidityPoolBalance: safePool,
    k: safeSupply * safePool,
  };
}

/**
 * MAIN PRICING FUNCTION — strict AMM + directional pressure
 *
 * Step 1: Net demand ratio → volumeImpact (max ±5%)
 * Step 2: Extra sell depreciation (always negative on sells)
 * Step 3: AMM liquidity model impact
 * Step 4: Volatility noise (tiny)
 * Step 5: Cap total change at ±5%
 * Step 6: newPrice = currentPrice * (1 + totalChange)
 */
export function calculateNewPrice(input: PricingInput): PricingOutput {
  const {
    currentPrice,
    buyVolume,
    sellVolume,
    liquidityPoolBalance,
    availableSupply,
    totalSupply,
    volatilityIndex,
  } = input;

  const totalVolume = buyVolume + sellVolume;

  // ── Step 1: Net demand ratio ──────────────────────────────────────────────
  let demandRatio = 0;
  if (totalVolume > 0) {
    const netDemand = buyVolume - sellVolume;
    demandRatio = netDemand / totalVolume;
  }
  // Scales ±5% based on buy/sell dominance
  const volumeImpact = demandRatio * 0.05;

  // ── Step 2: Extra sell depreciation (ALWAYS negative on sells) ────────────
  let sellImpact = 0;
  if (sellVolume > 0 && availableSupply > 0) {
    // Extra pressure: selling into the pool always tanks price
    sellImpact = -Math.min((sellVolume / availableSupply) * 0.5, 0.03);
  }

  // ── Step 3: AMM liquidity impact ──────────────────────────────────────────
  // Pure AMM price: liquidityPool / supply
  const ammPrice =
    availableSupply > 0 ? liquidityPoolBalance / availableSupply : currentPrice;
  const ammDeviation = (ammPrice - currentPrice) / currentPrice;
  // Pull current price toward AMM price with damping
  const liquidityImpact = ammDeviation * 0.1;

  // ── Step 4: Micro volatility (±0.5% max, random but tiny) ────────────────
  const volatilityImpact =
    (Math.random() - 0.5) * 2 * volatilityIndex * 0.005;

  // ── Step 5: Combine & cap ─────────────────────────────────────────────────
  let totalChange = volumeImpact + sellImpact + liquidityImpact + volatilityImpact;

  // STRICT cap: no single trade moves price more than ±5%
  totalChange = Math.max(-0.05, Math.min(0.05, totalChange));

  // ── Step 6: Final price ───────────────────────────────────────────────────
  const newPrice = Math.max(currentPrice * (1 + totalChange), 0.01);

  // ── Risk Assessment ───────────────────────────────────────────────────────
  const liquidityRatio = liquidityPoolBalance / (availableSupply * currentPrice);
  const priceChangeAbs = Math.abs(totalChange);

  let riskLevel: PricingOutput["riskLevel"];
  if (liquidityRatio < 0.3 || priceChangeAbs > 0.04) {
    riskLevel = "Critical";
  } else if (liquidityRatio < 0.5 || priceChangeAbs > 0.025) {
    riskLevel = "High";
  } else if (liquidityRatio < 0.75 || priceChangeAbs > 0.01) {
    riskLevel = "Medium";
  } else {
    riskLevel = "Low";
  }

  // ── AI Confidence Score ───────────────────────────────────────────────────
  // Higher confidence when liquidity is deep and volatility is low
  const liquidityConfidence = Math.min(liquidityRatio * 60, 60);
  const volatilityPenalty = volatilityIndex * 30;
  const volumeConfidence = totalVolume > 0 ? 10 : 5;
  const aiConfidence = Math.max(
    10,
    Math.min(99, liquidityConfidence + volumeConfidence - volatilityPenalty + 20)
  );

  return {
    newPrice,
    riskLevel,
    aiConfidence: Math.round(aiConfidence),
    liquidityImpact: liquidityImpact * 100,
    priceChange: totalChange * 100,
    ammPrice,
  };
}

/**
 * Background market simulation — gentle drift, NO overriding manual trades.
 * Only runs when no recent user trade (controlled externally via timestamp).
 */
export function simulateMarketDrift(input: {
  currentPrice: number;
  liquidityPoolBalance: number;
  availableSupply: number;
  totalSupply: number;
  volatilityIndex: number;
  appreciationTrend: number; // positive bias, e.g. 0.0002 per tick
}): PricingOutput {
  const {
    currentPrice,
    liquidityPoolBalance,
    availableSupply,
    totalSupply,
    volatilityIndex,
    appreciationTrend,
  } = input;

  // Market drift: appreciation trend + volatility-dependent random walk
  // Higher volatilityIndex = larger price swings
  const baseNoise = (Math.random() - 0.5) * 2; // -1 to 1
  const volatilityNoise = baseNoise * volatilityIndex * 0.025; // INCREASED: scale by volatility much more
  const driftChange = appreciationTrend + volatilityNoise;
  const cappedDrift = Math.max(-0.035, Math.min(0.035, driftChange)); // also widened drift cap
  const newPrice = Math.max(currentPrice * (1 + cappedDrift), 0.01);

  const ammPrice =
    availableSupply > 0 ? liquidityPoolBalance / availableSupply : currentPrice;
  const liquidityRatio = liquidityPoolBalance / (availableSupply * currentPrice);

  let riskLevel: PricingOutput["riskLevel"] = "Low";
  if (liquidityRatio < 0.3) riskLevel = "Critical";
  else if (liquidityRatio < 0.5) riskLevel = "High";
  else if (liquidityRatio < 0.75) riskLevel = "Medium";

  const aiConfidence = Math.max(10, Math.min(99, Math.round(Math.min(liquidityRatio * 60, 60) + 25 - volatilityIndex * 20)));

  return {
    newPrice,
    riskLevel,
    aiConfidence,
    liquidityImpact: 0,
    priceChange: cappedDrift * 100,
    ammPrice,
  };
}

/**
 * Stress test simulation: simulates a "bank run" scenario
 * where 40% of supply is sold in rapid succession.
 */
export function runStressTest(state: {
  currentPrice: number;
  liquidityPoolBalance: number;
  availableSupply: number;
  totalSupply: number;
  volatilityIndex: number;
}): { prices: number[]; finalPrice: number; maxDrawdown: number } {
  const prices: number[] = [state.currentPrice];
  let price = state.currentPrice;
  let pool = state.liquidityPoolBalance;
  let supply = state.availableSupply;

  const stressVolume = state.availableSupply * 0.4;
  const steps = 10;
  const stepSell = stressVolume / steps;

  for (let i = 0; i < steps; i++) {
    const result = calculateNewPrice({
      currentPrice: price,
      buyVolume: 0,
      sellVolume: stepSell,
      liquidityPoolBalance: pool,
      availableSupply: supply,
      totalSupply: state.totalSupply,
      volatilityIndex: Math.min(state.volatilityIndex + i * 0.08, 1),
    });

    // Update state
    supply += stepSell;
    pool -= stepSell * price * 0.95;
    pool = Math.max(pool, 1000);
    price = result.newPrice;
    prices.push(price);
  }

  const maxDrawdown = ((state.currentPrice - Math.min(...prices)) / state.currentPrice) * 100;
  return { prices, finalPrice: price, maxDrawdown };
}
