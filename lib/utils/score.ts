// Aggregation math, time decay, BTC adjustment
import { NewsFetchPeriod, ScoredArticle } from "@/types"

const articleSource: Record<string, number> = {
  'Bitcoin.com': 1,
  'U.today': 0.8,
  'CoinDesk': 0.8,
  'Cointelegraph': 0.8,
  'Cointribune': 0.7,
  'Benzinga': 0.7
}

const coinNames: Record<string, string[]> = {
  'btc': ['Bitcoin', 'BTC'],
  'eth': ['Ethereum', 'ETH'],
  'bnb': ['BNB', 'Binance Coin'],
  'xrp': ['XRP', 'Ripple'],
  'sol': ['Solana', 'SOL'],
  'doge': ['Dogecoin', 'DOGE'],
  'trx': ['TRON', 'TRX'],
  'ada': ['Cardano', 'ADA'],
  'link': ['Chainlink', 'LINK'],
  'bch': ['Bitcoin Cash', 'BCH']
}

export const computeImpactWeight = (source: string, title: string, body: string, coinId: string): number => {
  // impact_weight = source_weight × prominence_multiplier × length_factor
  const sourceWeight = articleSource[source] ?? 0.5

  const coinVariants = coinNames[coinId] ?? [coinId]
  const prominenceMultiplier = coinVariants.some(name => title.includes(name)) ? 1.2 : 1.0

  const wordCount = body.trim().split(/\s+/).filter((word) => word !== "").length
  const lengthFactor = Math.min(wordCount / 500, 1.5)
  const impactWeight = sourceWeight * prominenceMultiplier * lengthFactor
  return impactWeight
}

// // aggregate score of a specific coins based on articles related
const lambda: Record<NewsFetchPeriod, number> = {
  '24h': 0.5,
  '7d': 0.2,
  '30d': 0.05
}

export const computeCoinScore = (articles: ScoredArticle[], period: NewsFetchPeriod): number => {
  // Coin Score = Σ(sentiment × impact_weight × time_decay) / Σ(impact_weight × time_decay)
  // time_decay = e^(-λ × days_ago)
  if (articles.length === 0) return 0
  
  let totalwithSentiment: number = 0;
  let totalWithoutSentiment : number = 0;

  articles.forEach((article) => {
    const daysAgo = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24)
    const timeDecay = Math.exp(-lambda[period] * daysAgo)
    totalwithSentiment += article.sentiment_score * article.impact_weight * timeDecay
    totalWithoutSentiment += article.impact_weight * timeDecay
  });

  const coinScore = totalwithSentiment / totalWithoutSentiment;
  return coinScore
}

export const computeBtcAdjustmentScore = (coinScore: number, btcScore: number): number => {
  return coinScore - (0.6 * btcScore)
}