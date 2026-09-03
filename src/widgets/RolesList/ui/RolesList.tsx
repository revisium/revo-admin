import { Box, Grid, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { Link } from 'react-router'
import { AccentBadge, Card, FieldRow, ModelChip, RoleToken, SectionHeading, TagList } from 'src/shared/ui'
import type { RoleRow } from 'src/shared/fixtures'

interface RolesListProps {
  readonly roles: ReadonlyArray<RoleRow>
  readonly selectedRoleId?: string
}

const defaultRole = (roles: ReadonlyArray<RoleRow>, selectedRoleId: string | undefined): RoleRow | undefined =>
  roles.find((role) => role.id === selectedRoleId) ?? roles[0]

const RunnerBadge = ({ runner }: { readonly runner: string }) => (
  <Text
    as="span"
    px="2"
    py="0.5"
    borderRadius="control"
    borderWidth="1px"
    borderColor="border.structural"
    bg="bg.subtle"
    color="fg.secondary"
    textStyle="caption"
    whiteSpace="nowrap"
  >
    {runner}
  </Text>
)

const RoleCard = ({ active, role }: { readonly active: boolean; readonly role: RoleRow }) => (
  <ChakraLink
    asChild
    display="block"
    color="inherit"
    _hover={{ textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'fg.default', outlineOffset: '3px' }}
  >
    <Link to={`/method/roles/${role.id}`}>
      <Card
        p="4"
        h="100%"
        borderColor={active ? 'fg.default' : 'border.structural'}
        bg={active ? 'bg.subtle' : 'bg.surface'}
        transition="border-color 0.15s, background-color 0.15s"
        _hover={{ borderColor: 'border.strong' }}
      >
        <Stack gap="3">
          <HStack justify="space-between" align="start" gap="3">
            <HStack gap="3" minW="0">
              <RoleToken name={role.name} size={32} />
              <Stack gap="0.5" minW="0">
                <Text className="mono" textStyle="bodyStrong" color="fg.default" truncate>
                  {role.name}
                </Text>
                <Text textStyle="caption" color="fg.secondary" truncate>
                  {role.surface}
                </Text>
              </Stack>
            </HStack>
            <ModelChip level={role.modelLevel} />
          </HStack>
          <HStack gap="2" justify="space-between" wrap="wrap">
            <RunnerBadge runner={role.runner} />
            <Text className="mono" textStyle="caption" color="fg.muted">
              {role.rights}
            </Text>
          </HStack>
        </Stack>
      </Card>
    </Link>
  </ChakraLink>
)

const RoleDetail = ({ role }: { readonly role: RoleRow }) => (
  <Stack gap="4">
    <Card p="0" overflow="hidden">
      <HStack gap="3" p="4.5" borderBottomWidth="1px" borderColor="border.structural">
        <RoleToken name={role.name} size={40} />
        <Stack gap="0.5" minW="0" flex="1">
          <Text className="mono" textStyle="componentTitle" color="fg.default">
            {role.name}
          </Text>
          <Text textStyle="small" color="fg.secondary">
            {role.surface} · {role.scope}
          </Text>
        </Stack>
        <ModelChip level={role.modelLevel} />
      </HStack>
      <Stack gap="0" px="4.5" py="2">
        <FieldRow label="Model level">
          <HStack gap="2" wrap="wrap">
            <ModelChip level={role.modelLevel} />
            <Text color="fg.secondary" textStyle="small">
              effort: {role.effort}
            </Text>
          </HStack>
        </FieldRow>
        <FieldRow label="Runner">
          <RunnerBadge runner={role.runner} />
        </FieldRow>
        <FieldRow label="Rights">{role.rights}</FieldRow>
        <FieldRow label="Surface">
          <AccentBadge kind="role">{role.surface}</AccentBadge>
        </FieldRow>
        <FieldRow label="Allowed tools">
          <TagList items={role.allowedTools} />
        </FieldRow>
        <FieldRow label="Playbook">{role.playbookId}</FieldRow>
      </Stack>
    </Card>
    <Card>
      <Stack gap="3">
        <SectionHeading>System prompt</SectionHeading>
        <Box
          className="mono"
          bg="bg.subtle"
          borderRadius="card"
          p="4"
          borderWidth="1px"
          borderColor="border.structural"
        >
          <Text textStyle="small" color="fg.secondary" whiteSpace="pre-wrap">
            {role.systemPromptPreview}
          </Text>
        </Box>
      </Stack>
    </Card>
  </Stack>
)

export const RolesList = ({ roles, selectedRoleId }: RolesListProps) => {
  const selectedRole = defaultRole(roles, selectedRoleId)

  if (!selectedRole) return null

  return (
    <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 0.95fr) minmax(420px, 1.05fr)' }} gap="5" alignItems="start">
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: '1fr' }} gap="3">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} active={role.id === selectedRole.id} />
        ))}
      </Grid>
      <RoleDetail role={selectedRole} />
    </Grid>
  )
}
