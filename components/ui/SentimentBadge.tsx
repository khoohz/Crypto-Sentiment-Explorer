import { getSentimentLabel } from "@/lib/utils/mapping"
import { SentimentLabel } from "@/types"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "./badge"


const SENTIMENT_LABEL: Record<SentimentLabel, React.ReactNode> = {
  'Bullish': <TrendingUp size={14}/>,
  'Bearish': <TrendingDown size={14}/>,
  'Neutral': <Minus size={14} />
}

const SENTIMENT_CLASS: Record<SentimentLabel, string> = {
  'Bullish': "bg-bullish/20 text-bullish border-0",
  'Neutral': "bg-yellow-100 text-neutral-sentiment border-0",
  'Bearish': "bg-bearish/20   text-bearish   border-0",
}

const SentimentBadge = ({sentimentScore}: {sentimentScore: number}) => {
  const sentimentLabel = getSentimentLabel(sentimentScore)

  return (
    <Badge variant="secondary" className={SENTIMENT_CLASS[sentimentLabel]}>
      {sentimentLabel} {SENTIMENT_LABEL[sentimentLabel]}
    </Badge>
  )
}

export default SentimentBadge
