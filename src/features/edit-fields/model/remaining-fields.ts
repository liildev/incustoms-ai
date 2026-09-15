import type { GtdBlock } from '@/entities/gtd'
import type { FieldGroup } from './field-group'

/**
 * Appends a group with fields present in the section but not listed in `groups`,
 * so that every value of the file stays visible and editable.
 */
export const withRemainingFields = (
  block: GtdBlock,
  groups: readonly FieldGroup[],
  title: string,
): FieldGroup[] => {
  const listed = new Set(groups.flatMap((group) => group.tags))
  const remaining = Object.keys(block.fields).filter((tag) => !listed.has(tag))
  return remaining.length > 0 ? [...groups, { title, tags: remaining }] : [...groups]
}
