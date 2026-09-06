import { Box, Center, Stack, Text, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { sidebarItemRecipe } from './sidebarItem.recipe'

type SidebarItemVariantProps = RecipeVariantProps<typeof sidebarItemRecipe>

interface SidebarItemProps {
  readonly active?: boolean
  readonly badge?: ReactNode
  readonly collapsed?: boolean
  readonly disabled?: boolean
  readonly icon?: ReactNode
  readonly label: string
  readonly level?: NonNullable<SidebarItemVariantProps['level']>
  readonly meta?: string
  readonly onNavigate?: () => void
  readonly to: string
}

const resolveLines = (meta: string | undefined, collapsed: boolean): 'single' | 'double' =>
  meta && !collapsed ? 'double' : 'single'

const resolveLevel = (
  level: NonNullable<SidebarItemVariantProps['level']>,
  collapsed: boolean,
): NonNullable<SidebarItemVariantProps['level']> => (collapsed ? 'root' : level)

export const SidebarItem = ({
  active = false,
  badge,
  collapsed = false,
  disabled = false,
  icon,
  label,
  level = 'root',
  meta,
  onNavigate,
  to,
}: SidebarItemProps) => {
  const recipe = useRecipe({ recipe: sidebarItemRecipe })
  const styles = recipe({
    collapsed,
    disabled,
    level: resolveLevel(level, collapsed),
    lines: resolveLines(meta, collapsed),
  })
  const content = (
    <>
      {icon ? (
        <Center boxSize="20px" color="fg.muted" flexShrink="0" position="relative">
          {icon}
          {collapsed && badge ? (
            <Box position="absolute" top="-2px" right="-2px" boxSize="7px" borderRadius="full" bg="dot.waiting" />
          ) : null}
        </Center>
      ) : null}
      {collapsed ? null : (
        <>
          <Stack gap="0" flex="1" minW="0">
            <Text textStyle={level === 'root' ? 'body' : 'small'} fontWeight="400" truncate title={label}>
              {label}
            </Text>
            {meta ? (
              <Text textStyle="caption" color="fg.muted" truncate title={meta}>
                {meta}
              </Text>
            ) : null}
          </Stack>
          {badge ? (
            <Center
              minW="20px"
              h="20px"
              px="1.5"
              borderRadius="4px"
              bg="bg.subtle"
              color="fg.muted"
              textStyle="caption"
              flexShrink="0"
            >
              {badge}
            </Center>
          ) : null}
        </>
      )}
    </>
  )

  if (disabled) {
    return (
      <Box css={styles} title={label} aria-disabled="true">
        {content}
      </Box>
    )
  }

  return (
    <Box asChild css={styles}>
      <Link
        to={to}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </Link>
    </Box>
  )
}

SidebarItem.displayName = 'SidebarItem'

export type { SidebarItemProps }
