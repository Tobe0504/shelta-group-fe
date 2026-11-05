/** Title block shared by every auth screen. */
export function AuthHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-3xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
