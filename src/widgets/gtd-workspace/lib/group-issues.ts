import type { BlockPath, GtdIssue } from '@/entities/gtd'

export type IssueGroup = Omit<GtdIssue, 'path'> & { paths: BlockPath[] }

/** Merges identical findings (same source, severity, tag and message) reported for different sections. */
export const groupIssues = (issues: readonly GtdIssue[]): IssueGroup[] => {
  const groups = new Map<string, IssueGroup>()
  for (const { path, ...issue } of issues) {
    const key = [issue.source, issue.severity, issue.tag, issue.message].join('|')
    const group = groups.get(key)
    if (group) group.paths.push(path)
    else groups.set(key, { ...issue, paths: [path] })
  }
  const rank = (group: IssueGroup) => (group.severity === 'error' ? 0 : 1)
  return [...groups.values()].sort((a, b) => rank(a) - rank(b))
}
