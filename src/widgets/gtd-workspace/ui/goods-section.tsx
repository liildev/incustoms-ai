import { useState } from 'react'
import { listGoods, type ReadySession } from '@/entities/gtd'
import { Button, Dialog, EmptyState, Tabs, TabsContent } from '@/shared/ui'
import { GoodDetail } from './good-detail'
import { GoodList } from './good-list'
import { SectionHeader } from './section-header'

const goodFormId = (index: number) => `good-${index}`

export const GoodsSection = ({ session }: { session: ReadySession }) => {
  const goods = listGoods(session.document)
  const [selected, setSelected] = useState(0)
  const [pending, setPending] = useState<number | null>(null)
  const good = goods[selected] ?? goods[0]

  const select = (index: number) => {
    if (index === selected) return
    if (session.drafts.includes(goodFormId(selected))) setPending(index)
    else setSelected(index)
  }

  const confirmSwitch = () => {
    if (pending !== null) setSelected(pending)
    setPending(null)
  }

  return (
    <>
      <SectionHeader title="Товары" description={`Разделы T2: ${goods.length} из допустимых 99.`} />
      {good ? (
        <Tabs
          value={String(selected)}
          onValueChange={(value) => select(Number(value))}
          className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]"
        >
          <aside className="max-h-60 overflow-y-auto lg:sticky lg:top-16 lg:max-h-[calc(100dvh-5rem)] lg:self-start">
            <GoodList goods={goods} />
          </aside>
          <TabsContent value={String(selected)}>
            {/* Keyed by position among the goods: a path shifts when an earlier T1 section is removed. */}
            <GoodDetail key={selected} good={good} formId={goodFormId(selected)} />
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState title="Товары не указаны" description="Декларация не содержит разделов T2." />
      )}
      <Dialog
        open={pending !== null}
        title="Перейти к другому товару?"
        description={`Несохранённые правки товара № ${good?.number ?? selected + 1} будут отменены.`}
        onClose={() => setPending(null)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Остаться
            </Button>
            <Button variant="danger" onClick={confirmSwitch}>
              Отменить правки и перейти
            </Button>
          </>
        }
      />
    </>
  )
}
