// LLM scoring + summarization (takeaway)
import Anthropic from "@anthropic-ai/sdk"
import { LLMScoreResponse } from "@/types"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  throw new Error('Missing required environment variable: ANTHROPIC_API_KEY')
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const promptMessage = `You are a fundamental analyst for crypto news. Your job is to read through the article with given crypto coin, title and snippets and provide a sentiment_score relative to that specific coin from scale 1-10 where 1 is most bearish and 10 is most bullish. You also have to generate a key takeaway from the article that concludes the article well. Return ONLY a raw JSON object. No markdown, no backticks, no code blocks, no explanation. Just the JSON object itself.
{ "score": number, "takeaway": string }`

export const scoreArticle = async (
  coinId: string,
  title: string,
  body: string
): Promise<LLMScoreResponse> => {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `${promptMessage}\n\nCoin: ${coinId}\nTitle: ${title}\nSnippet: ${body}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }
  const raw = block.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(raw)
  if (typeof parsed.score !== 'number' || typeof parsed.takeaway !== 'string') {
    throw new Error('Invalid response format from Claude')
  }

  return parsed as LLMScoreResponse
}
