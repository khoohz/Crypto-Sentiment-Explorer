import { ScoredArticle } from "@/types"
import Image from "next/image"
import { formatTimeAgo } from "@/lib/utils/mapping"
import Link from "next/link"
import { Astroid, ImageOff } from "lucide-react"
import SentimentBadge from "../ui/SentimentBadge"
import CoinTagBadge from "../ui/CoinTagBadge"



const NewsCard = ({ article, priority = false }: {article: ScoredArticle, priority?: boolean }) => {
  return (
    <div className="flex flex-col rounded-lg border border-border-primary">
      <div className="relative w-full h-36 rounded-t-lg overflow-hidden">
        {article.image_url ? (
          <Link href={article.url} className="relative block w-full h-full">
            <Image src={article.image_url} alt={article.title} fill unoptimized priority={priority} className="object-cover"/>
          </Link>
        ) : (
          <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
            <ImageOff className="text-text-muted"/>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 grow">
        <div className="font-semibold text-text-primary line-clamp-3">
          {article.title}
        </div>
        <div className="flex justify-start gap-2">
          <CoinTagBadge coinId={article.coin_id} />
          <SentimentBadge sentimentScore={article.sentiment_score} />
        </div>
        <p className="text-sm text-text-secondary line-clamp-5">
          <Astroid size={12} color="var(--color-accent-primary)" fill="var(--color-accent-primary)" className="inline mr-1 mb-0.5" />
          {article.sentiment_summary}
        </p>
        <div className="border-t border-border-primary"></div>
        <div className="flex justify-between text-sm text-text-primary">
          <div>
            {article.source}
          </div>
          <div>
            {formatTimeAgo(new Date(article.published_at))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCard
