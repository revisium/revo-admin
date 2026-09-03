import { useState } from 'react'
import { Box, Button, Grid, HStack, Input, Stack, Text, Textarea } from '@chakra-ui/react'
import { Card, FieldRow, SectionHeading, StatusBadge, TagList } from 'src/shared/ui'
import { RoutePreviewGraph } from 'src/features/RoutePreviewGraph'

interface StepDef {
  readonly index: number
  readonly title: string
}

const STEPS: ReadonlyArray<StepDef> = [
  { index: 0, title: 'Repository' },
  { index: 1, title: 'Run details' },
  { index: 2, title: 'Route preview' },
]

const StepperRail = ({ active }: { readonly active: number }) => (
  <HStack gap="0" align="center">
    {STEPS.map((step, i) => {
      const isActive = step.index === active
      const isDone = step.index < active
      return (
        <HStack key={step.title} gap="0" flex={i === STEPS.length - 1 ? '0' : '1'} align="center">
          <HStack gap="2" flexShrink="0">
            <Box
              w="6"
              h="6"
              borderRadius="full"
              borderWidth="1px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={isActive || isDone ? 'action.primary.bg' : 'bg.surface'}
              borderColor={isActive || isDone ? 'action.primary.bg' : 'border.strong'}
            >
              <Text textStyle="caption" color={isActive || isDone ? 'bg.surface' : 'fg.secondary'}>
                {step.index + 1}
              </Text>
            </Box>
            <Text textStyle="body" color={isActive ? 'fg.default' : 'fg.secondary'}>
              {step.title}
            </Text>
          </HStack>
          {i < STEPS.length - 1 ? <Box flex="1" h="1px" mx="3" bg="border.structural" /> : null}
        </HStack>
      )
    })}
  </HStack>
)

const RepoValidationResult = () => (
  <Card bg="status.success.bg" borderColor="status.success.border">
    <Stack gap="3">
      <HStack justify="space-between">
        <Text textStyle="bodyStrong" color="status.success.fg">
          Repository validated
        </Text>
        <StatusBadge status="completed" />
      </HStack>
      <Stack gap="0">
        <FieldRow label="Default branch">master</FieldRow>
        <FieldRow label="Languages">TypeScript, JavaScript</FieldRow>
        <FieldRow label="Package manager">npm (peer-clean)</FieldRow>
        <FieldRow label="CI">GitHub Actions · verify + SonarCloud</FieldRow>
        <FieldRow label="Context summary">
          React Router v7 SSR admin UI. FSD layout. Verify gate: format, ts:check, lint, steiger, vitest, build.
        </FieldRow>
      </Stack>
    </Stack>
  </Card>
)

const RepoStep = () => (
  <Stack gap="4">
    <Stack gap="1">
      <Text textStyle="body" color="fg.secondary">
        Repository
      </Text>
      <Input defaultValue="revisium/orchestrator-admin" bg="bg.surface" borderColor="border.strong" />
      <Text textStyle="caption" color="fg.secondary">
        Validated via validate_repository + get_repository_context (mock).
      </Text>
    </Stack>
    <RepoValidationResult />
  </Stack>
)

const DetailsStep = () => (
  <Stack gap="4">
    <Stack gap="1">
      <Text textStyle="body" color="fg.secondary">
        Title
      </Text>
      <Input defaultValue="Add release-train workflow" bg="bg.surface" borderColor="border.strong" />
    </Stack>
    <Stack gap="1">
      <Text textStyle="body" color="fg.secondary">
        Description
      </Text>
      <Textarea
        defaultValue="Wire a GitHub Actions release train with semantic version bumps and changelog generation."
        bg="bg.surface"
        borderColor="border.strong"
        rows={3}
      />
    </Stack>
    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="4">
      <Stack gap="1">
        <Text textStyle="body" color="fg.secondary">
          Scope
        </Text>
        <Input defaultValue="ci" bg="bg.surface" borderColor="border.strong" />
      </Stack>
      <Stack gap="1">
        <Text textStyle="body" color="fg.secondary">
          Priority
        </Text>
        <Input defaultValue="high" bg="bg.surface" borderColor="border.strong" />
      </Stack>
    </Grid>
  </Stack>
)

const RouteStep = () => (
  <Stack gap="4">
    <Stack gap="1">
      <Text textStyle="body" color="fg.secondary">
        Proposed pipeline
      </Text>
      <Text textStyle="caption" color="fg.secondary">
        feature-default · roles and gates the orchestrator will route through.
      </Text>
    </Stack>
    <TagList items={['architect', 'plan_gate', 'developer', 'reviewer', 'merge_gate', 'integrator']} />
    <RoutePreviewGraph />
  </Stack>
)

const StepBody = ({ active }: { readonly active: number }) => {
  if (active === 0) {
    return <RepoStep />
  }
  if (active === 1) {
    return <DetailsStep />
  }
  return <RouteStep />
}

const LAST_STEP = STEPS.length - 1

export const CreateRunWizard = () => {
  const [active, setActive] = useState(0)
  const isLast = active === LAST_STEP

  return (
    <Stack gap="5">
      <StepperRail active={active} />
      <Card>
        <Stack gap="4">
          <SectionHeading>{STEPS[active].title}</SectionHeading>
          <StepBody active={active} />
        </Stack>
      </Card>
      <HStack justify="space-between">
        <Button
          variant="outline"
          size="sm"
          disabled={active === 0}
          onClick={() => setActive((step) => Math.max(0, step - 1))}
          borderColor="border.strong"
          color="fg.secondary"
        >
          Back
        </Button>
        {isLast ? (
          <Button
            size="sm"
            bg="action.primary.bg"
            color="bg.surface"
            _hover={{ bg: 'action.primary.hoverBg' }}
            disabled
            title="Prototype: submit is inert"
          >
            Create run
          </Button>
        ) : (
          <Button
            size="sm"
            bg="action.primary.bg"
            color="bg.surface"
            _hover={{ bg: 'action.primary.hoverBg' }}
            onClick={() => setActive((step) => Math.min(LAST_STEP, step + 1))}
          >
            Next
          </Button>
        )}
      </HStack>
    </Stack>
  )
}
