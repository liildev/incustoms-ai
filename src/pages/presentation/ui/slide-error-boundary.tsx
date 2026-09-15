import { Component, type ReactNode } from 'react'
import { TYPE } from './slide-type'

type SlideErrorBoundaryProps = { children: ReactNode }
type SlideErrorBoundaryState = { failed: boolean }

/**
 * Contains a rendering failure to one slide. Keyed by slide in the stage, so moving to another slide
 * clears it; the deck controls stay usable and the kept-alive GTD editor is never reloaded.
 */
export class SlideErrorBoundary extends Component<
  SlideErrorBoundaryProps,
  SlideErrorBoundaryState
> {
  state: SlideErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): SlideErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div
        role="alert"
        className="flex min-h-full flex-col justify-center gap-3 px-5 py-10 stage:h-full stage:px-[128px]"
      >
        <p className={TYPE.title}>Этот слайд не отобразился</p>
        <p className={TYPE.note}>Перейдите к соседнему слайду стрелками или кнопками внизу.</p>
      </div>
    )
  }
}
