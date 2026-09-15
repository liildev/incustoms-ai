import { DropZone } from '@/features/upload-gtd'

export const StartScreen = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-4 py-12">
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">Редактор ГТД</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Просмотр и правка электронной копии грузовой таможенной декларации в формате, действующем с
        10 апреля 2026 года. Откройте файл с корневым элементом{' '}
        <span className="font-mono text-[13px]">GTD_eCopy_DefEdFormat</span>.
      </p>
    </div>
    <DropZone />
    <dl className="grid gap-x-6 gap-y-2 text-dense text-muted-foreground sm:grid-cols-2">
      <div>
        <dt className="font-medium text-foreground">IMEI устройств, T21</dt>
        <dd>Устройство, SIM-слот и IMEI код для каждой позиции графы 31.</dd>
      </div>
      <div>
        <dt className="font-medium text-foreground">ГУПТП, T53 и T54</dt>
        <dd>График периодических платежей с дополнительной таможенной пошлиной (P8T54).</dd>
      </div>
    </dl>
  </main>
)
