import type { FieldGroup } from '@/features/edit-fields'

/** Display grouping of T2 fields; a UI decision based on specification field descriptions. */
export const GOOD_GROUPS: readonly FieldGroup[] = [
  {
    title: 'Товар',
    tags: [
      'P8T2',
      'P3T2',
      'P9T2',
      'P4T2',
      'P200T2',
      'P10T2',
      'P5T2',
      'P204T2',
      'P42T2',
      'P40T2',
      'P44T2',
      'P203T2',
    ],
  },
  {
    title: 'Количество и вес',
    tags: [
      'P11T2',
      'P18T2',
      'P6T2',
      'P20T2',
      'P37T2',
      'P7T2',
      'P201T2',
      'P202T2',
      'P206T2',
      'P207T2',
    ],
  },
  {
    title: 'Стоимость',
    tags: ['P21T2', 'P23T2', 'P24T2'],
  },
  {
    title: 'Режим, преференции и особенности',
    tags: [
      'P16T2',
      'P17T2',
      'P12T2',
      'P13T2',
      'P14T2',
      'P15T2',
      'P22T2',
      'P30T2',
      'P213T2',
      'P214T2',
    ],
  },
]
