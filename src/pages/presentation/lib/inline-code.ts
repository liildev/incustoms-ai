export type InlinePart = { kind: 'text' | 'code'; value: string }

/** Splits slide copy on backticks: odd segments are code identifiers (`contract_id`), even ones text. */
export const splitInlineCode = (source: string): InlinePart[] =>
  source
    .split('`')
    .map((value, position): InlinePart => ({ kind: position % 2 === 1 ? 'code' : 'text', value }))
    .filter((part) => part.value !== '')
