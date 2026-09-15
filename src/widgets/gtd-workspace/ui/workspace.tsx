import { useState, type ReactNode } from 'react'
import { useGtdSession, type ReadySession } from '@/entities/gtd'
import { Tabs, TabsContent } from '@/shared/ui'
import { getSections, type SectionId } from '../model/sections'
import { DeclarationCard } from './declaration-card'
import { DocumentsSection } from './documents-section'
import { GeneralSection } from './general-section'
import { GoodsSection } from './goods-section'
import { ImeiSection } from './imei-section'
import { IssuesSection } from './issues-section'
import { PaymentsSection } from './payments-section'
import { ScheduleSection } from './schedule-section'
import { SectionNav } from './section-nav'
import { StructureSection } from './structure-section'
import { TransportSection } from './transport-section'

/** Declaration workspace: section navigation and section content for a loaded document. */
export const Workspace = ({ session }: { session: ReadySession }) => {
  const { issues } = useGtdSession()
  const [active, setActive] = useState<SectionId>('general')
  // Sections stay mounted after the first visit so unsaved form edits survive navigation.
  const [visited, setVisited] = useState<ReadonlySet<SectionId>>(() => new Set(['general']))

  const select = (id: SectionId) => {
    setActive(id)
    setVisited((current) => (current.has(id) ? current : new Set([...current, id])))
  }

  const content: Record<SectionId, ReactNode> = {
    general: <GeneralSection session={session} />,
    goods: <GoodsSection session={session} />,
    payments: <PaymentsSection session={session} />,
    documents: <DocumentsSection session={session} />,
    transport: <TransportSection session={session} />,
    imei: <ImeiSection session={session} />,
    schedule: <ScheduleSection session={session} />,
    structure: <StructureSection session={session} />,
    issues: <IssuesSection session={session} issues={issues} />,
  }

  const sections = getSections(session.document, issues)

  return (
    <Tabs
      value={active}
      onValueChange={(value) => select(value as SectionId)}
      className="flex min-h-0 flex-1 flex-col lg:flex-row"
    >
      <aside className="flex flex-col gap-5 border-b border-border bg-surface px-4 py-4 lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
        <DeclarationCard document={session.document} />
        <SectionNav sections={sections} />
      </aside>
      <main className="min-w-0 flex-1 px-4 py-5 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-352">
          {sections.map(({ id }) =>
            visited.has(id) ? (
              <TabsContent key={id} value={id}>
                {content[id]}
              </TabsContent>
            ) : null,
          )}
        </div>
      </main>
    </Tabs>
  )
}
