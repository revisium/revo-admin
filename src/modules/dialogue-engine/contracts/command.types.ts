export interface CreateDialogueInput {
  agentConfiguration?: unknown
  agentId: string
  agentVersion: string
  agentInstallationId: string
  metadata?: unknown
  systemContext?: string | null
  title: string
}

export interface SendDialogueInput {
  commandId: string
  dialogueId: string
  prompt: string
}

export interface RespondDialogueInput {
  commandId: string
  dialogueId: string
  interactionId: string
  response: unknown
}
