import { Component, type ReactNode } from 'react'
import { Button, Dialog } from '@/shared/ui'

type PrintBoundaryProps = { onClose: () => void; children: ReactNode }
type PrintBoundaryState = { failed: boolean }

/**
 * Keeps a failure of the printable form inside the preview. Without it the error would reach the route
 * boundary, which remounts the editor and drops the loaded document and unsaved edits.
 */
export class PrintBoundary extends Component<PrintBoundaryProps, PrintBoundaryState> {
  state: PrintBoundaryState = { failed: false }

  static getDerivedStateFromError(): PrintBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Dialog
        open
        title="Печатная форма не открылась"
        description="Документ и правки не изменены. Закройте окно и попробуйте ещё раз; экспорт XML работает как прежде."
        onClose={this.props.onClose}
        actions={
          <Button variant="primary" onClick={this.props.onClose}>
            Закрыть
          </Button>
        }
      />
    )
  }
}
