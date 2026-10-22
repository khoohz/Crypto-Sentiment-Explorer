// External news fetching (currently using MarketAux API)
import type { NewsFetchPeriod, RawArticle } from "@/types"
import { formatPeriod } from "@/lib/utils/mapping"

type MarketAuxArticle = {
  uuid: string
  title: string
  url: string
  image_url: string
  source: string
  published_at: string
  snippet: string
}

type MarketAuxArticleResponse = {
  data: MarketAuxArticle[]
}

const CRYPTO_SYMBOLS: Record<string, string> = {
  'btc': 'CC:BTC',
  'eth': 'CC:ETH',
  'bnb': 'CC:BNB',
  'xrp': 'CC:XRP',
  'sol': 'CC:SOL',
  'doge': 'CC:DOGE',
  'trx': 'CC:TRX',
  'ada': 'CC:ADA',
  'link': 'CC:LINK',
  'bch': 'CC:BCH'
}

const MARKETAUX_API_URL = process.env.MARKETAUX_NEWS_API_URL
const MARKETAUX_API_KEY = process.env.MARKETAUX_API_KEY

if (!MARKETAUX_API_URL || !MARKETAUX_API_KEY) {
  throw new Error('Missing required environment variables: MARKETAUX_NEWS_API_URL, MARKETAUX_API_KEY')
}

export const fetchCoinNews = async (coinId: string, period: NewsFetchPeriod): Promise<RawArticle[]> => {
  const formattedPeriod = formatPeriod(period)

  const url = new URL(`${MARKETAUX_API_URL}/all`)
  url.searchParams.set('symbols', CRYPTO_SYMBOLS[coinId] ?? coinId)
  url.searchParams.set('language', 'en')
  url.searchParams.set('published_after', formattedPeriod)
  url.searchParams.set('limit', '3') // temporary
  url.searchParams.set('api_token', MARKETAUX_API_KEY)

  const coinNewsResponse = await fetch(url.toString()).then(response => {
    if (!response || (response.status !== 200 && response.status !== 201)) {
      throw new Error(`Failed to fetch news related to ${coinId}.`)
    }
    return response.json() as Promise<MarketAuxArticleResponse>;
  })

  return coinNewsResponse.data.map((article: MarketAuxArticle) => ({
    id: article.uuid,
    title: article.title,
    image_url: article.image_url,
    url: article.url,
    source: article.source,
    published_at: article.published_at,
    body: article.snippet,
    coin_id: coinId
  }))
}
