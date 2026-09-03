import { Heading } from '@chakra-ui/react'

interface SectionHeadingProps {
  readonly children: string
}

// Section title (.sec-head__title): h2 scale, semibold, ink.
export const SectionHeading = ({ children }: SectionHeadingProps) => (
  <Heading textStyle="componentTitle" letterSpacing="-0.01em" color="fg.default">
    {children}
  </Heading>
)
