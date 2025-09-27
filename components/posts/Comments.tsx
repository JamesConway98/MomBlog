// Placeholder that will conditionally render Giscus or Disqus from settings
type Props = { enabled?: boolean }

export function Comments({ enabled = false }: Props) {
  if (!enabled) return null
  return (
    <section className="mt-10 border-t pt-6">
      <p className="text-sm text-muted-foreground">Comments widget will appear here based on settings.</p>
    </section>
  )
}

