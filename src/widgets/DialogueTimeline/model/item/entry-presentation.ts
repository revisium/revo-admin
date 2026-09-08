import type { DialogueEntry } from 'src/modules/dialogue-engine'

export const entryNotice = (item: DialogueEntry): string => {
  switch (item.status) {
    case 'CANCELLED':
      return 'Stopped. Any partial response has been saved.'
    case 'FAILED':
      return item.kind === 'MESSAGE'
        ? 'The response could not be completed.'
        : item.text || 'This step could not be completed.'
    case 'INTERRUPTED':
      return 'Execution was interrupted.'
    case 'PARTIAL':
      return 'Partial response saved.'
    case 'ABANDONED':
      return 'This request is no longer active.'
    case 'UNCERTAIN':
      return 'Execution could not be confirmed.'
    default:
      return ''
  }
}

export const entryVisible = (item: DialogueEntry): boolean =>
  Boolean(entryNotice(item)) || !['RESULT', 'USAGE', 'CHECKPOINT'].includes(item.kind)

export const activityWorking = (item: DialogueEntry): boolean =>
  ['STARTED', 'IN_PROGRESS', 'PENDING', 'RESPONDING', 'STREAMING'].includes(item.status)

export const activitySummary = (item: DialogueEntry): string => {
  const payload = item.payload

  if (payload && typeof payload === 'object' && 'title' in payload && typeof payload.title === 'string') {
    return payload.title
  }

  return item.text.split('\n')[0] || (item.kind === 'OPERATION' ? 'Using a tool' : 'Agent activity')
}
