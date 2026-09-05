import { Box, Link as ChakraLink, Text } from '@chakra-ui/react'
import type React from 'react'
import { Link } from 'react-router'
import { ProjectStatusBadge } from 'src/entities/project'
import type { ProjectListItem } from '../../model/types'

interface ProjectListProps {
  readonly rows: readonly ProjectListItem[]
}

export const ProjectList: React.FC<ProjectListProps> = ({ rows }) => (
  <Box as="nav" aria-label="Projects">
    {rows.map((row) => (
      <ChakraLink
        key={row.id}
        asChild
        color="inherit"
        textDecoration="none"
        display="grid"
        alignItems={{ base: 'start', xl: 'center' }}
        columnGap={{ base: '3', xl: '4' }}
        rowGap={{ base: '1', xl: '0' }}
        gridTemplateColumns={{
          base: 'minmax(0, 1fr) auto',
          xl: 'minmax(200px, 1.7fr) minmax(135px, 0.9fr) minmax(110px, 0.65fr)',
        }}
        gridTemplateAreas={{
          base: '"name status" "updated updated"',
          xl: '"name status updated"',
        }}
        paddingBlock="5"
        borderBottomWidth="1px"
        borderColor="border.structural"
        transition="background-color 150ms, border-color 150ms"
        _hover={{ bg: 'bg.subtle', borderBottomColor: 'border.strong' }}
        _focusVisible={{ outline: '2px solid', outlineColor: 'focus.ring', outlineOffset: '3px' }}
      >
        <Link to={row.href}>
          <Box gridArea="name" minWidth="0">
            <Text textStyle="bodyStrong" truncate title={row.name}>
              {row.name}
            </Text>
            {row.description && (
              <Text marginTop="1" textStyle="caption" color="fg.secondary" maxWidth="72ch">
                {row.description}
              </Text>
            )}
          </Box>
          <Box gridArea="status" justifySelf="start">
            <ProjectStatusBadge status={row.status} label={row.statusLabel} />
          </Box>
          <Text gridArea="updated" textStyle="caption" color="fg.secondary">
            {row.updatedLabel}
          </Text>
        </Link>
      </ChakraLink>
    ))}
  </Box>
)

ProjectList.displayName = 'ProjectList'
