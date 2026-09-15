/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Read from disk: Vitest replaces CSS imports (including ?raw) with empty modules.
const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')

type Rgb = readonly [number, number, number]

/** Reads `--color-<name>: oklch(L C H)` declarations; other color syntaxes are reported as missing. */
const readTokens = (source: string): Map<string, Rgb> =>
  new Map(
    [...source.matchAll(/--color-([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)].map(
      ([, name = '', l, c, h]) => [name, oklchToLinearSrgb(Number(l), Number(c), Number(h))],
    ),
  )

// OKLCH → OKLab → linear sRGB (Björn Ottosson), clamped to the sRGB gamut.
const oklchToLinearSrgb = (lightness: number, chroma: number, hue: number): Rgb => {
  const a = chroma * Math.cos((hue * Math.PI) / 180)
  const b = chroma * Math.sin((hue * Math.PI) / 180)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

const encode = (value: number) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055
const decode = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

/** `color / alpha` painted over `background`; browsers blend in gamma-encoded sRGB. */
const over = (color: Rgb, alpha: number, background: Rgb): Rgb =>
  color.map((channel, index) =>
    decode(encode(channel) * alpha + encode(background[index] ?? 0) * (1 - alpha)),
  ) as unknown as Rgb

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b

const contrast = (first: Rgb, second: Rgb) => {
  const [light, dark] = [luminance(first), luminance(second)].sort((x, y) => y - x)
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}

const tokens = readTokens(css)
const token = (name: string): Rgb => {
  const value = tokens.get(name)
  if (!value) throw new Error(`--color-${name} is missing or not written as oklch(L C H)`)
  return value
}

/** [foreground, background, minimum ratio]; a background "x/10" means token x at 10% over surface. */
const PAIRS: ReadonlyArray<readonly [string, string, number]> = [
  // Text (WCAG 1.4.3, 4.5:1)
  ...['background', 'surface', 'surface-muted', 'muted', 'accent'].flatMap((background) =>
    ['foreground', 'muted-foreground', 'subtle-foreground'].map(
      (text) => [text, background, 4.5] as const,
    ),
  ),
  ['primary-foreground', 'primary', 4.5],
  ['primary-foreground', 'primary/90', 4.5],
  ['secondary-foreground', 'secondary', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['destructive-foreground', 'destructive', 4.5],
  ['warning', 'accent', 4.5],
  ...['primary', 'destructive', 'warning', 'success'].flatMap((status) => [
    [status, 'surface', 4.5] as const,
    [status, `${status}/10`, 4.5] as const,
  ]),
  // Boundaries and focus (WCAG 1.4.11, 3:1)
  ['input-strong', 'surface', 3],
  ['input-strong', 'surface-muted', 3],
  ['destructive', 'surface', 3],
  ['focus-ring', 'surface', 3],
  ['focus-ring', 'background', 3],
]

const resolve = (name: string): Rgb => {
  const [base = '', percent] = name.split('/')
  return percent === undefined
    ? token(base)
    : over(token(base), Number(percent) / 100, token('surface'))
}

describe('design token contrast', () => {
  it.each(PAIRS)('%s on %s reaches %d:1', (foreground, background, minimum) => {
    const ratio = contrast(resolve(foreground), resolve(background))
    expect(
      ratio,
      `${foreground} on ${background} is ${ratio.toFixed(2)}:1, below ${minimum}:1`,
    ).toBeGreaterThanOrEqual(minimum)
  })
})
