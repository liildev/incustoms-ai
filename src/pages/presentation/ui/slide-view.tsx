import type { ComponentType } from 'react'
import type { SlideId } from '../model/slides'
import { CaseSlide } from './case-slide'
import { DefectsSlide } from './defects-slide'
import { EvidenceSlide } from './evidence-slide'
import { FindingSlide } from './finding-slide'
import { ImpactSlide } from './impact-slide'
import { LimitsSlide } from './limits-slide'
import { PromiseSlide } from './promise-slide'
import { RoadmapSlide } from './roadmap-slide'
import { ScopeSlide } from './scope-slide'
import { StrengthsSlide } from './strengths-slide'
import { SummarySlide } from './summary-slide'
import { TargetSlide } from './target-slide'
import { TitleSlide } from './title-slide'

const SLIDE_COMPONENTS: Record<SlideId, ComponentType> = {
  title: TitleSlide,
  summary: SummarySlide,
  promise: PromiseSlide,
  strengths: StrengthsSlide,
  finding: FindingSlide,
  case: CaseSlide,
  impact: ImpactSlide,
  target: TargetSlide,
  next: RoadmapSlide,
  method: ScopeSlide,
  evidence: EvidenceSlide,
  defects: DefectsSlide,
  limits: LimitsSlide,
}

export const SlideView = ({ id }: { id: SlideId }) => {
  const Slide = SLIDE_COMPONENTS[id]
  return <Slide />
}
