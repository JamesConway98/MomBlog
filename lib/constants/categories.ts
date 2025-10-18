export const SECTION_CATEGORIES = ['Ideas', 'Home', 'Travel', 'Field Notes', 'Letters'] as const

export type SectionCategory = (typeof SECTION_CATEGORIES)[number]
