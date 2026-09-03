import { type ReactNode } from 'react'
import { FeedbackBlock } from '../FeedbackBlock/FeedbackBlock'

interface EmptyStateProps {
  readonly title: string
  readonly description: ReactNode
  readonly action: ReactNode
  readonly headingLevel?: 'h2' | 'h3'
}

// Shown when a collection is genuinely empty. The description explains what is absent
// and why it matters. The action provides the required next step.
export const EmptyState = ({ title, description, action, headingLevel }: EmptyStateProps) => (
  <FeedbackBlock title={title} description={description} action={action} headingLevel={headingLevel} />
)

EmptyState.displayName = 'EmptyState'

export type { EmptyStateProps }
