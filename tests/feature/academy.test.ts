import type { CatalogEntry, Outline } from '@cursio/academy'
import { describe, expect, test } from 'bun:test'
import { openingEpisodes, totalsOf } from '../../app/Support/academy'

/** What the home page works out from the academy's catalog. */

const entry = (lessons: number, seconds: number): CatalogEntry => ({ title: 'A series', slug: 'a-series', summary: null, level: 'beginner', topic: null, lessons, seconds, hasPreview: true })

describe('the numbers under the headline', () => {
  test('are counted from the catalog', () => {
    expect(totalsOf([entry(8, 1680), entry(12, 4200)])).toEqual({ series: 2, episodes: 20, time: '1h 38m' })
  })

  test('an empty catalog counts nothing and shows no running time', () => {
    expect(totalsOf([])).toEqual({ series: 0, episodes: 0, time: '' })
  })
})

describe('the opening episodes of a series', () => {
  const outline: Outline = {
    lessonIds: [4, 5, 6],
    sections: [
      { id: 1, title: 'One', position: 0, lessons: [{ id: 4, title: 'Intro', kind: 'reading', position: 0, duration_seconds: 185, is_preview: 1 }] },
      { id: 2, title: 'Two', position: 1, lessons: [
        { id: 5, title: 'Setup', kind: 'reading', position: 0, duration_seconds: 0, is_preview: 0 },
        { id: 6, title: 'Build', kind: 'video', position: 1, duration_seconds: 600, is_preview: 0 },
      ] },
    ],
  }

  test('are numbered across sections, with a clock and a link to each', () => {
    expect(openingEpisodes('bootcamp', outline, 2)).toEqual([
      { number: 1, title: 'Intro', clock: '3:05', free: true, href: '/series/bootcamp?episode=1' },
      { number: 2, title: 'Setup', clock: '', free: false, href: '/series/bootcamp?episode=2' },
    ])
  })
})
