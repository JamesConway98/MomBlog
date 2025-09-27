export function NewsletterSignup() {
  return (
    <section id="newsletter" className="container mx-auto py-12 scroll-mt-24">
      <div className="card p-8 md:p-10 text-center">
        <h2 className="text-2xl section-title">Join the newsletter</h2>
        <p className="mt-2 text-sm text-muted-foreground">A friendly note in your inbox now and then — no spam.</p>
        <form className="mt-6 mx-auto max-w-md flex gap-2" action="/api/newsletter/subscribe" method="post">
          <input name="email" type="email" placeholder="you@example.com" className="flex-1 border rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" required />
          <button className="btn btn-primary px-5 py-3 rounded-xl" type="submit">Subscribe</button>
        </form>
        <p className="mt-4 signature">xo, Angelise</p>
      </div>
    </section>
  )
}
