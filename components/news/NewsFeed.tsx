import { ScoredArticle } from "@/types"
import NewsCard from "./NewsCard"

const NewsFeed = ({ articles }: {articles: ScoredArticle[] }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="grid grid-cols-3 gap-4">
        {articles.map((article, index) => (
          <NewsCard key={article.id} article={article} priority={index < 3}/>
        ))}
      </div>
    </div>
  )
}

export default NewsFeed