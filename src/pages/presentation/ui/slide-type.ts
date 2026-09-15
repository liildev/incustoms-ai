/**
 * Type scale of the deck. Unprefixed sizes serve the reflow layout; `stage:` sizes are canvas pixels of
 * the 1920×1080 slide, sized for a projector: running text is at least 24px (18px in a 1440×900 window);
 * only IDs, finding codes and node labels go down to 20–22px.
 */
export const TYPE = {
  display: 'text-5xl font-semibold tracking-[-0.035em] stage:text-[152px] stage:leading-none',
  heading:
    'text-[26px] leading-tight font-semibold tracking-[-0.02em] text-foreground stage:text-[60px] stage:leading-[1.1]',
  lead: 'text-base text-muted-foreground stage:text-[32px] stage:leading-[1.35]',
  title:
    'text-lg leading-snug font-semibold tracking-[-0.01em] text-foreground stage:text-[36px] stage:leading-[1.2]',
  body: 'text-[15px] leading-relaxed text-foreground stage:text-[28px] stage:leading-[1.4]',
  note: 'text-dense text-muted-foreground stage:text-[24px] stage:leading-[1.4]',
  ref: 'font-mono text-2xs text-subtle-foreground stage:text-[22px] stage:leading-[1.4]',
} as const
