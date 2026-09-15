import type { BlockPath } from './gtd'

/**
 * - `spec`: conformance with the official format specification (docs/spec).
 * - `domain`: consistency rules derived from the data itself (counts, duplicates).
 * - `import`: facts about how the source file was read (e.g. normalized tag names).
 */
export type GtdIssueSource = 'spec' | 'domain' | 'import'

export type GtdIssueSeverity = 'error' | 'warning'

export type GtdIssue = {
  source: GtdIssueSource
  severity: GtdIssueSeverity
  /** Section the issue refers to. */
  path: BlockPath
  /** Field or section tag the issue refers to. */
  tag: string
  message: string
}
