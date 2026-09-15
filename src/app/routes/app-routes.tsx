import { Suspense, useRef, useState } from 'react'
import { Redirect, Route, Switch, useLocation, useRoute } from 'wouter'
import { NotFoundPage } from '@/pages/not-found'
import { ROUTES } from '@/shared/config/routes'
import { ViewVisibilityContext } from '@/shared/lib/view/view-visibility'
import { PageLoader } from '@/shared/ui'
import { GtdEditorPage, PresentationPage } from './lazy-pages'
import { RouteErrorBoundary } from './route-error-boundary'
import { useFocusOnShow } from './use-focus-on-show'

const GTD_HINT =
  'Обновите страницу и откройте XML-файл заново. Изменения, не экспортированные в файл, не сохранились.'
const OTHER_ROUTE_HINT = 'Вернитесь на предыдущую страницу или обновите эту.'
/** The editor kept in the background may hold a declaration; a reload would discard it, so Back comes first. */
const OTHER_ROUTE_WITH_GTD_HINT = `${OTHER_ROUTE_HINT} Обновление закроет файл, открытый в редакторе ГТД.`

/**
 * Once opened, the GTD editor stays mounted (hidden) while other routes are shown, so leaving
 * /gtd inside the app never discards the loaded declaration or unsaved form edits.
 * Each branch has its own error boundary, so a failure in one never unmounts the other.
 * Leaving the application itself is guarded by the editor's beforeunload warning.
 * The other branch's boundary resets on navigation, except between slides of the presentation:
 * a remount there would drop the slide transition and exit fullscreen.
 */
export const AppRoutes = () => {
  const [location] = useLocation()
  const [onGtd] = useRoute(ROUTES.gtd)
  const [onPresentation] = useRoute(ROUTES.presentationSlide)
  const [gtdOpened, setGtdOpened] = useState(onGtd)
  if (onGtd && !gtdOpened) setGtdOpened(true)

  const gtdRef = useRef<HTMLDivElement>(null)
  useFocusOnShow(gtdRef, onGtd)

  return (
    <>
      {onGtd ? <title>Редактор ГТД</title> : null}
      {gtdOpened ? (
        <div ref={gtdRef} hidden={!onGtd} tabIndex={-1} className="outline-none">
          <ViewVisibilityContext value={onGtd}>
            <RouteErrorBoundary recoveryHint={GTD_HINT}>
              <Suspense fallback={<PageLoader label="Загрузка редактора ГТД…" />}>
                <GtdEditorPage />
              </Suspense>
            </RouteErrorBoundary>
          </ViewVisibilityContext>
        </div>
      ) : null}
      {onGtd ? null : (
        <RouteErrorBoundary
          key={onPresentation ? ROUTES.presentation : location}
          recoveryHint={gtdOpened ? OTHER_ROUTE_WITH_GTD_HINT : OTHER_ROUTE_HINT}
        >
          <Switch>
            <Route path={ROUTES.root}>
              <Redirect to={ROUTES.gtd} replace />
            </Route>
            <Route path={ROUTES.presentationSlide}>
              <Suspense fallback={<PageLoader label="Загрузка презентации…" />}>
                <PresentationPage />
              </Suspense>
            </Route>
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </RouteErrorBoundary>
      )}
    </>
  )
}
