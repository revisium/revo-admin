import type { TimelineRow, TimelineSegment } from './timeline.types'

export const timelineSegments = (rows: readonly TimelineRow[]): TimelineSegment[] => {
  const segments: TimelineSegment[] = []

  for (const row of rows) {
    if (row.blockType === 'message' || row.standalone) {
      segments.push({ type: 'standalone', item: row })
      continue
    }

    if (!row.visible) continue

    const previous = segments.at(-1)

    if (previous?.type === 'activity' && previous.turnKey === row.turnKey) {
      previous.items.push(row)
    } else {
      segments.push({ type: 'activity', id: row.id, turnKey: row.turnKey, items: [row] })
    }
  }

  return segments
}
