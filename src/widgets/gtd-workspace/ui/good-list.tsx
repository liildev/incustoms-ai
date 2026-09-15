import type { GoodSummary } from '@/entities/gtd'
import { TabsList, TabsTrigger } from '@/shared/ui'

/** Goods selector: BeUI tabs, one trigger per T2 section. */
export const GoodList = ({ goods }: { goods: readonly GoodSummary[] }) => (
  <TabsList label="Товары" orientation="vertical" className="flex-col">
    {goods.map((good, index) => (
      <TabsTrigger
        key={good.path.join('-')}
        value={String(index)}
        wrapperClassName="w-full"
        className="flex-col items-start gap-0.5 py-2 whitespace-normal"
        indicatorClassName="border border-primary/20"
      >
        <span className="flex items-baseline gap-2 text-dense">
          <span className="font-semibold text-foreground">№ {good.number || index + 1}</span>
          <span className="font-mono text-[12px] font-normal text-muted-foreground">
            {good.code || 'код не указан'}
          </span>
        </span>
        <span className="line-clamp-2 text-2xs font-normal text-muted-foreground">
          {good.title || 'Наименование не указано'}
        </span>
      </TabsTrigger>
    ))}
  </TabsList>
)
