import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="container mx-auto py-12">
      <section className="grid gap-8 md:grid-cols-12 items-center">
        <div className="md:col-span-7">
          <h1 className="text-4xl font-semibold section-title">About Angelise</h1>
          <p className="mt-4 text-base text-muted-foreground">
            I share honest snippets from everyday life — family moments, simple
            routines, creative projects, travel notes, and anything else that’s
            bringing me joy or teaching me something new.
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            I hope this space feels welcoming and real. Pour something warm and
            stay a while.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/blog" className="btn btn-primary px-5 py-3 rounded-xl">Read the Blog</Link>
            <Link href="/contact" className="btn btn-outline px-5 py-3 rounded-xl">Say Hello</Link>
          </div>
          <p className="mt-6 signature">xo, Angelise</p>
        </div>
        <div className="md:col-span-5">
          <div className="aspect-[3/4] w-full rounded-2xl card overflow-hidden">
            <Image src="/images/home/gallery-02.jpg" alt="" width={1200} height={1600} className="h-full w-full object-cover object-center" />
          </div>
        </div>
      </section>

      <div className="divider my-12" />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold section-title">What you’ll find here</h2>
          <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Everyday stories and small joys</li>
            <li>Simple, doable routines and ideas</li>
            <li>Creative projects and inspiration</li>
            <li>Travel notes and favorite places</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold section-title">A few things about me</h2>
          <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Big fan of cozy mornings</li>
            <li>Always taking too many photos</li>
            <li>Finds joy in the little details</li>
            <li>Believes in sharing the real stuff</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
