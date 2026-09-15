import { getSpecOrder } from '../config/spec'
import type { BlockPath, GtdBlock } from './gtd'

export type LocatedBlock = { block: GtdBlock; path: BlockPath }

export const createBlock = (tag: string, fields: Record<string, string> = {}): GtdBlock => ({
  tag,
  attributes: {},
  fields: sortFields(fields),
  blocks: [],
})

/** Direct child sections with the given tag, with their paths. */
export const childBlocks = (parent: LocatedBlock, tag: string): LocatedBlock[] =>
  parent.block.blocks.flatMap((block, index) =>
    block.tag === tag ? [{ block, path: [...parent.path, index] }] : [],
  )

export const firstChildBlock = (parent: LocatedBlock, tag: string): LocatedBlock | undefined =>
  childBlocks(parent, tag)[0]

export const getBlockAt = (root: GtdBlock, path: BlockPath): GtdBlock | undefined =>
  path.reduce<GtdBlock | undefined>((block, index) => block?.blocks[index], root)

/** Returns a new tree where the section at `path` is replaced by `update(section)`. */
export const updateBlockAt = (
  root: GtdBlock,
  path: BlockPath,
  update: (block: GtdBlock) => GtdBlock,
): GtdBlock => {
  const [index, ...rest] = path
  if (index === undefined) return update(root)
  const child = root.blocks[index]
  if (!child) throw new RangeError(`No section at index ${index} inside ${root.tag}`)
  const blocks = [...root.blocks]
  blocks[index] = updateBlockAt(child, rest, update)
  return { ...root, blocks }
}

const sortFields = (fields: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(fields).sort(([a], [b]) => getSpecOrder(a) - getSpecOrder(b)))

/**
 * Index at which an item with the given tag joins a list in specification order: right after the last
 * item that the specification places at or before it. Items outside the specification sort last, so an
 * unknown tag early in the list does not pull new items in front of known ones.
 */
const specInsertIndex = (tags: readonly string[], tag: string): number => {
  const order = getSpecOrder(tag)
  return tags.findLastIndex((existing) => getSpecOrder(existing) <= order) + 1
}

/**
 * Applies field changes to a section. `undefined` removes a field.
 * Existing fields keep their document position; new fields are placed in specification order.
 */
export const patchFields = (
  block: GtdBlock,
  patch: Readonly<Record<string, string | undefined>>,
): GtdBlock => {
  const fields = Object.entries(block.fields)
    .filter(([tag]) => !Object.hasOwn(patch, tag) || patch[tag] !== undefined)
    .map(([tag, value]): [string, string] => [tag, patch[tag] ?? value])

  for (const [tag, value] of Object.entries(patch)) {
    if (value === undefined || Object.hasOwn(block.fields, tag)) continue
    fields.splice(
      specInsertIndex(
        fields.map(([existing]) => existing),
        tag,
      ),
      0,
      [tag, value],
    )
  }
  return { ...block, fields: Object.fromEntries(fields) }
}

/**
 * Applies form values, keyed by field tag, that differ from the section. Changed values are stored
 * trimmed and a cleared value removes the field, as in the section forms; values the user did not
 * change stay exactly as read, including padded values and empty elements.
 */
export const patchChangedFields = (
  block: GtdBlock,
  values: Readonly<Record<string, string>>,
): GtdBlock =>
  patchFields(
    block,
    Object.fromEntries(
      Object.entries(values)
        .filter(([tag, value]) => value !== (block.fields[tag] ?? ''))
        .map(([tag, value]) => [tag, value.trim() || undefined]),
    ),
  )

/**
 * Replaces all child sections with the given tag.
 * The new sections take the position of the first replaced one, or the specification position if there were none.
 */
export const replaceChildBlocks = (
  parent: GtdBlock,
  tag: string,
  next: readonly GtdBlock[],
): GtdBlock => {
  const firstIndex = parent.blocks.findIndex((block) => block.tag === tag)
  const others = parent.blocks.filter((block) => block.tag !== tag)
  const position =
    firstIndex !== -1
      ? parent.blocks.slice(0, firstIndex).filter((block) => block.tag !== tag).length
      : specInsertIndex(
          others.map((block) => block.tag),
          tag,
        )
  return { ...parent, blocks: [...others.slice(0, position), ...next, ...others.slice(position)] }
}
