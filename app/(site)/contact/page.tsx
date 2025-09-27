export default function ContactPage() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-semibold" style={{fontFamily:'var(--font-display)'}}>Get in touch</h1>
      <p className="mt-2 text-sm text-muted-foreground">Have a question, a story, or a hello? I’d love to hear from you.</p>
      <form className="mt-8 max-w-md space-y-4 card p-6" action="/api/contact" method="post">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" placeholder="Your name" className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" type="email" placeholder="you@example.com" className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea name="message" placeholder="Write your note..." className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" rows={5} />
        </div>
        <button className="btn btn-primary px-5 py-3 rounded-xl" type="submit">Send message</button>
      </form>
    </main>
  )
}
