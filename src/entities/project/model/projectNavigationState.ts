import { type Project } from './types'

export const projectFromNavigationState = (state: unknown, projectId: string): Project | undefined => {
  if (!state || typeof state !== 'object' || !('project' in state)) return undefined

  const project = state.project
  if (!project || typeof project !== 'object') return undefined

  const candidate = project as Record<string, unknown>
  if (
    candidate.id !== projectId ||
    typeof candidate.name !== 'string' ||
    typeof candidate.description !== 'string' ||
    (candidate.status !== 'active' && candidate.status !== 'archived') ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.updatedAt !== 'string'
  )
    return undefined

  return {
    id: candidate.id,
    name: candidate.name,
    description: candidate.description,
    status: candidate.status,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  }
}
