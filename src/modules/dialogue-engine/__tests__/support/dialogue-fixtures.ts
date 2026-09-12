import type { DialogueSummary, DialogueItem } from '../../contracts/dialogue.types'

export function dialogueSummary(id: string, title: string, overrides: Partial<DialogueSummary> = {}): DialogueSummary {
  return {
    id,
    title,
    agentId: 'test',
    agentVersion: '1',
    agentInstallationId: 'installation-test',
    agentConfiguration: {},
    status: 'READY',
    progress: '',
    pendingCount: 0,
    createdAt: '2026-09-07',
    updatedAt: '2026-09-07',
    version: '0',
    significantSequence: '0',
    readSignificantSequence: '0',
    unreadCount: 0,
    contextMode: 'NEW',
    ...overrides,
  }
}

export function dialogueItem(
  chat: DialogueSummary,
  id: string,
  text: string,
  overrides: Partial<DialogueItem> = {},
): DialogueItem {
  return {
    id,
    dialogueId: chat.id,
    sequence: '1',
    turnId: 'turn-1',
    kind: 'MESSAGE',
    source: 'AGENT',
    status: 'COMPLETED',
    text,
    version: '1',
    historical: false,
    createdAt: chat.createdAt,
    ...overrides,
  }
}
