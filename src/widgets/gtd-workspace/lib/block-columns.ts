import { getSpec, getSpecOrder, type GtdBlock } from '@/entities/gtd'

/** Every field tag present in the sections, in specification order. */
export const presentFieldTags = (blocks: readonly GtdBlock[]): string[] =>
  [...new Set(blocks.flatMap((block) => Object.keys(block.fields)))].sort(
    (a, b) => getSpecOrder(a) - getSpecOrder(b),
  )

/** Column width from the specification: short for numbers and dates, wider for long text. */
export const fieldColumnWidth = (tag: string): string => {
  const spec = getSpec(tag)
  if (spec?.type === 'number' || spec?.type === 'date') return '128px'
  return (spec?.length ?? 0) >= 100 ? '280px' : '160px'
}
