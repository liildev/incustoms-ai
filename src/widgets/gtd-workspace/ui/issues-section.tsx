import type { GtdIssue, ReadySession } from '@/entities/gtd'
import { EmptyState } from '@/shared/ui'
import { groupIssues } from '../lib/group-issues'
import { IssueRow } from './issue-row'
import { SectionHeader } from './section-header'

export const IssuesSection = ({
  session,
  issues,
}: {
  session: ReadySession
  issues: readonly GtdIssue[]
}) => {
  const groups = groupIssues(issues)

  return (
    <>
      <SectionHeader
        title="Проверка"
        description="Сверка с электронным форматом ГТД 2026 и согласованность данных. Ошибки — значения, не соответствующие типу поля или противоречащие друг другу; предупреждения — отклонения, которые встречаются и в принятых декларациях. Экспорт и печать блокируют только повторные разделы T53 и T54."
      />
      {groups.length === 0 ? (
        <EmptyState
          title="Замечаний нет"
          description="Декларация соответствует проверкам, реализованным в редакторе."
        />
      ) : (
        <ul className="rounded-lg border border-border bg-surface">
          {groups.map((group) => (
            <IssueRow
              key={[group.source, group.severity, group.tag, group.message].join('|')}
              group={group}
              root={session.document.root}
            />
          ))}
        </ul>
      )}
    </>
  )
}
