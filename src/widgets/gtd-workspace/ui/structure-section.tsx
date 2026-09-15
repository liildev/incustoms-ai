import type { ReadySession } from '@/entities/gtd'
import { StructureNode } from './structure-node'
import { SectionHeader } from './section-header'

export const StructureSection = ({ session }: { session: ReadySession }) => (
  <>
    <SectionHeader
      title="Структура XML"
      description="Все разделы и поля файла в исходном порядке, включая не описанные в спецификации. Эти данные сохраняются при экспорте, даже если редактор не показывает их в других разделах."
    />
    <div className="rounded-lg border border-border bg-surface p-3">
      {session.document.root.blocks.map((block, index) => (
        <StructureNode key={index} block={block} index={index} defaultOpen />
      ))}
    </div>
  </>
)
