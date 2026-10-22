// --- Coin ---
export type RawCoin = {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  current_price: number
  price_change_24h: number
  image: string
}

export type ScoredCoin = RawCoin & {
  sentiment_score: number
  sentiment_summary: string
}

export type CoinScoreResult = {
  coin_id: string
  sentiment_score: number
  btc_adjusted_score: number
  sentiment_summary: string
  image: string
  current_price: number
  price_change_24h: number
}

// --- Article ---
export type RawArticle = {
  id: string
  title: string
  url: string
  image_url?: string
  source: string
  published_at: string
  body?: string
  coin_id: string
}

export type ScoredArticle = RawArticle & {
  sentiment_score: number
  sentiment_summary: string
  impact_weight: number
}

// --- Sentiment Score ---
export type LLMScoreResponse = {
  score: number                           // 1–10
  takeaway: string                        // one-line key takeaway
}

export type StoredScore = {
  article_id: string
  score: number
  takeaway: string                       // one-line key takeaway
  created_at: Date
}

// --- Cache ---
export type CacheEntry = {
  key: string
  value: string                           // JSON stringified
  expires_at: Date
}


// --- Sentiment Label ---
export type SentimentLabel = "Bearish" | "Neutral" | "Bullish"

export type NewsFetchPeriod = '24h' | '7d' | '30d'

// --- Coins ---
export const TOP_10_COINS = ['btc', 'eth', 'bnb', 'xrp', 'sol', 'doge', 'trx', 'ada', 'link', 'bch'] as const
export type CoinSymbol = typeof TOP_10_COINS[number]
