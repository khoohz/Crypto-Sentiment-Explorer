# Interview Prep — Architecture Decisions

## 1. Article sentiment scores are immutable
Once an article is scored by the LLM, its score never changes. Article content is fixed, and our scoring formula is deterministic. Scores are stored permanently in the DB and never recomputed.

## 2. Coin aggregate scores are computed at request time
Coin scores use time-decay (`e^(-λ × days_ago)`), which means they change continuously as time passes. Storing them as a source of truth would make them stale immediately. They are always computed fresh from stored article scores.

## 3. Coin aggregate cache is DB-backed with TTL, not Redis
Because Next.js API routes on Vercel run as serverless functions, in-memory caching is unreliable — each invocation may be a fresh process. We use a PostgreSQL `Cache` table with an `expires_at` column (15 min TTL) as a shared cache across all invocations. Redis was considered but ruled out — the expected load does not justify the added infrastructure.

## 4. Time-decay is applied at query time, not baked into stored scores
Storing a decayed score would make it stale within hours. Decay is pure math applied at request time using stored article scores and `published_at` timestamps.
