// News page
import type { ScoredArticle } from "@/types"
import NewsLoadingSkeleton from "@/components/news/NewsLoadingSkeleton"
import NewsFeed from "@/components/news/NewsFeed"

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


const NewsPage = () => {
  if (!fakeArticle) {
    return (<NewsLoadingSkeleton />)
  } else {
    return (<NewsFeed articles={fakeArticle} />)
  }
}

export default NewsPage
