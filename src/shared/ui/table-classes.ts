/** Shared class names for dense data tables. */
export const TABLE = {
  // relative: visually hidden (absolute) header labels must stay inside the scroll container
  wrapper: 'relative overflow-x-auto rounded-lg border border-border bg-surface',
  table: 'w-full border-collapse text-dense',
  headCell:
    'border-b border-border bg-surface-muted px-3 py-2 text-left text-2xs font-medium text-muted-foreground whitespace-nowrap',
  cell: 'border-b border-border px-3 py-1.5 align-top text-foreground last:pr-3',
  numeric: 'text-right tabular-nums whitespace-nowrap',
  code: 'font-mono text-[12px]',
} as const
