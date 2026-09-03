import { Box, Center, Grid, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, GitBranch, Layers3 } from 'lucide-react'
import { Link } from 'react-router'
import { PipelineGraph } from 'src/features/PipelineGraph'
import { AccentBadge, Card, FieldRow, SectionHeading, TagList } from 'src/shared/ui'
import type { PipelineRow } from 'src/shared/fixtures'

interface PipelinesListProps {
  readonly pipelines: ReadonlyArray<PipelineRow>
  readonly selectedPipelineId?: string
}

const defaultPipeline = (
  pipelines: ReadonlyArray<PipelineRow>,
  selectedPipelineId: string | undefined,
): PipelineRow | undefined => {
  if (selectedPipelineId === undefined) return pipelines[0]
  return pipelines.find((pipeline) => pipeline.id === selectedPipelineId)
}

const PipelineCard = ({ active, pipeline }: { readonly active: boolean; readonly pipeline: PipelineRow }) => (
  <ChakraLink
    asChild
    display="block"
    color="inherit"
    _hover={{ textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
  >
    <Link to={`/method/pipelines/${pipeline.id}`}>
      <Card
        className="group"
        p="4"
        borderColor={active ? 'brand.softBorder' : 'border'}
        bg={active ? 'brand.soft' : 'bg.1'}
        transition="border-color 0.15s, transform 0.15s"
        _hover={{ borderColor: 'border.warmStrong', transform: 'translateY(-1px)' }}
      >
        <Stack gap="3">
          <HStack justify="space-between" gap="3">
            <HStack gap="2" minW="0">
              <Center
                boxSize="30px"
                borderRadius="8px"
                bg="bg.inset"
                borderWidth="1px"
                borderColor="border"
                color="fg.2"
              >
                <Layers3 size={15} />
              </Center>
              <Text className="mono" textStyle="semibold-sm" color="fg.0" truncate>
                {pipeline.pipelineId}
              </Text>
            </HStack>
            <Box color="fg.3" transition="transform 0.15s" _groupHover={{ transform: 'translateX(3px)' }}>
              <ArrowRight size={15} />
            </Box>
          </HStack>
          <HStack gap="1.5" wrap="wrap">
            {pipeline.requiredRoles.map((role) => (
              <Text
                key={role}
                as="span"
                px="2"
                py="0.5"
                borderRadius="chip"
                bg="accent.role.bg"
                color="accent.role.fg"
                textStyle="medium-xs"
              >
                {role}
              </Text>
            ))}
          </HStack>
          <HStack gap="2" wrap="wrap">
            {pipeline.routeGates.map((gate) => (
              <AccentBadge key={gate} kind="gate">
                {gate.replaceAll('_', ' ')}
              </AccentBadge>
            ))}
          </HStack>
        </Stack>
      </Card>
    </Link>
  </ChakraLink>
)

const PipelineDetail = ({ pipeline }: { readonly pipeline: PipelineRow }) => (
  <Stack gap="4">
    <Card p="0" overflow="hidden">
      <HStack gap="3" justify="space-between" p="4.5" borderBottomWidth="1px" borderColor="border.subtle">
        <Stack gap="0.5" minW="0">
          <Text className="mono" color="fg.0" textStyle="semibold-md" truncate>
            {pipeline.pipelineId}
          </Text>
          <Text color="fg.2" textStyle="regular-sm">
            {pipeline.requiredRoles.length} required roles · {pipeline.routeGates.length} gates
          </Text>
        </Stack>
        <HStack
          px="2"
          py="0.5"
          gap="1.5"
          borderRadius="chip"
          borderWidth="1px"
          borderColor="border"
          bg="bg.inset"
          color="fg.2"
          textStyle="medium-xs"
        >
          <GitBranch size={12} />
          pipeline
        </HStack>
      </HStack>
      <Box p="4.5" borderBottomWidth="1px" borderColor="border.subtle">
        <PipelineGraph />
      </Box>
      <Stack gap="0" px="4.5" py="2">
        <FieldRow label="Triggers">
          <TagList items={pipeline.triggers} />
        </FieldRow>
        <FieldRow label="Required roles">
          <TagList items={pipeline.requiredRoles} />
        </FieldRow>
        <FieldRow label="Optional roles">
          {pipeline.optionalRoles.length === 0 ? (
            <Text textStyle="regular-sm" color="fg.3">
              none
            </Text>
          ) : (
            <TagList items={pipeline.optionalRoles} />
          )}
        </FieldRow>
        <FieldRow label="Alternatives">
          {pipeline.alternativeRoles.length === 0 ? (
            <Text textStyle="regular-sm" color="fg.3">
              none
            </Text>
          ) : (
            <Stack gap="1">
              {pipeline.alternativeRoles.map((alt) => (
                <Text key={alt.role} textStyle="regular-sm" color="fg.1">
                  {alt.role} → {alt.alternative}
                </Text>
              ))}
            </Stack>
          )}
        </FieldRow>
        <FieldRow label="Route gates">
          <HStack gap="2" wrap="wrap">
            {pipeline.routeGates.map((gate) => (
              <AccentBadge key={gate} kind="gate">
                {gate.replaceAll('_', ' ')}
              </AccentBadge>
            ))}
          </HStack>
        </FieldRow>
      </Stack>
    </Card>
    <Stack gap="2">
      <SectionHeading>Route graph</SectionHeading>
      <Text textStyle="regular-sm" color="fg.3">
        Ordered roles and gates. Dashed nodes are optional; alternatives are annotated inline.
      </Text>
    </Stack>
  </Stack>
)

export const PipelinesList = ({ pipelines, selectedPipelineId }: PipelinesListProps) => {
  const selectedPipeline = defaultPipeline(pipelines, selectedPipelineId)

  if (!selectedPipeline) return null

  return (
    <Grid templateColumns={{ base: '1fr', xl: 'minmax(280px, 0.62fr) minmax(0, 1.38fr)' }} gap="5" alignItems="start">
      <Stack gap="3">
        {pipelines.map((pipeline) => (
          <PipelineCard key={pipeline.id} pipeline={pipeline} active={pipeline.id === selectedPipeline.id} />
        ))}
      </Stack>
      <PipelineDetail pipeline={selectedPipeline} />
    </Grid>
  )
}
