import { Skeleton } from "../ui/skeleton"

const SkeletonCard = () => (
  <div className="flex flex-col rounded-lg border border-border-primary">
    <Skeleton className="w-full h-36 rounded-t-lg" />
    <div className="p-3 flex flex-col gap-2">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="border-t border-border-primary mt-auto pt-2 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
)

const NewsLoadingSkeleton = () => (
  <div className="max-w-5xl mx-auto px-0 py-8">
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
)

export default NewsLoadingSkeleton