// GET /api/coin/[id]

import { getArticleScore, saveArticleScore } from "@/lib/db/articles"
import { getCacheEntry, setCacheEntry } from "@/lib/db/cache"
import { scoreArticle } from "@/lib/service/claude"
import { fetchCoinNews } from "@/lib/service/marketaux"
import { computeBtcAdjustmentScore, computeCoinScore, computeImpactWeight } from "@/lib/utils/score"
import { NewsFetchPeriod , ScoredArticle} from "@/types"
import { NextResponse } from "next/server"

type HighestImpactNews = {
  article_id: string,
  impact_weight: number,
  takeaway: string
}

type CoinPageResponse = {
  coin_id: string
  sentiment_score: number
  btc_adjusted_score: number  
  sentiment_summary: string
  articles: ScoredArticle[]  // sorted by published_at descending
}

const fetchScoreCoinAndNews = async (
  coin: string,
  period: NewsFetchPeriod,
  btcScore: number = 0
): Promise<CoinPageResponse> => {
  const coinNews = await fetchCoinNews(coin, period)
  const scoredArticle: ScoredArticle[] = []
  let highestImpactNews: HighestImpactNews = {
    article_id: '',
    impact_weight: 0,
    takeaway: ''
  }
  for (const article of coinNews) {
    const articleScore = await getArticleScore(article.id)
    let impactWeight = 0
    let articleTakeaway = ''

    if (!articleScore) { // new article
      const llmScore = await scoreArticle(coin, article.title, article.body ?? "")
      await saveArticleScore(article.id, llmScore.score, llmScore.takeaway)
      
      impactWeight = computeImpactWeight(article.source, article.title, article.body ?? "", article.coin_id)
      scoredArticle.push({
        ...article,
        sentiment_score: llmScore.score,
        sentiment_summary: llmScore.takeaway,
        impact_weight: impactWeight
      })
      articleTakeaway = llmScore.takeaway
    } else {
      impactWeight = computeImpactWeight(article.source, article.title, article.body ?? "", article.coin_id)

      scoredArticle.push({
        ...article,
        sentiment_score: articleScore.score,
        sentiment_summary: articleScore.takeaway,
        impact_weight: impactWeight
      })
      articleTakeaway = articleScore.takeaway
    }

    if (impactWeight > highestImpactNews.impact_weight) {
      highestImpactNews = {
        article_id: article.id,
        impact_weight: impactWeight,
        takeaway: articleTakeaway
      }
    }

  }
  const computedCoinScore = computeCoinScore(scoredArticle, period)
  const computedBtcAdjustmentScore = computeBtcAdjustmentScore(computedCoinScore, btcScore)

  await Promise.all([
    setCacheEntry(`coin_score:${coin}:${period}`, computedCoinScore.toString(), 15),
    setCacheEntry(`btc_vs_coin_score:${coin}:${period}`, computedBtcAdjustmentScore.toString(), 15),
    setCacheEntry(`coin_summary:${coin}:${period}`, highestImpactNews.takeaway, 15)
  ])

  scoredArticle.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  return {
    coin_id: coin,
    sentiment_score: computedCoinScore,
    btc_adjusted_score: computedBtcAdjustmentScore,
    sentiment_summary: highestImpactNews.takeaway,
    articles: scoredArticle
  }
}

export const GET = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: coin } = await params
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') ?? '24h') as NewsFetchPeriod

  const [coinCacheEntry, btcCoinCacheEntry, coinSummaryCacheEntry] = await Promise.all([
    getCacheEntry(`coin_score:${coin}:${period}`),
    getCacheEntry(`btc_vs_coin_score:${coin}:${period}`),
    getCacheEntry(`coin_summary:${coin}:${period}`)
  ])

  const scoredArticles: ScoredArticle[] = []
  if (coinCacheEntry && btcCoinCacheEntry && coinSummaryCacheEntry) {
    const articles = await fetchCoinNews(coin, period)
    for (const article of articles) {
      const articleScore = await getArticleScore(article.id)
      if (articleScore) {
        const impactWeight = computeImpactWeight(article.source, article.title, article.body ?? "", article.coin_id)
        scoredArticles.push({
          ...article,
          sentiment_score: articleScore.score,
          sentiment_summary: articleScore.takeaway,
          impact_weight: impactWeight
        })
      }
    } 
    scoredArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    return NextResponse.json({
      coin_id: coin,
      sentiment_score: parseFloat(coinCacheEntry.value),
      btc_adjusted_score: parseFloat(btcCoinCacheEntry.value),
      sentiment_summary: coinSummaryCacheEntry.value,
      articles: scoredArticles
    })

  } else {
    const btcCacheEntry = await getCacheEntry(`coin_score:btc:${period}`)
    if (!btcCacheEntry) {
      if (coin === 'btc') {
        const result = await fetchScoreCoinAndNews('btc', period, 0)
        return NextResponse.json(result)
      }
      const btcScore = await fetchScoreCoinAndNews('btc', period)
      const result = await fetchScoreCoinAndNews(coin, period, btcScore.sentiment_score)
      return NextResponse.json(result)
    }
    const result = await fetchScoreCoinAndNews(coin, period, parseFloat(btcCacheEntry.value))
    return NextResponse.json(result)
  }
}
