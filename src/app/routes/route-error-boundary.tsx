import { RotateCw } from 'lucide-react'
import { Component, createRef, type ReactNode } from 'react'
import { Button } from '@/shared/ui'

type RouteErrorBoundaryProps = {
  /** What a reload costs on this route, shown after a render failure. */
  recoveryHint: string
  children: ReactNode
}
type RouteErrorBoundaryState = { error: unknown }

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const isChunkLoadError = (error: unknown): boolean =>
  /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
    describeError(error),
  )

/** Recoverable state for a route whose chunk failed to load or that crashed while rendering. */
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null }

  private headingRef = createRef<HTMLHeadingElement>()

  static getDerivedStateFromError(error: unknown): RouteErrorBoundaryState {
    return { error: error ?? new Error('Unknown error') }
  }

  componentDidUpdate(_: RouteErrorBoundaryProps, previous: RouteErrorBoundaryState) {
    if (this.state.error && !previous.error) this.headingRef.current?.focus()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const chunk = isChunkLoadError(error)

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-4 px-4 py-12">
        <div role="alert" className="flex flex-col gap-4">
          <h1
            ref={this.headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-[-0.015em] text-foreground outline-none"
          >
            {chunk ? 'Не удалось загрузить страницу' : 'Страница остановлена из-за ошибки'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {chunk
              ? 'Файлы приложения не загрузились. Проверьте подключение к сети и обновите страницу.'
              : this.props.recoveryHint}
          </p>
        </div>
        {chunk ? null : (
          <details className="text-dense text-subtle-foreground">
            <summary className="cursor-pointer">Технические сведения</summary>
            <p className="mt-2 font-mono text-[12px] wrap-break-word">{describeError(error)}</p>
          </details>
        )}
        <div>
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden />
            Обновить страницу
          </Button>
        </div>
      </main>
    )
  }
}
