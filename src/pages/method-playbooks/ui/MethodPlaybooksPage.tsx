import { Stack } from '@chakra-ui/react'
import { MethodTabs } from 'src/features/MethodTabs'
import { Card, SchemaV2Action } from 'src/shared/ui'
import { PLAYBOOKS } from 'src/shared/fixtures'
import { PlaybooksList } from 'src/widgets/PlaybooksList'
import { PageHeader } from 'src/shared/ui/components'

export const MethodPlaybooksPage = () => (
  <Stack gap="6">
    <PageHeader
      eyebrow="The method"
      title="Method"
      description="Typed, versioned definitions that govern every run — pipelines, roles, and installed playbooks."
      actions={<SchemaV2Action />}
    />
    <MethodTabs active="playbooks" />
    <Card p="4">
      <PlaybooksList playbooks={PLAYBOOKS} />
    </Card>
  </Stack>
)
