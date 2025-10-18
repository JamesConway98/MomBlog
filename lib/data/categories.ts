import { SECTION_CATEGORIES, type SectionCategory } from '@/lib/constants/categories'
import { getSupabaseClient } from '@/lib/supabase'

export type DbCategory = {
  id: number
  name: string
}

const CATEGORY_ORDER = new Map<SectionCategory, number>(
  Array.from(SECTION_CATEGORIES).map((name, index) => [name, index])
)

async function fetchCategories(client: ReturnType<typeof getSupabaseClient>) {
  const { data, error } = await client.from('categories').select('id,name')
  if (error) throw error
  return (data ?? []) as DbCategory[]
}

export async function listCategories(): Promise<DbCategory[]> {
  const supabase = getSupabaseClient()
  let categories = await fetchCategories(supabase)

  const missingNames = Array.from(SECTION_CATEGORIES).filter(
    (name) => !categories.some((category) => category.name === name)
  )

  if (missingNames.length > 0) {
    const { error: seedError } = await supabase
      .from('categories')
      .upsert(missingNames.map((name) => ({ name })), { onConflict: 'name' })

    if (seedError) throw seedError
    categories = await fetchCategories(supabase)
  }

  return categories.sort((a, b) => {
    const aIndex = CATEGORY_ORDER.get(a.name as SectionCategory) ?? Number.MAX_SAFE_INTEGER
    const bIndex = CATEGORY_ORDER.get(b.name as SectionCategory) ?? Number.MAX_SAFE_INTEGER
    return aIndex - bIndex
  })
}
