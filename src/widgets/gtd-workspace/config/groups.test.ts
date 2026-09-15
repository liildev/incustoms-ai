import { describe, expect, it } from 'vitest'
import { getSpec } from '@/entities/gtd'
import { GOOD_GROUPS } from './good-groups'
import { MAIN_GROUPS } from './main-groups'

describe.each([
  ['T1', MAIN_GROUPS],
  ['T2', GOOD_GROUPS],
])('%s field groups', (parent, groups) => {
  const tags = groups.flatMap((group) => group.tags)

  it('reference only fields of the section defined by the specification', () => {
    expect(
      tags.filter((tag) => getSpec(tag)?.parent !== parent || getSpec(tag)?.kind !== 'field'),
    ).toEqual([])
  })

  it('list every field once', () => {
    expect(tags.filter((tag, index) => tags.indexOf(tag) !== index)).toEqual([])
  })
})
