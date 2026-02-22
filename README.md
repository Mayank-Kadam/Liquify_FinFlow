# Liqui-FI  
### AI-Powered Instant Liquidity for Tokenized Real Estate

Liqui-FI is a production-grade simulation platform that demonstrates how real-world real estate assets can be tokenized and traded with instant liquidity using an AI-powered Automated Market Maker (AMM).

This project was built to simulate institutional-grade real estate tokenization with dynamic pricing, liquidity pools, and structured token issuance.

---

##  Overview

Real estate is one of the largest asset classes globally, yet it remains highly illiquid and capital-intensive.

Liqui-FI solves this by enabling:

- Fractional real estate ownership
- Instant buy & sell via AMM
- AI-driven dynamic pricing
- IPO-style asset issuance
- Real-time portfolio tracking

---

##  Core Features

### Primary Asset Issuance
- Property owners tokenize assets
- 80% public allocation (investor sale)
- 20% liquidity allocation (AMM reserve)
- Automatic transition to secondary market

###  Automated Market Maker (AMM)
Implements constant-product liquidity logic:

Where:
- x = available token supply
- y = liquidity pool balance

Buy → Supply decreases → Price increases  
Sell → Supply increases → Price decreases  

Strict directional enforcement ensures:
- Buy always increases price
- Sell always decreases price
- ±5% movement cap per transaction

---

###  AI Pricing Engine

Unified pricing model includes:

- Net demand ratio impact
- Sell pressure adjustment
- Liquidity stress modifier
- Volatility coefficient
- Stability guard
- AI confidence score

All pricing flows through a single calculation engine to avoid contradictory logic.

---

###  Institutional Dashboard

- Portfolio tracking
- Unrealized P/L
- Liquidity depth meter
- Risk indicator
- AI confidence score
- Animated price charts
- Transaction history

---

##  Architecture

**Frontend**
- React
- TypeScript
- TailwindCSS
- Recharts
- Framer Motion

**State Management**
- Zustand

**Pricing Logic**
- Custom AMM engine
- AI-based dynamic pricing model
- Unified calculation pipeline

---

##  Token Lifecycle

1. Asset is issued via primary offering  
2. 80% tokens sold to investors  
3. 20% tokens seeded into liquidity pool  
4. Asset transitions to secondary AMM trading  
5. Investors trade instantly with dynamic pricing  

---

##  Business Model

- 0.5% transaction fee
- Asset listing fee
- Liquidity spread margin
- Institutional integration (future roadmap)

---

##  Run Locally

```bash
npm install
npm run dev