import { describe, expect, it } from 'vitest'
import { patchFields, replaceChildBlocks } from './block'
import type { GtdBlock } from './gtd'

const block = (
  tag: string,
  fields: Record<string, string> = {},
  blocks: GtdBlock[] = [],
): GtdBlock => ({
  tag,
  attributes: {},
  fields,
  blocks,
})

describe('patchFields', () => {
  it('keeps existing positions, removes cleared fields and inserts new ones in specification order', () => {
    const next = patchFields(block('T1', { P2T1: 'ED', P17T1: '1', P19T1: '27009' }), {
      P17T1: undefined,
      P3T1: 'ИМ',
      P2T1: 'ED2',
    })
    expect(Object.entries(next.fields)).toEqual([
      ['P2T1', 'ED2'],
      ['P3T1', 'ИМ'],
      ['P19T1', '27009'],
    ])
  })

  it('does not insert a new field before earlier fields when an unknown field comes first', () => {
    const next = patchFields(block('T1', { X1: 'x', P2T1: 'ED', P19T1: '27009' }), { P3T1: 'ИМ' })
    expect(Object.keys(next.fields)).toEqual(['X1', 'P2T1', 'P3T1', 'P19T1'])
  })

  it('treats inherited object property names as ordinary tags', () => {
    const next = patchFields(block('T1', { P2T1: 'ED' }), { toString: 'x' })
    expect(Object.entries(next.fields)).toEqual([
      ['P2T1', 'ED'],
      ['toString', 'x'],
    ])
  })
})

describe('replaceChildBlocks', () => {
  it('adds a missing section after the sections the specification places before it', () => {
    const main = block('T1', {}, [block('X'), block('T2'), block('T2'), block('T5')])
    expect(replaceChildBlocks(main, 'T53', [block('T53')]).blocks.map(({ tag }) => tag)).toEqual([
      'X',
      'T2',
      'T2',
      'T5',
      'T53',
    ])
  })

  it('writes replacement sections where the first replaced one was', () => {
    const main = block('T7', {}, [
      block('A'),
      block('T21', { P3T21: '1' }),
      block('B'),
      block('T21'),
    ])
    expect(
      replaceChildBlocks(main, 'T21', [block('T21', { P3T21: '9' })]).blocks.map(
        ({ tag, fields }) => [tag, fields.P3T21],
      ),
    ).toEqual([
      ['A', undefined],
      ['T21', '9'],
      ['B', undefined],
    ])
  })
})
