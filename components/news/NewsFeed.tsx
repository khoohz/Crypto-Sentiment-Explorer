'use client'

import { ScoredArticle } from "@/types"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import NewsCard from "./NewsCard"
import NewsLoadingSkeleton from "./NewsLoadingSkeleton"
import NewsFilter from "./NewsFilters"

const NewsFeed = () => {

  const fakeArticle: ScoredArticle[] = [{
    id: "fake-article-1",
    title: "Bitcoin ETF Inflows Hit Record $1.2B as Institutional Demand Surges",
    url: "https://www.investing.com/news/stock-market-news/amazoncom-mulls-new-multibillion-dollar-investment-in-anthropic-the-information-reports-3710319",
    // image_url: "https://i-invdn-com.investing.com/news/amazon_800x533_L_1411373482.jpg", // optional — remove to test placeholder
    source: "CoinDesk",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    body: "Spot Bitcoin ETFs recorded their largest single-day inflow this quarter.",
    coin_id: "btc",
    sentiment_score: 5,
    sentiment_summary:
      "Spot Bitcoin ETFs recorded their largest single-day inflow this quarter, signaling growing confidence among institutional investors.",
    impact_weight: 1,
  }]


  const [period, setPeriod] = useState('24h')
  const [coin, setCoin] = useState('btc')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['news', period, coin],
    // queryFn: async () => {
    //   const params = new URLSearchParams({ period, coin: coin === 'all' ? '' : coin })
    //   const res = await fetch(`/api/news?${params}`)
    //   if (!res.ok) throw new Error('Failed to fetch news')
    //     const json: { data: { scoredArticles: ScoredArticle[] } } = await res.json()
    //   return json.data.scoredArticles
    // }
    queryFn: async () => {
      return fakeArticle // temporary
    }
  })

  if (isLoading) return <NewsLoadingSkeleton />
  if (isError) return <div className="text-center text-text-muted py-12">Failed to load news. Please try again.</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Latest Crypto News</h1>
        <p className="text-sm text-text-muted mt-1">Sentiment-scored news for top 10 coins</p>
      </div>
      <div className="relative z-10 mb-6">
        <NewsFilter period={period} coin={coin} onPeriodChange={setPeriod} onCoinChange={setCoin} />
      </div>
      <div className="grid grid-cols-3 gap-4 relative z-0">
        {data?.map((article, index) => (
          <NewsCard key={article.id} article={article} priority={index < 3}/>
        ))}
      </div>
    </div>
  )
}

export default NewsFeed