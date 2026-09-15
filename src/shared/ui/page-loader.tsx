import { Loader } from './loader'

/** Placeholder while a route chunk loads; the label appears only if loading takes noticeable time. */
export const PageLoader = ({ label }: { label: string }) => (
  <div role="status" aria-live="polite" className="flex min-h-dvh items-center justify-center px-4">
    <p className="flex items-center gap-3 text-dense text-muted-foreground opacity-0 animate-[page-loader-in_0.2s_ease-out_0.3s_forwards] motion-reduce:opacity-100 motion-reduce:animate-none">
      <Loader size={18} />
      {label}
    </p>
  </div>
)
