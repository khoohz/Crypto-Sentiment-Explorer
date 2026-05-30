'use client'

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "../ui/combobox"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { TOP_10_COINS } from "@/types"

type NewsFiltersProps = {
  period: string
  coin: string
  onPeriodChange: (period: string) => void
  onCoinChange: (coin: string) => void
}

const NewsFilter = ({ period, coin, onPeriodChange, onCoinChange}: NewsFiltersProps) => {
  return ( 
    <div className="flex items-center gap-4 mb-6">
      <Combobox defaultValue={coin} value={coin} onValueChange={(value) => onCoinChange(value ?? "")} items={TOP_10_COINS}>
      <ComboboxInput style={{ textTransform: 'uppercase' }} placeholder="Select coin" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxItem value="all">All</ComboboxItem>
            {TOP_10_COINS.map(item => (
              <ComboboxItem key={item} value={item}>
                {item.toUpperCase()}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Tabs defaultValue={period} value={period} onValueChange={onPeriodChange} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="24h">24H</TabsTrigger>
          <TabsTrigger value="7d">7D</TabsTrigger>
          <TabsTrigger value="30d">30D</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

export default NewsFilter