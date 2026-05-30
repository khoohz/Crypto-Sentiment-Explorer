import { CoinSymbol } from "@/types"
import { Badge } from "./badge"
import { mapCoinNames } from "@/lib/utils/mapping"

const CoinTagBadge = ({coinId}: {coinId: string}) => {
  const coinName = mapCoinNames[coinId as CoinSymbol].ticker

  return (
    <Badge variant="secondary" className="bg-text-disabled/30 text-primary border-0">
      { coinName }
    </Badge>
  )
}

export default CoinTagBadge
