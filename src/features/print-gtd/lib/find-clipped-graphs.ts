/** A text rectangle further than this outside its box counts as cut; smaller offsets are rounding. */
const TOLERANCE_PX = 1.5

const textRects = (box: Element): DOMRect[] => {
  const rects: DOMRect[] = []
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (!node.textContent?.trim()) continue
    range.selectNodeContents(node)
    rects.push(...range.getClientRects())
  }
  return rects
}

/**
 * Graph numbers of form boxes whose text runs outside the box. Box capacities are estimates; this checks
 * the rendered sheets, so a box that still cuts text is reported instead of printing silently.
 */
export const findClippedGraphs = (root: ParentNode): string[] => {
  const clipped = new Set<string>()
  for (const box of root.querySelectorAll<HTMLElement>('[data-graph]')) {
    const bounds = box.getBoundingClientRect()
    const cut = textRects(box).some(
      (rect) =>
        rect.bottom - bounds.bottom > TOLERANCE_PX ||
        rect.right - bounds.right > TOLERANCE_PX ||
        bounds.top - rect.top > TOLERANCE_PX,
    )
    if (cut && box.dataset.graph) clipped.add(box.dataset.graph)
  }
  return [...clipped]
}
