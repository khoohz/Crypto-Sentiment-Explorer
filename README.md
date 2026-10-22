# Crypto Sentiment Explorer

An unlaunched personal project for exploring recent cryptocurrency news sentiment across ten predefined large-cap coins. The app retrieves news from MarketAux and market context from CoinGecko, uses Claude Haiku to classify each article’s sentiment and produce a short takeaway, then combines those classifications with deterministic weighting and recency decay.

This is an exploratory information tool, **not financial advice** and not a trading or prediction system.

## What it does

- Shows a filterable news feed for BTC, ETH, BNB, XRP, SOL, DOGE, TRX, ADA, LINK, and BCH.
- Retrieves up to three recent English-language MarketAux articles per coin and persists Claude-generated article scores/takeaways.
- Calculates coin sentiment with: `Σ(sentiment × impact weight × time decay) / Σ(impact weight × time decay)`.
- Uses hard-coded source, title-prominence, and article-length factors for impact weight; time decay is `e^(-λ × days ago)`.
- Exposes JSON endpoints at `/api/news`, `/api/coins`, and `/api/coin/[id]`; the home page contains a sentiment heatmap and `/news` contains the filterable feed.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, TanStack React Query, Recharts, Prisma 7, PostgreSQL, Anthropic Claude, MarketAux, and CoinGecko.

## Run locally

### Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database reachable both through a pooled runtime URL and a direct migration URL
- Anthropic and MarketAux API credentials

### Setup

```bash
npm install
cp .env.local.example .env
```

Fill in the values in `.env`. It is intentionally ignored and must never be committed.

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The news feed is available at `/news`.

Run local checks before opening a pull request or publishing changes:

```bash
npm run lint
npm exec tsc -- --noEmit
npm run build
```

## Configuration

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection used by Prisma at runtime. |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection used by Prisma schema commands. |
| `ANTHROPIC_API_KEY` | Yes | Credentials for Claude article classification. |
| `MARKETAUX_API_KEY` | Yes | Credentials for MarketAux news retrieval. |
| `MARKETAUX_NEWS_API_URL` | Yes | MarketAux API base URL, normally `https://api.marketaux.com/v1/news`. |

`COINGECKO_API_KEY` is not currently used by the application. CoinGecko market data is retrieved from its public markets endpoint.

## Architecture

```text
React UI (React Query) → Next.js route handlers → services
                                              ├─ MarketAux news
                                              ├─ CoinGecko market data
                                              └─ Claude article scoring
                                                       ↓
                                           Prisma + PostgreSQL
                                           ArticleScore / Cache
```

`ArticleScore` caches a Claude score and takeaway by article identifier. `Cache` holds short-lived JSON/string values: five minutes for CoinGecko market data and fifteen minutes for aggregate score/summary results. Coin aggregate scores are recomputed from the available article scores when their cache expires because time decay changes as articles age.

## Known limitations

- The LLM integration is a single-prompt classification step, not model training, RAG, or an agent workflow.
- Source weights and the BTC adjustment coefficient are product heuristics; they are not validated financial signals.
- The project currently has no automated test suite, background job runner, authentication, rate limit, deployment configuration, or formal LLM evaluation/observability.
- The dashboard is intentionally minimal and remains under active refinement.

## Security

Never commit `.env`, database URLs, or API keys. If a credential has ever been committed, rotate it with the provider before publishing the repository. Server logs must not contain request URLs with secret query parameters.
