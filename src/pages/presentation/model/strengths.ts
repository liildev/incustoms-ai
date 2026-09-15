import type { AuditSource } from './audit-source'

/** `proof` is verbatim product output: a server response (`code`) or interface copy (`quote`). */
export type Strength = {
  title: string
  facts: readonly string[]
  proof: { label: string; kind: 'code' | 'quote'; text: string }
  source: AuditSource
}

export const STRENGTHS_LEAD = 'Воспроизведено на свежих учётных записях 05–07.09.'

export const STRENGTHS: readonly Strength[] = [
  {
    title: 'Заявка → принятие → чат',
    facts: [
      'Обращение становится заявкой, как только клиент прикладывает документ; переводит сервер',
      'Декларант принимает заявку, чат работает в обе стороны',
    ],
    proof: {
      label: 'Ответ сервера на принятие',
      kind: 'code',
      text: 'claim_order → "claimed": true, "status": "processing"',
    },
    source: 'V2 §2.2 (steps 8, 10–11), §2.2b',
  },
  {
    title: 'Автономный OCR → ГТД',
    facts: ['Шесть этапов от загрузки до экспорта', '52 поля по трём товарам, уверенность 82 %'],
    proof: {
      label: 'Валидатор ГТД сам пишет',
      kind: 'quote',
      text: 'гр.45 ДТС Метод 1: при условии поставки FCA укажите расходы по перевозке',
    },
    source: 'V2 §3.1, §14',
  },
  {
    title: 'Склад',
    facts: [
      'Десять вкладок; проверены справочник, размещение, движения и остатки',
      'Реестр из 476 таможенных складов с кодами',
    ],
    proof: {
      label: 'Текст интерфейса',
      kind: 'quote',
      text: 'Остатки по строкам ГТД: приход − расход по каждой строке ГТД и складу',
    },
    source: 'V2 §8.2; Δ §5.1',
  },
]
