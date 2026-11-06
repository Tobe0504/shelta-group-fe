/** Title block for simple pages. */
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 max-sm:gap-2">
      <div className="flex max-w-2xl flex-col gap-2 max-sm:gap-0.5">
        <h1 className="text-3xl max-sm:text-xl">{title}</h1>
        {description && <p className="text-muted-foreground max-sm:text-xs">{description}</p>}
      </div>
      {children}
    </div>
  )
}
