import { RawCoin } from "@/types";
import { getCacheEntry, setCacheEntry } from "../db/cache";

const CACHE_KEY = 'coins_market_data'
const CACHE_TTL = 5

export const fetchCoinsData = async (): Promise<RawCoin[]> => {
  const cached = await getCacheEntry(CACHE_KEY)
  if (cached) {
    return JSON.parse(cached.value) as RawCoin[]
  }

  const coinsDataRes = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,ripple,solana,dogecoin,tron,cardano,chainlink,bitcoin-cash')
    .then(response => {
      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error(`Failed to fetch all coins data.`)
      }
      return response.json() as Promise<RawCoin[]>;
    })

  const mapped = coinsDataRes.map(coinData => ({
    id: coinData.id,
    symbol: coinData.symbol,
    name: coinData.name,
    market_cap_rank: coinData.market_cap_rank,
    current_price: coinData.current_price,
    price_change_24h: coinData.price_change_24h,
    image: coinData.image
  }))

  await setCacheEntry(CACHE_KEY, JSON.stringify(mapped), CACHE_TTL)

  return mapped
}