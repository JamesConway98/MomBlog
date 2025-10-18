export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-[hsl(var(--muted))]">
      <div className="container mx-auto px-4 py-12 text-sm text-muted-foreground">
        <p className="text-[0.68rem] uppercase tracking-[0.4em] text-black">
          Angelise Journal
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed">
          Reflections on life at home, in transit, and in the spaces in between. Fresh
          stories land here every week.
        </p>
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} Angelise. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
