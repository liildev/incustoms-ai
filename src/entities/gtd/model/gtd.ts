import { z } from 'zod'

export const GTD_ROOT_TAG = 'GTD_eCopy_DefEdFormat'
export const GTD_MAIN_TAG = 'T1'

export const BLOCK_TAG_PATTERN = /^T\d+$/
export const FIELD_TAG_PATTERN = /^P\d+T\d+$/

/**
 * A GTD section element (T1, T2, T21, ...) or the document root.
 *
 * Every GTD section follows the same shape: scalar fields (P{n}T{m}) followed by
 * nested sections. Child sections are always stored as an ordered array, so a
 * section that occurs once and one that repeats are represented identically.
 * Tags not described by the specification are kept as-is, which makes the model
 * lossless for data the UI does not yet expose.
 */
export const gtdBlockSchema = z.object({
  tag: z.string().min(1),
  attributes: z.record(z.string(), z.string()),
  /** Scalar values in document order. Values are verbatim strings: "0003728" stays "0003728". */
  fields: z.record(z.string(), z.string()),
  get blocks() {
    return z.array(gtdBlockSchema)
  },
})

export type GtdBlock = z.infer<typeof gtdBlockSchema>

export const gtdDocumentSchema = z.object({
  root: gtdBlockSchema
    .refine((root) => root.tag === GTD_ROOT_TAG, {
      message: `Корневой элемент должен называться ${GTD_ROOT_TAG}.`,
    })
    .refine((root) => root.blocks.filter((block) => block.tag === GTD_MAIN_TAG).length === 1, {
      message: `Декларация должна содержать ровно один раздел ${GTD_MAIN_TAG} (общие данные по ГТД).`,
    }),
})

export type GtdDocument = z.infer<typeof gtdDocumentSchema>

/** Indices into nested `blocks` arrays, starting from the document root. */
export type BlockPath = readonly number[]
