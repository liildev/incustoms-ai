import {
  childBlocks,
  DESCRIPTION_TAG,
  groupImeiByDevice,
  IMEI_TAG,
  listGoods,
  readImeiRecords,
  type ReadySession,
} from '@/entities/gtd'
import { ImeiEditor } from '@/features/edit-imei'
import { Badge, Collapsible, EmptyState } from '@/shared/ui'
import { SectionHeader } from './section-header'

export const ImeiSection = ({ session }: { session: ReadySession }) => {
  // Keyed by good and position number rather than path: removing a T53 placed before the goods shifts
  // their paths, and a path key would then hand one good's unsaved IMEI form to another good.
  const positions = listGoods(session.document).flatMap((good, goodIndex) =>
    childBlocks(good, DESCRIPTION_TAG).map((description, index) => ({
      key: `${goodIndex}-${index}`,
      good,
      description,
    })),
  )
  const total = positions.reduce(
    (sum, { description }) => sum + childBlocks(description, IMEI_TAG).length,
    0,
  )

  return (
    <>
      <SectionHeader
        title="IMEI устройств"
        description="Раздел T21 внутри описания товара по графе 31 (T7): порядковый номер устройства (P3T21), номер SIM-слота (P4T21) и IMEI (P5T21). Устройство с двумя слотами указывается двумя записями."
      />
      {total === 0 ? (
        <div className="mb-4">
          <EmptyState
            title="IMEI в декларации не указаны"
            description="Раздел T21 заполняется только для устройств с IMEI, поэтому его отсутствие не является ошибкой. При необходимости добавьте устройства к нужной позиции ниже."
          />
        </div>
      ) : null}
      {positions.length === 0 ? (
        <EmptyState
          title="Нет позиций для IMEI"
          description="Товары не содержат раздел T7, к которому относятся записи IMEI."
        />
      ) : (
        <div className="overflow-clip rounded-lg border border-border bg-surface">
          {positions.map(({ key, good, description }) => {
            const records = readImeiRecords(description.block)
            const count = records.length
            return (
              <Collapsible
                key={key}
                defaultOpen={count > 0}
                title={`Товар № ${good.number}, позиция ${description.block.fields.P4T7 ?? '—'}`}
                meta={
                  <>
                    <span className="hidden max-w-md truncate text-2xs text-subtle-foreground md:inline">
                      {description.block.fields.P5T7}
                    </span>
                    <Badge status={count > 0 ? 'info' : 'neutral'}>
                      {count > 0
                        ? `устройств ${groupImeiByDevice(records).length}, IMEI ${count}`
                        : 'нет IMEI'}
                    </Badge>
                  </>
                }
              >
                <ImeiEditor description={description} />
              </Collapsible>
            )
          })}
        </div>
      )}
    </>
  )
}
