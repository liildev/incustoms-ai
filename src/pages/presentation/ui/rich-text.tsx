import { Fragment } from 'react'
import { splitInlineCode } from '../lib/inline-code'

/** Slide copy with backtick-quoted identifiers rendered as code. */
export const RichText = ({ text }: { text: string }) =>
  splitInlineCode(text).map((part, position) =>
    part.kind === 'code' ? (
      <code key={position} className="font-mono text-[0.86em] tracking-normal text-foreground">
        {part.value}
      </code>
    ) : (
      <Fragment key={position}>{part.value}</Fragment>
    ),
  )
