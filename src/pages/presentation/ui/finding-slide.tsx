import { FINDING_TITLE } from '../model/chain'
import { ChainDiagram } from './chain-diagram'
import { SlideLayout } from './slide-layout'

export const FindingSlide = () => (
  <SlideLayout title={FINDING_TITLE} className="stage:flex stage:flex-col stage:justify-center">
    <ChainDiagram />
  </SlideLayout>
)
