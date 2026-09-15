/** Capacity of a printed box: lines it holds and characters per line at the print font size. */
export type BoxCapacity = { lines: number; chars: number }

/**
 * Capital letters are about a quarter wider than lower-case letters in the print font (IBM Plex Sans:
 * 1.62 mm against 1.29 mm per character of mixed Russian text at 7pt), so they count as 1.25 characters.
 * Customs descriptions and names are often written in capitals.
 */
const CAPITAL_WIDTH = 1.25

const widthOf = (word: string): number => {
  let width = 0
  for (const character of word) {
    width += character !== character.toLowerCase() ? CAPITAL_WIDTH : 1
  }
  return width
}

/**
 * Lines one source line takes when the browser wraps it at spaces; a word longer than the line
 * is broken, as `overflow-wrap: break-word` does.
 */
const wrapLine = (line: string, chars: number): number => {
  let lines = 1
  let used = 0
  for (const word of line.split(/\s+/).filter(Boolean)) {
    const width = widthOf(word)
    const needed = used === 0 ? width : used + 1 + width
    if (needed <= chars) {
      used = needed
      continue
    }
    if (used > 0) lines += 1
    lines += Math.ceil(width / chars) - 1
    used = width % chars || chars
  }
  return lines
}

/** Lines the text occupies once long lines wrap at word boundaries. */
export const wrappedLineCount = (lines: readonly string[], chars: number): number =>
  lines.reduce((count, line) => count + wrapLine(line, chars), 0)

/**
 * Whether the lines fit the box. Character widths vary, so capacities are set below the measured
 * maximum; the preview additionally reports any box whose text is still cut (use-clipped-graphs).
 */
export const fitsBox = (lines: readonly string[], capacity: BoxCapacity): boolean =>
  wrappedLineCount(lines, capacity.chars) <= capacity.lines
