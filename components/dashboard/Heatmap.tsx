'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Customized, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts'
import { CoinScoreResult, NewsFetchPeriod } from '@/types'

type HeatmapPoint = {
  coin: string
  sentimentScore: number
  btcAdjustedScore: number
  summary: string
  image: string
}

type CoinShapeProps = {
  cx?: number
  cy?: number
  payload?: HeatmapPoint
}

const CoinShape = ({ cx, cy, payload }: CoinShapeProps) => {
  if (cx === undefined || cy === undefined || !payload) return null

  return (
    <g transform={`translate(${cx},${cy})`}>
      <image
        href={payload.image}
        x={-14} y={-14}
        width={28} height={28}
        clipPath={`url(#clip-${payload.coin})`}
      />
    </g>
  )
}

const CircleClipDefs = ({ data }: { data: HeatmapPoint[] }) => (
  <defs>
    {data?.map((coin) => (
      <clipPath key={coin.coin} id={`clip-${coin.coin}`}>
        <circle cx="0" cy="0" r="14" />
      </clipPath>
    ))}
  </defs>
)

const Heatmap = () => {
  const [period, setPeriod] = useState<NewsFetchPeriod>('24h')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['coins', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period })
      const res = await fetch(`/api/coins?${params}`)
      if (!res.ok) throw new Error('Failed to fetch coins data')
      const json: { data: { coinScoreResults: CoinScoreResult[] } } = await res.json()
      return json.data.coinScoreResults
    },
    retry: false
  })

  const scatterData = data
    ?.filter((coin) => coin.sentiment_score > 0)
    .map((coin) => ({
      coin: coin.coin_id,
      sentimentScore: coin.sentiment_score,
      btcAdjustedScore: coin.btc_adjusted_score,
      summary: coin.sentiment_summary,
      image: coin.image,
    }))

  if (isLoading) return <div>Loading...</div> // temporary
  if (isError) return <div>Failed to load</div>

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Crypto sentiment overview</h1>
          <p className="mt-1 text-sm text-text-muted">LLM-classified news, weighted by source and recency.</p>
        </div>
        <div className="flex rounded-md border border-border-primary p-1" aria-label="News period">
          {(['24h', '7d', '30d'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`rounded px-3 py-1 text-sm ${period === option ? 'bg-accent-primary text-white' : 'text-text-secondary'}`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" aspect={1.618}>
      <ScatterChart margin={{ top: 20, right: 60, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sentimentScore" type="number" domain={[1,10]} ticks={[1, 5, 10]} label={{ value: '← Bearish | Bullish →', position: 'insideBottom', offset: -5, fill: '#94A3B8', fontSize: 11 }} />
        <YAxis dataKey="btcAdjustedScore" type="number" domain={[-5,10]} label={{ value: 'BTC Adjusted ↑', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }} />
        <ReferenceLine x={5} stroke="#94A3B8" strokeWidth={1.5} />
        <ReferenceLine y={2} stroke="#94A3B8" strokeWidth={1.5} />
        <ReferenceLine
          x={1}
          stroke="transparent"
          label={{ value: 'Bearish', position: 'insideTopRight', fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
        />
        <ReferenceLine
          x={10}
          stroke="transparent"
          label={{ value: 'Bullish', position: 'insideTopLeft', fill: '#00A83E', fontSize: 11, fontWeight: 500 }}
        />
        <ReferenceLine x={7.5} stroke="transparent" label={{ value: 'Strong Signal', position: 'insideTop', fill: '#00A83E20', fontSize: 10 }} />
        <ReferenceArea x1={5} x2={10} y1={2} y2={10} fill="#00A83E" fillOpacity={0.05} />
        <ReferenceArea x1={1} x2={5} y1={-5} y2={2} fill="#FF3A33" fillOpacity={0.05} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />

        <Scatter data={scatterData} name="Coins" shape={CoinShape} />
        <Customized component={() => <CircleClipDefs data={scatterData ?? []} />} />
      </ScatterChart>
      </ResponsiveContainer>
    </section>
  )
}

export default Heatmap
