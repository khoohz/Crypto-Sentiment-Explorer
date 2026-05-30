import { SentimentLabel, NewsFetchPeriod, CoinSymbol } from "@/types"

export const formatPeriod = (period: NewsFetchPeriod): string => {
  const date = new Date();

  const periodDays: Record<NewsFetchPeriod, number> = {
    '24h': 1,
    '7d': 7,
    '30d': 30
  }

  date.setDate(date.getDate() - periodDays[period])

  return date.toISOString().split('T')[0];
}

export const formatTimeAgo = (publishedAt: Date): string => {
  const diffMs = Date.now() - publishedAt.getTime()

  if (diffMs < 0) {
    return "just now"
  }

  const msPerMinute = 1000 * 60
  const msPerHour = 1000 * 60 * 60
  const msPerDay = msPerHour * 24

  if (diffMs < msPerHour) {
    const minutes = Math.max(1, Math.floor(diffMs / msPerMinute))
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
  }

  if (diffMs < msPerDay) {
    const hours = Math.max(1, Math.floor(diffMs / msPerHour))
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  }

  const days = Math.floor(diffMs / msPerDay)
  return days === 1 ? "1 day ago" : `${days} days ago`
}

export const mapCoinNames: Record<CoinSymbol, { name: string; ticker: string }> = {
  'btc': { name: 'Bitcoin',      ticker: 'BTC' },
  'eth': { name: 'Ethereum',     ticker: 'ETH' },
  'bnb': { name: 'Binance Coin', ticker: 'BNB' },
  'xrp': { name: 'Ripple',       ticker: 'XRP' },
  'sol': { name: 'Solana',       ticker: 'SOL' },
  'doge': { name: 'Dogecoin',    ticker: 'DOGE' },
  'trx': { name: 'TRON',         ticker: 'TRX' },
  'ada': { name: 'Cardano',      ticker: 'ADA' },
  'link': { name: 'Chainlink',   ticker: 'LINK' },
  'bch': { name: 'Bitcoin Cash', ticker: 'BCH' },
}

export const getSentimentLabel = (score: number): SentimentLabel => {
  if (score >= 7) {
    return "Bullish"
  } else if (score <=3) {
    return "Bearish"
  }
  return "Neutral"
}
