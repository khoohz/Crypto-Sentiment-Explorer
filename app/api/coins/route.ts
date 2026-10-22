// GET /api/coins
import { getArticleScore, saveArticleScore } from "@/lib/db/articles"
import { getCacheEntry, setCacheEntry } from "@/lib/db/cache"
import { scoreArticle } from "@/lib/service/claude"
import { fetchCoinsData } from "@/lib/service/coingecko"
import { fetchCoinNews } from "@/lib/service/marketaux"
import { computeCoinScore, computeImpactWeight, computeBtcAdjustmentScore } from "@/lib/utils/score"
import type { NewsFetchPeriod, ScoredArticle } from "@/types"
import { TOP_10_COINS, CoinScoreResult } from "@/types"
import { NextResponse } from "next/server"

type HighestImpactNews = {
  article_id: string,
  impact_weight: number,
  takeaway: string
}

const fetchAndScoreCoin = async (
  coin: string,
  period: NewsFetchPeriod,
  btcScore: number = 0
) => {
  const [coinCacheEntry, btcCoinCacheEntry, coinSummaryCacheEntry] = await Promise.all([
    getCacheEntry(`coin_score:${coin}:${period}`),
    getCacheEntry(`btc_vs_coin_score:${coin}:${period}`),
    getCacheEntry(`coin_summary:${coin}:${period}`)
  ])

  if (coinCacheEntry && btcCoinCacheEntry && coinSummaryCacheEntry) {
    return {
      coin_id: coin,
      sentiment_score: parseFloat(coinCacheEntry.value),
      btc_adjusted_score: parseFloat(btcCoinCacheEntry.value),
      sentiment_summary: coinSummaryCacheEntry.value
    }
  }

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
  const computedBtcAdjustmentScore = coin === 'btc' ? 0 : computeBtcAdjustmentScore(computedCoinScore, btcScore)

  await Promise.all([
    setCacheEntry(`coin_score:${coin}:${period}`, computedCoinScore.toString(), 15),
    setCacheEntry(`btc_vs_coin_score:${coin}:${period}`, computedBtcAdjustmentScore.toString(), 15),
    setCacheEntry(`coin_summary:${coin}:${period}`, highestImpactNews.takeaway, 15)
  ])

  return {
    coin_id: coin,
    sentiment_score: computedCoinScore,
    btc_adjusted_score: computedBtcAdjustmentScore,
    sentiment_summary: highestImpactNews.takeaway
  }
    
}

// key: coin_score:btc:24h
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get("period") ?? "24h") as NewsFetchPeriod

  // fetch coins & score
  const btcScore = await fetchAndScoreCoin('btc', period)
  const otherCoins = TOP_10_COINS.filter(coin => coin !== 'btc')
  const otherScores = await Promise.all(otherCoins.map(coin => fetchAndScoreCoin(coin, period, btcScore.sentiment_score)))

  const coinScore= [btcScore, ...otherScores]

  // get coins data
  const coinsData = await fetchCoinsData()
  const coinDataMap = Object.fromEntries(coinsData.map(c => [c.symbol, c]))

  const coinScoreResults: CoinScoreResult[] = coinScore.map(result => ({
    ...result,
    image: coinDataMap[result.coin_id]?.image ?? '',
    current_price: coinDataMap[result.coin_id]?.current_price ?? 0,
    price_change_24h: coinDataMap[result.coin_id]?.price_change_24h ?? 0,
  }))

  return NextResponse.json({ data: { coinScoreResults }})
}
