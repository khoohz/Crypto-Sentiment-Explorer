// GET /api/news

import { getArticleScore, saveArticleScore } from "@/lib/db/articles"
import { scoreArticle } from "@/lib/service/claude"
import { fetchCoinNews } from "@/lib/service/coingecko"
import { computeImpactWeight } from "@/lib/utils/score"
import { NewsFetchPeriod, ScoredArticle } from "@/types"
import { NextResponse } from "next/server"

const TOP_10_COINS = ['btc', 'eth', 'bnb', 'xrp', 'sol', 'doge', 'trx', 'ada', 'link', 'bch']

const fetchCoinsNews = async(coin: string, period: NewsFetchPeriod) => {
  const scoredArticles: ScoredArticle[] = []

  const articles = await fetchCoinNews(coin, period)
  for (const article of articles) {
    const articleScore = await getArticleScore(article.id)
    if (!articleScore) {
      const llmScore = await scoreArticle(coin, article.title, article.body ?? "")
      await saveArticleScore(article.id, llmScore.score, llmScore.takeaway)
      const impactWeight = computeImpactWeight(article.source, article.title, article.body ?? "", article.coin_id)
      scoredArticles.push({
        ...article,
        sentiment_score: llmScore.score,
        sentiment_summary: llmScore.takeaway,
        impact_weight: impactWeight
      })
    } else {
      const impactWeight = computeImpactWeight(article.source, article.title, article.body ?? "", article.coin_id)
      scoredArticles.push({
        ...article,
        sentiment_score: articleScore.score,
        sentiment_summary: articleScore.takeaway,
        impact_weight: impactWeight
      })
    }
  } 
  return scoredArticles
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get("period") ?? '24h') as NewsFetchPeriod
  const coin = (searchParams.get("coin") ?? '') 

  let scoredArticles: ScoredArticle[] = []
  if (coin) {
    scoredArticles = await fetchCoinsNews(coin, period)
  } else {
    const results = await Promise.all(TOP_10_COINS.map(coin => fetchCoinsNews(coin, period)))
    scoredArticles = results.flat()
  }

  return NextResponse.json({ data: { scoredArticles }})
}
