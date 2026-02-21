import { create } from "zustand";
import {
  Property,
  Transaction,
  PortfolioHolding,
  Offering,
  PROPERTIES,
  INITIAL_HOLDINGS,
  INITIAL_TRANSACTIONS,
  type PropertyType,
} from "@/lib/mockData";
import {
  calculateNewPrice,
  simulateMarketDrift,
  updateAMMState,
} from "@/lib/pricingEngine";
import { ethers } from "ethers";

interface AppUser {
  name: string;
  address: string;
  balance: number;
  isAuthenticated: boolean;
}

interface AppState {
  user: AppUser;
  properties: Property[];
  holdings: PortfolioHolding[];
  transactions: Transaction[];
  offerings: Offering[];
  isDemo: boolean;
  institutionalMode: boolean;
  lastTradeTimestamp: Record<string, number>;

  login: (name: string) => void;
  logout: () => void;

  executeBuy: (propertyId: string, tokenAmount: number) => {
    success: boolean;
    message: string;
  };
  executeSell: (propertyId: string, tokenAmount: number) => {
    success: boolean;
    message: string;
  };

  tickMarket: () => void;

  createOffering: (data: {
    name: string;
    location: string;
    propertyType: PropertyType;
    valuation: number;
    totalTokens: number;
    tokenPrice: number;
    imageUrl: string;
  }) => void;

  simulateDemand: (offeringId: string, amount: number) => void;
  completeOffering: (offeringId: string) => void;

  toggleDemoMode: () => void;
  toggleInstitutionalMode: () => void;
}

function generateWalletAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: {
    name: "",
    address: "",
    balance: 50_000,
    isAuthenticated: false,
  },

  properties: PROPERTIES,
  holdings: INITIAL_HOLDINGS,
  transactions: INITIAL_TRANSACTIONS,
  offerings: [],
  isDemo: false,
  institutionalMode: false,
  lastTradeTimestamp: {},

  login: (name) =>
    set((state) => ({
      user: {
        ...state.user,
        name,
        address: generateWalletAddress(),
        isAuthenticated: true,
      },
    })),

  logout: () =>
    set((state) => ({
      user: { ...state.user, isAuthenticated: false, name: "", address: "" },
    })),

  // ===========================
  // TRADING
  // ===========================

  executeBuy: (propertyId, tokenAmount) => {
    const { user, properties, holdings, transactions } = get();
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return { success: false, message: "Property not found" };
    if (tokenAmount <= 0) return { success: false, message: "Invalid amount" };
    if (tokenAmount > property.availableSupply)
      return { success: false, message: "Insufficient token supply" };

    const totalCost = tokenAmount * property.tokenPrice;
    const fee = totalCost * 0.005;
    const totalWithFee = totalCost + fee;

    if (user.balance < totalWithFee)
      return { success: false, message: "Insufficient balance" };

    const pricingResult = calculateNewPrice({
      currentPrice: property.tokenPrice,
      buyVolume: tokenAmount,
      sellVolume: 0,
      liquidityPoolBalance: property.liquidityPool,
      availableSupply: property.availableSupply,
      totalSupply: property.totalSupply,
      volatilityIndex: property.volatilityIndex,
    });

    const newAMM = updateAMMState(
      {
        tokenSupply: property.availableSupply,
        liquidityPoolBalance: property.liquidityPool,
        k: property.availableSupply * property.liquidityPool,
      },
      tokenAmount,
      0,
      property.tokenPrice
    );

    const newHistory = [
      ...property.priceHistory,
      { timestamp: Date.now(), price: pricingResult.newPrice },
    ].slice(-60);

    const updatedProperties = properties.map((p) =>
      p.id === propertyId
        ? {
            ...p,
            tokenPrice: pricingResult.newPrice,
            availableSupply: newAMM.tokenSupply,
            liquidityPool: newAMM.liquidityPoolBalance,
            riskLevel: pricingResult.riskLevel,
            priceHistory: newHistory,
          }
        : p
    );

    const existingHolding = holdings.find((h) => h.propertyId === propertyId);
    let updatedHoldings: PortfolioHolding[];

    if (existingHolding) {
      const totalTokens = existingHolding.tokenAmount + tokenAmount;
      const avgPrice =
        (existingHolding.tokenAmount * existingHolding.averageEntryPrice +
          totalCost) /
        totalTokens;

      updatedHoldings = holdings.map((h) =>
        h.propertyId === propertyId
          ? { ...h, tokenAmount: totalTokens, averageEntryPrice: avgPrice }
          : h
      );
    } else {
      updatedHoldings = [
        ...holdings,
        {
          propertyId,
          tokenAmount,
          averageEntryPrice: property.tokenPrice,
          purchasedAt: Date.now(),
        },
      ];
    }

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      propertyId,
      propertyName: property.name,
      type: "buy",
      tokenAmount,
      tokenPrice: property.tokenPrice,
      totalValue: totalCost,
      fee,
      timestamp: Date.now(),
      aiConfidence: pricingResult.aiConfidence,
    };

    set({
      properties: updatedProperties,
      holdings: updatedHoldings,
      transactions: [tx, ...transactions],
      user: { ...user, balance: user.balance - totalWithFee },
      lastTradeTimestamp: {
        ...get().lastTradeTimestamp,
        [propertyId]: Date.now(),
      },
    });

    return { success: true, message: "Purchase successful" };
  },

  executeSell: (propertyId, tokenAmount) => {
    const { user, properties, holdings, transactions } = get();
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return { success: false, message: "Property not found" };

    const holding = holdings.find((h) => h.propertyId === propertyId);
    if (!holding || holding.tokenAmount < tokenAmount)
      return { success: false, message: "Insufficient tokens" };

    const totalValue = tokenAmount * property.tokenPrice;
    const fee = totalValue * 0.005;
    const netReceived = totalValue - fee;

    const pricingResult = calculateNewPrice({
      currentPrice: property.tokenPrice,
      buyVolume: 0,
      sellVolume: tokenAmount,
      liquidityPoolBalance: property.liquidityPool,
      availableSupply: property.availableSupply,
      totalSupply: property.totalSupply,
      volatilityIndex: property.volatilityIndex,
    });

    const newAMM = updateAMMState(
      {
        tokenSupply: property.availableSupply,
        liquidityPoolBalance: property.liquidityPool,
        k: property.availableSupply * property.liquidityPool,
      },
      0,
      tokenAmount,
      property.tokenPrice
    );

    const newHistory = [
      ...property.priceHistory,
      { timestamp: Date.now(), price: pricingResult.newPrice },
    ].slice(-60);

    const updatedProperties = properties.map((p) =>
      p.id === propertyId
        ? {
            ...p,
            tokenPrice: pricingResult.newPrice,
            availableSupply: newAMM.tokenSupply,
            liquidityPool: newAMM.liquidityPoolBalance,
            riskLevel: pricingResult.riskLevel,
            priceHistory: newHistory,
          }
        : p
    );

    const updatedHoldings =
      holding.tokenAmount === tokenAmount
        ? holdings.filter((h) => h.propertyId !== propertyId)
        : holdings.map((h) =>
            h.propertyId === propertyId
              ? { ...h, tokenAmount: h.tokenAmount - tokenAmount }
              : h
          );

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      propertyId,
      propertyName: property.name,
      type: "sell",
      tokenAmount,
      tokenPrice: property.tokenPrice,
      totalValue,
      fee,
      timestamp: Date.now(),
      aiConfidence: pricingResult.aiConfidence,
    };

    set({
      properties: updatedProperties,
      holdings: updatedHoldings,
      transactions: [tx, ...transactions],
      user: { ...user, balance: user.balance + netReceived },
      lastTradeTimestamp: {
        ...get().lastTradeTimestamp,
        [propertyId]: Date.now(),
      },
    });

    return { success: true, message: "Sale successful" };
  },

  // ===========================
  // ISSUANCE
  // ===========================

  createOffering: (data) => {
    const id = `offering-${Date.now()}`;
    const offering: Offering & { onchainId?: string } = {
      id,
      name: data.name,
      location: data.location,
      propertyType: data.propertyType,
      valuation: data.valuation,
      totalTokens: data.totalTokens,
      tokenPrice: data.tokenPrice,
      tokensSold: 0,
      capitalRaised: 0,
      status: "live",
      imageUrl: data.imageUrl, // 🔥 now using uploaded image
      onchainId: ethers.id(id),
    };

    set((s) => ({ offerings: [...s.offerings, offering] }));

    // Try to notify local dev server so bots can discover offerings.
    // This runs in the browser; failures are ignored (server optional).
    try {
      const serverUrl = (import.meta.env.VITE_OFFERS_SERVER as string) || "http://127.0.0.1:3001/offerings";
      // fire-and-forget
      fetch(serverUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offering.id, onchainId: offering.onchainId }),
      }).catch(() => {});
    } catch (e) {
      // ignore in non-browser environments
    }
  },

  simulateDemand: (offeringId, amount) => {
    const { offerings } = get();
    const offering = offerings.find((o) => o.id === offeringId);
    if (!offering) return;

    const remaining = offering.totalTokens - offering.tokensSold;
    const bought = Math.min(amount, remaining);
    const newSold = offering.tokensSold + bought;
    const newCapital = newSold * offering.tokenPrice;

    set({
      offerings: offerings.map((o) =>
        o.id === offeringId
          ? { ...o, tokensSold: newSold, capitalRaised: newCapital }
          : o
      ),
    });

    if (newSold >= offering.totalTokens) {
      setTimeout(() => get().completeOffering(offeringId), 600);
    }
  },

  completeOffering: (offeringId) => {
    const { offerings, properties, user } = get();
    const offering = offerings.find((o) => o.id === offeringId);
    if (!offering) return;

    const publicTokens = Math.floor(offering.totalTokens * 0.8);
    const liquidityTokens = offering.totalTokens - publicTokens;

    const publicCapital = publicTokens * offering.tokenPrice;
    const liquidityCapital = liquidityTokens * offering.tokenPrice;

    const now = Date.now();

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      name: offering.name,
      location: offering.location,
      type: offering.propertyType,
      imageUrl: offering.imageUrl,
      marketValue: offering.valuation,
      tokenPrice: offering.tokenPrice,
      totalSupply: offering.totalTokens,
      availableSupply: liquidityTokens,
      liquidityPool: liquidityCapital,
      volatilityIndex: 0.3,
      appreciationTrend: 0.00025,
      description: `Newly tokenized ${offering.propertyType.toLowerCase()} asset in ${offering.location}.`,
      yield: 6.0,
      sqft: 50000,
      yearBuilt: 2024,
      riskLevel: "Medium",
      priceHistory: [
        { timestamp: now, price: offering.tokenPrice },
      ],
    };

    set({
      offerings: offerings.filter((o) => o.id !== offeringId),
      properties: [...properties, newProperty],
      user: { ...user, balance: user.balance + publicCapital },
    });
  },

  tickMarket: () => {
    const { properties, lastTradeTimestamp } = get();
    const now = Date.now();
    const TRADE_PAUSE_MS = 3000;

    const updated = properties.map((property) => {
      const lastTrade = lastTradeTimestamp[property.id] || 0;
      if (now - lastTrade < TRADE_PAUSE_MS) return property;

      const result = simulateMarketDrift({
        currentPrice: property.tokenPrice,
        liquidityPoolBalance: property.liquidityPool,
        availableSupply: property.availableSupply,
        totalSupply: property.totalSupply,
        volatilityIndex: property.volatilityIndex,
        appreciationTrend: property.appreciationTrend,
      });

      return {
        ...property,
        tokenPrice: result.newPrice,
        riskLevel: result.riskLevel,
        priceHistory: [
          ...property.priceHistory,
          { timestamp: now, price: result.newPrice },
        ].slice(-60),
      };
    });

    set({ properties: updated });
  },

  toggleDemoMode: () => set((s) => ({ isDemo: !s.isDemo })),
  toggleInstitutionalMode: () =>
    set((s) => ({ institutionalMode: !s.institutionalMode })),
}));