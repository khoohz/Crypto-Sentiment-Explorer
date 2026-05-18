// Article score CRUD
import { StoredScore } from "@/types"
import { prisma } from "@/lib/db/prisma"

export const getArticleScore = async (article_id: string): Promise<StoredScore | null> => {
  const article = await prisma.articleScore.findUnique({ where: { article_id }})
  if (!article) {
    return null 
  } 
  return article as StoredScore;
}

export const saveArticleScore = async (article_id: string, score: number, takeaway: string): Promise<StoredScore> => {
  const article = await prisma.articleScore.create({ data: { article_id, score, takeaway }})
  return article as StoredScore
}