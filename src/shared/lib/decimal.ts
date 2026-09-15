const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/

export const isDecimal = (value: string): boolean => DECIMAL_PATTERN.test(value)

const scaleOf = (value: string): number => value.split('.')[1]?.length ?? 0

const toScaled = (value: string, scale: number): bigint => {
  const negative = value.startsWith('-')
  const [integer = '0', fraction = ''] = value.replace('-', '').split('.')
  const digits = BigInt(integer + fraction.padEnd(scale, '0'))
  return negative ? -digits : digits
}

/**
 * Sums decimal strings exactly (no floating point drift).
 * Non-decimal values are ignored. Returns a plain decimal string.
 */
export const sumDecimals = (values: readonly string[]): string => {
  const valid = values.filter(isDecimal)
  const scale = Math.max(0, ...valid.map(scaleOf))
  const total = valid.reduce((sum, value) => sum + toScaled(value, scale), 0n)
  const negative = total < 0n
  const digits = (negative ? -total : total).toString().padStart(scale + 1, '0')
  const integer = digits.slice(0, digits.length - scale)
  const fraction = scale > 0 ? `.${digits.slice(-scale)}` : ''
  return `${negative ? '-' : ''}${integer}${fraction}`
}
