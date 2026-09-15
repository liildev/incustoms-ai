import { getBlockAt, getSpec, type BlockPath, type GtdBlock } from '@/entities/gtd'

const describeBlock = (block: GtdBlock, siblingIndex: number): string => {
  switch (block.tag) {
    case 'T1':
      return 'Общие данные (T1)'
    case 'T2':
      return `Товар № ${block.fields.P8T2 ?? siblingIndex + 1}`
    case 'T7':
      return `Позиция ${block.fields.P4T7 ?? siblingIndex + 1} графы 31`
    default:
      return getSpec(block.tag)
        ? `${block.tag} № ${siblingIndex + 1}`
        : `${block.tag} (вне спецификации)`
  }
}

/** Human-readable location of a section, e.g. "Товар № 1 › Позиция 1 графы 31". */
export const describePath = (root: GtdBlock, path: BlockPath): string => {
  const parts: string[] = []
  let parent = root
  for (const [depth, index] of path.entries()) {
    const block = getBlockAt(root, path.slice(0, depth + 1))
    if (!block) break
    const siblingIndex = parent.blocks
      .slice(0, index)
      .filter((sibling) => sibling.tag === block.tag).length
    parts.push(describeBlock(block, siblingIndex))
    parent = block
  }
  // Every section lives inside T1; naming it is only useful for T1's own fields.
  const visible = parts.length > 1 ? parts.slice(1) : parts
  return visible.length > 0 ? visible.join(' › ') : 'Корневой элемент'
}
