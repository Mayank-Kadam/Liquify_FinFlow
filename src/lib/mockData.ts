// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — Seeded property data for Liqui-FI
// Realistic real estate assets with tokenomics
// ─────────────────────────────────────────────────────────────────────────────

export type PropertyType = "Commercial" | "Residential" | "Mixed-Use" | "Industrial";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Property {
  id: string;
  name: string;
  location: string;
  type: PropertyType;
  imageUrl: string;
  marketValue: number;       // total USD value
  tokenPrice: number;        // current price per token
  totalSupply: number;       // total tokens ever
  availableSupply: number;   // tokens in pool (for sale)
  liquidityPool: number;     // USD in liquidity pool
  volatilityIndex: number;   // 0–1
  appreciationTrend: number; // daily drift e.g. 0.0002
  description: string;
  yield: number;             // annual yield %
  sqft: number;
  yearBuilt: number;
  riskLevel: RiskLevel;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyName: string;
  type: "buy" | "sell";
  tokenAmount: number;
  tokenPrice: number;
  totalValue: number;
  fee: number;
  timestamp: number;
  aiConfidence: number;
}

export interface PortfolioHolding {
  propertyId: string;
  tokenAmount: number;
  averageEntryPrice: number;
  purchasedAt: number;
}

// Generate realistic 30-day price history
function generatePriceHistory(basePrice: number, volatility: number, trend: number): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * 0.9; // start 10% lower
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 30; i >= 0; i--) {
    const change = trend + (Math.random() - 0.48) * volatility * 0.04;
    price = price * (1 + change);
    points.push({
      timestamp: now - i * dayMs,
      price: parseFloat(price.toFixed(4)),
    });
  }

  return points;
}

export const PROPERTIES: Property[] = [
  {
    id: "prop-001",
    name: "One World Plaza Tower",
    location: "Manhattan, New York",
    type: "Commercial",
    imageUrl:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop",
    marketValue: 4_800_000,
    tokenPrice: 48.0,
    totalSupply: 100_000,
    availableSupply: 62_000,
    liquidityPool: 2_976_000,
    volatilityIndex: 0.28,
    appreciationTrend: 0.00025,
    description:
      "Premium Class-A office tower in the heart of Midtown Manhattan. LEED Gold certified with 98% occupancy. Anchored by Fortune 500 tenants.",
    yield: 5.8,
    sqft: 85_000,
    yearBuilt: 2019,
    riskLevel: "Low",
    priceHistory: generatePriceHistory(48.0, 0.28, 0.00025),
  },
  {
    id: "prop-002",
    name: "Azure Beachfront Residences",
    location: "Miami Beach, Florida",
    type: "Residential",
    imageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&auto=format&fit=crop",
    marketValue: 2_200_000,
    tokenPrice: 22.0,
    totalSupply: 100_000,
    availableSupply: 71_000,
    liquidityPool: 1_562_000,
    volatilityIndex: 0.42,
    appreciationTrend: 0.0003,
    description:
      "Luxury oceanfront condominiums with panoramic Atlantic views. Short-term rental approved. 92% occupancy with premium Airbnb positioning.",
    yield: 7.2,
    sqft: 42_000,
    yearBuilt: 2021,
    riskLevel: "Medium",
    priceHistory: generatePriceHistory(22.0, 0.42, 0.0003),
  },
  {
    id: "prop-003",
    name: "Innovation Hub SF",
    location: "SoMa, San Francisco",
    type: "Commercial",
    imageUrl:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80&auto=format&fit=crop",
    marketValue: 3_600_000,
    tokenPrice: 36.0,
    totalSupply: 100_000,
    availableSupply: 55_000,
    liquidityPool: 1_980_000,
    volatilityIndex: 0.52,
    appreciationTrend: 0.0002,
    description:
      "State-of-the-art tech campus in Silicon Valley's urban core. Home to 12 venture-backed startups. Flexible co-working + private office model.",
    yield: 6.1,
    sqft: 68_000,
    yearBuilt: 2020,
    riskLevel: "Medium",
    priceHistory: generatePriceHistory(36.0, 0.52, 0.0002),
  },
  {
    id: "prop-004",
    name: "Rainey Street Mixed-Use",
    location: "Austin, Texas",
    type: "Mixed-Use",
    imageUrl:
      "https://images.unsplash.com/photo-1467293622093-9f15c96be70f?w=800&q=80&auto=format&fit=crop",
    marketValue: 1_850_000,
    tokenPrice: 18.5,
    totalSupply: 100_000,
    availableSupply: 78_000,
    liquidityPool: 1_443_000,
    volatilityIndex: 0.38,
    appreciationTrend: 0.00035,
    description:
      "Vibrant mixed-use development on Austin's hottest entertainment corridor. Ground-floor retail with 48 luxury apartments above. 100% leased.",
    yield: 8.3,
    sqft: 38_000,
    yearBuilt: 2022,
    riskLevel: "Low",
    priceHistory: generatePriceHistory(18.5, 0.38, 0.00035),
  },
  {
    id: "prop-005",
    name: "Lakeview Executive Towers",
    location: "Chicago, Illinois",
    type: "Residential",
    imageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80&auto=format&fit=crop",
    marketValue: 2_900_000,
    tokenPrice: 29.0,
    totalSupply: 100_000,
    availableSupply: 64_000,
    liquidityPool: 1_856_000,
    volatilityIndex: 0.31,
    appreciationTrend: 0.00018,
    description:
      "Iconic residential towers overlooking Lake Michigan. Premium amenities including rooftop infinity pool, concierge, and EV charging. 96% occupied.",
    yield: 5.4,
    sqft: 72_000,
    yearBuilt: 2018,
    riskLevel: "Low",
    priceHistory: generatePriceHistory(29.0, 0.31, 0.00018),
  },
  {
    id: "prop-006",
    name: "Sunset Boulevard Commercial",
    location: "West Hollywood, Los Angeles",
    type: "Commercial",
    imageUrl:
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80&auto=format&fit=crop",
    marketValue: 5_200_000,
    tokenPrice: 52.0,
    totalSupply: 100_000,
    availableSupply: 48_000,
    liquidityPool: 2_496_000,
    volatilityIndex: 0.65,
    appreciationTrend: 0.00028,
    description:
      "Iconic Class-A retail and creative office complex on legendary Sunset Strip. Media & entertainment tenant mix. Trophy asset with institutional backing.",
    yield: 4.9,
    sqft: 95_000,
    yearBuilt: 2017,
    riskLevel: "High",
    priceHistory: generatePriceHistory(52.0, 0.65, 0.00028),
  },
];

export const INITIAL_HOLDINGS: PortfolioHolding[] = [
  { propertyId: "prop-001", tokenAmount: 150, averageEntryPrice: 44.5, purchasedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 },
  { propertyId: "prop-002", tokenAmount: 300, averageEntryPrice: 19.8, purchasedAt: Date.now() - 21 * 24 * 60 * 60 * 1000 },
  { propertyId: "prop-004", tokenAmount: 500, averageEntryPrice: 16.2, purchasedAt: Date.now() - 14 * 24 * 60 * 60 * 1000 },
];

export interface Offering {
  id: string;
  name: string;
  location: string;
  propertyType: PropertyType;
  valuation: number;
  totalTokens: number;
  tokenPrice: number;
  tokensSold: number;
  capitalRaised: number;
  status: "live";
  imageUrl: string;
}

const OFFERING_IMAGES: Record<PropertyType, string> = {
  Commercial: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop",
  Residential: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop",
  "Mixed-Use": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop",
  Industrial: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800&q=80&auto=format&fit=crop",
};

export function getOfferingImage(type: PropertyType): string {
  return OFFERING_IMAGES[type] || OFFERING_IMAGES.Commercial;
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-001",
    propertyId: "prop-001",
    propertyName: "One World Plaza Tower",
    type: "buy",
    tokenAmount: 150,
    tokenPrice: 44.5,
    totalValue: 6675,
    fee: 33.38,
    timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    aiConfidence: 87,
  },
  {
    id: "tx-002",
    propertyId: "prop-002",
    propertyName: "Azure Beachfront Residences",
    type: "buy",
    tokenAmount: 300,
    tokenPrice: 19.8,
    totalValue: 5940,
    fee: 29.7,
    timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
    aiConfidence: 73,
  },
  {
    id: "tx-003",
    propertyId: "prop-004",
    propertyName: "Rainey Street Mixed-Use",
    type: "buy",
    tokenAmount: 500,
    tokenPrice: 16.2,
    totalValue: 8100,
    fee: 40.5,
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    aiConfidence: 91,
  },
  {
    id: "tx-004",
    propertyId: "prop-001",
    propertyName: "One World Plaza Tower",
    type: "sell",
    tokenAmount: 50,
    tokenPrice: 46.8,
    totalValue: 2340,
    fee: 11.7,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    aiConfidence: 78,
  },
];
