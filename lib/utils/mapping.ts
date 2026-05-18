import { SentimentLabel, NewsFetchPeriod } from "@/types"

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

export const getSentimentLabel = (score: number): SentimentLabel => {
  void score
  // TODO
  return "Neutral"
}
