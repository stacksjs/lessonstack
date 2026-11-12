import type { Academy, CatalogEntry, Course, Outline } from '@cursio/academy'
import { createCursio, runtime } from '@cursio/academy'
import { env } from '@stacksjs/env'

/**
 * LessonStack is the front of one Cursio academy. Everything a page shows of
 * it is read here, on the server, and a page that cannot reach Cursio still
 * renders: it says so instead of failing.
 */

/** Where the browser's own calls go: this app forwards them to Cursio. */
export const learnApi = '/api/cursio/learn'

function cursio() {
  const settings = env as unknown as Record<string, string | undefined>
  return createCursio({ url: settings.CURSIO_URL ?? '', academy: settings.CURSIO_ACADEMY ?? '' })
}

export interface Shelf {
  school: Academy | null
  entries: CatalogEntry[]
  /** Counted from the catalog itself, never typed in. */
  totals: { series: number, episodes: number, time: string }
}

export function totalsOf(entries: CatalogEntry[]): Shelf['totals'] {
  return {
    series: entries.length,
    episodes: entries.reduce((sum, entry) => sum + entry.lessons, 0),
    time: runtime(entries.reduce((sum, entry) => sum + entry.seconds, 0)),
  }
}

export async function shelf(): Promise<Shelf> {
  try {
    const { academy, courses } = await cursio().catalog()
    return { school: academy, entries: courses, totals: totalsOf(courses) }
  }
  catch {
    return { school: null, entries: [], totals: totalsOf([]) }
  }
}

export interface OpenSeries {
  school: Academy
  course: Course
  outline: Outline
}

export async function series(slug: string): Promise<OpenSeries | null> {
  try {
    const found = await cursio().course(slug)
    return found ? { school: found.academy, course: found.course, outline: found.outline } : null
  }
  catch {
    return null
  }
}

export interface EpisodeLine {
  number: number
  title: string
  clock: string
  free: boolean
  href: string
}

/** The first episodes of a series, as the home page lists them. */
export function openingEpisodes(slug: string, outline: Outline, count: number): EpisodeLine[] {
  return outline.sections.flatMap(section => section.lessons).slice(0, count).map((lesson, index) => ({
    number: index + 1,
    title: lesson.title,
    clock: lesson.duration_seconds > 0 ? `${Math.floor(lesson.duration_seconds / 60)}:${String(lesson.duration_seconds % 60).padStart(2, '0')}` : '',
    free: Boolean(lesson.is_preview),
    href: `/series/${slug}?episode=${index + 1}`,
  }))
}
