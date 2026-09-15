import { childBlocks, getMainBlock, getSpec, type ReadySession } from '@/entities/gtd'
import { EmptyState } from '@/shared/ui'
import { TRANSPORT_TAGS } from '../model/sections'
import { BlockTable } from './block-table'
import { SectionHeader } from './section-header'

export const TransportSection = ({ session }: { session: ReadySession }) => {
  const main = getMainBlock(session.document)

  return (
    <>
      <SectionHeader
        title="Транспорт"
        description="Транспортные средства при отправлении (графа 18, T5) и на границе (графа 21, T6)."
      />
      <div className="flex flex-col gap-6">
        {TRANSPORT_TAGS.map((tag) => {
          const blocks = childBlocks(main, tag)
          const vehicleDetails = blocks.flatMap((vehicle) =>
            childBlocks(vehicle, 'T43').map(({ block }) => block),
          )
          return (
            <section key={tag}>
              <h3 className="mb-2 text-dense font-semibold text-foreground">
                {getSpec(tag)?.label} ({tag})
              </h3>
              {blocks.length === 0 ? (
                <EmptyState title={`Раздел ${tag} не заполнен`} />
              ) : (
                <div className="flex flex-col gap-3">
                  <BlockTable
                    label={getSpec(tag)?.label ?? tag}
                    blocks={blocks.map(({ block }) => block)}
                  />
                  {vehicleDetails.length > 0 ? (
                    <BlockTable label={getSpec('T43')?.label ?? 'T43'} blocks={vehicleDetails} />
                  ) : null}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
