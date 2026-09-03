import { Stack } from '@chakra-ui/react'
import { CreateRunWizard } from 'src/widgets/CreateRunWizard'
import { PageHeader } from 'src/shared/ui/components'

export const RunCreatePage = () => (
  <Stack gap="6" maxW="900px">
    <PageHeader
      eyebrow="New run"
      title="Create run"
      description="Validate a repository, describe the task, and preview the route."
    />
    <CreateRunWizard />
  </Stack>
)
