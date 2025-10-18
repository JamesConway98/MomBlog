export function NewsletterSignup() {
  return (
    <section id="newsletter" className="scroll-mt-24 border-y border-black/10 bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-[2fr,3fr] md:items-center">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif headline">
              Stay with the story.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:max-w-prose">
              Sign up for the Sunday dispatch: one feature, a handful of quick reads, and
              the moments worth savoring.
            </p>
          </div>
          <form
            className="flex flex-col gap-4 md:flex-row md:items-center"
            action="/api/newsletter/subscribe"
            method="post"
          >
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full flex-1 border border-black/40 bg-transparent px-4 py-3 text-base uppercase tracking-[0.2em] focus:border-black focus:outline-none"
              required
            />
            <button className="btn btn-primary" type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
