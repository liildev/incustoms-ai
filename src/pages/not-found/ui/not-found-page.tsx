import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { ROUTES } from '@/shared/config/routes'
import { ButtonLink } from '@/shared/ui'

export const NotFoundPage = () => {
  const [location] = useLocation()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [location])

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-4 px-4 py-12">
      <title>Страница не найдена | Редактор ГТД</title>
      <p className="text-dense font-medium text-subtle-foreground">Ошибка 404</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold tracking-[-0.015em] text-foreground outline-none"
      >
        Страница не найдена
      </h1>
      <p className="text-sm text-muted-foreground">
        Адрес <span className="font-mono text-[13px] break-all text-foreground">{location}</span> не
        относится ни к одному разделу приложения.
      </p>
      <div>
        <Link href={ROUTES.gtd} asChild>
          <ButtonLink variant="primary">Перейти к редактору ГТД</ButtonLink>
        </Link>
      </div>
    </main>
  )
}
