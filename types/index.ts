// --- Coin ---
export type RawCoin = {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  current_price: number
  price_change_percentage_24h: number
  image: string
}

export type ScoredCoin = RawCoin & {
  sentiment_score: number
  sentiment_summary: string
}

// --- Article ---
export type RawArticle = {
  id: string
  title: string
  url: string
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

export type ArticleCardProps = {
  title: string
  url: string
  source: string
  published_at: string
  sentiment_score: number
  sentiment_summary: string
}

// --- Sentiment Score ---
export type LLMScoreResponse = {
  score: number                           // 1–10
  summary: string
}

export type StoredScore = {
  article_id: string
  score: number
  summary: string
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