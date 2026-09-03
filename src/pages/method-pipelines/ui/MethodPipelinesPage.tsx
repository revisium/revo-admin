import { Stack } from '@chakra-ui/react'
import { MethodTabs } from 'src/features/MethodTabs'
import { SchemaV2Action } from 'src/shared/ui'
import { PIPELINES } from 'src/shared/fixtures'
import { PipelinesList } from 'src/widgets/PipelinesList'
import { PageHeader } from 'src/shared/ui/components'

interface MethodPipelinesPageProps {
  readonly selectedPipelineId?: string
}

export const MethodPipelinesPage = ({ selectedPipelineId }: MethodPipelinesPageProps) => (
  <Stack gap="6">
    <PageHeader
      eyebrow="The method"
      title="Method"
      description="Typed, versioned definitions that govern every run — pipelines, roles, and installed playbooks."
      actions={<SchemaV2Action />}
    />
    <MethodTabs active="pipelines" />
    <PipelinesList pipelines={PIPELINES} selectedPipelineId={selectedPipelineId} />
  </Stack>
)
