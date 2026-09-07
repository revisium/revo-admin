import { Stack, Text } from '@chakra-ui/react'

export const ProjectOverviewPage = () => (
  <Stack data-testid="project-content-overview" gap="8">
    <Text id="project-overview-section-heading" as="h2" textStyle="sectionTitle" color="fg.default">
      Overview
    </Text>
  </Stack>
)

ProjectOverviewPage.displayName = 'ProjectOverviewPage'
