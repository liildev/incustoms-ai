const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const NARROW_NBSP = '\u202f'

/** Formats an ISO date (YYYY-MM-DD) as DD.MM.YYYY; other values are returned unchanged. */
export const formatDate = (value: string): string => {
  const match = ISO_DATE.exec(value)
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value
}

/** Groups thousands with narrow no-break spaces and uses a decimal comma; non-decimals are returned unchanged. */
export const formatAmount = (value: string): string => {
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value)
  if (!match) return value
  const [, sign = '', integer = '', fraction] = match
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP)
  return fraction === undefined ? `${sign}${grouped}` : `${sign}${grouped},${fraction}`
}
