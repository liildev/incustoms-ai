import { childBlocks, type LocatedBlock } from './block'
import { GTD_MAIN_TAG, type GtdDocument } from './gtd'

export const GOOD_TAG = 'T2'
export const DESCRIPTION_TAG = 'T7'

export type GoodSummary = LocatedBlock & {
  /** P8T2 — sequence number of the good in the declaration. */
  number: string
  /** P9T2 — HS (ТН ВЭД) code. */
  code: string
  /** First line of P4T2 (the full value may be multi-line). */
  title: string
}

export const getMainBlock = (document: GtdDocument): LocatedBlock => {
  const [main] = childBlocks({ block: document.root, path: [] }, GTD_MAIN_TAG)
  if (!main) throw new Error(`Document has no ${GTD_MAIN_TAG} section`)
  return main
}

export const listGoods = (document: GtdDocument): GoodSummary[] =>
  childBlocks(getMainBlock(document), GOOD_TAG).map((good) => ({
    ...good,
    number: good.block.fields.P8T2 ?? '',
    code: good.block.fields.P9T2 ?? '',
    title: (good.block.fields.P4T2 ?? '').split('\n')[0]?.trim() ?? '',
  }))

/** Collects child sections with the given tag from every good, paired with the owning good. */
export const collectFromGoods = (
  document: GtdDocument,
  tag: string,
): Array<LocatedBlock & { good: GoodSummary }> =>
  listGoods(document).flatMap((good) =>
    childBlocks(good, tag).map((located) => ({ ...located, good })),
  )
