import { HStack, Link as ChakraLink, Span, Text } from '@chakra-ui/react'
import { Link } from 'react-router'
import { PIPELINES, PLAYBOOKS, ROLES } from 'src/shared/fixtures'
import { routes } from 'src/shared/config'

type MethodTab = 'pipelines' | 'roles' | 'playbooks'

interface MethodTabsProps {
  readonly active: MethodTab
}

const TABS: ReadonlyArray<{
  readonly id: MethodTab
  readonly label: string
  readonly to: string
  readonly count: number
}> = [
  { id: 'pipelines', label: 'Pipelines', to: routes.methodPipelines(), count: PIPELINES.length },
  { id: 'roles', label: 'Roles', to: routes.methodRoles(), count: ROLES.length },
  { id: 'playbooks', label: 'Playbooks', to: routes.methodPlaybooks(), count: PLAYBOOKS.length },
]

export const MethodTabs = ({ active }: MethodTabsProps) => (
  <HStack
    as="nav"
    gap="0"
    overflowX="auto"
    borderBottomWidth="1px"
    borderColor="border.structural"
    css={{ scrollbarWidth: 'none' }}
  >
    {TABS.map((tab) => {
      const selected = tab.id === active

      return (
        <ChakraLink
          key={tab.id}
          asChild
          h="46px"
          px="4"
          display="inline-flex"
          alignItems="center"
          gap="2"
          flexShrink="0"
          borderBottomWidth="2px"
          borderColor={selected ? 'fg.default' : 'transparent'}
          color={selected ? 'fg.default' : 'fg.secondary'}
          textStyle={selected ? 'bodyStrong' : 'body'}
          _hover={{ color: 'fg.default', textDecoration: 'none' }}
        >
          <Link to={tab.to} aria-current={selected ? 'page' : undefined}>
            <Text as="span">{tab.label}</Text>
            <Span
              className="mono tnum"
              minW="5"
              h="5"
              px="1.5"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="pill"
              bg="bg.subtle"
              color="fg.default"
              textStyle="caption"
            >
              {tab.count}
            </Span>
          </Link>
        </ChakraLink>
      )
    })}
  </HStack>
)
