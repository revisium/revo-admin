import { Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PreviewHeadingProps {
  readonly children: ReactNode
}

export const PreviewSectionHeading = ({ children }: PreviewHeadingProps) => (
  <Text as="h2" textStyle="sectionTitle" marginBottom="8" color="fg.default">
    {children}
  </Text>
)

PreviewSectionHeading.displayName = 'PreviewSectionHeading'

export const PreviewSubsectionHeading = ({ children }: PreviewHeadingProps) => (
  <Text textStyle="componentTitle" marginBottom="4" color="fg.default">
    {children}
  </Text>
)

PreviewSubsectionHeading.displayName = 'PreviewSubsectionHeading'
