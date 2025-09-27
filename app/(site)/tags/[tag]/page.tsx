type Props = { params: Promise<{ tag: string }> }

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-semibold">Tag: {decodeURIComponent(tag)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Posts filtered by tag will appear here.</p>
    </main>
  )
}
