import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }
  return <>{children}</>
}
