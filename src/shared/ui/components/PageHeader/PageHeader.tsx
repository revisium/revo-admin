import { Box, Flex, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PageHeaderProps {
  readonly title: string
  readonly description?: ReactNode
  readonly actions?: ReactNode
  readonly eyebrow?: ReactNode
  readonly breadcrumb?: ReactNode
  readonly id?: string
}

// The page title block: an optional uppercase eyebrow or breadcrumb, the page's single `h1`,
// an optional lede, and a right-aligned action region that drops below the title on compact
// screens. `id` makes the title addressable for `aria-labelledby` and for post-navigation focus.
export const PageHeader = ({ title, description, actions, eyebrow, breadcrumb, id }: PageHeaderProps) => {
  return (
    <Flex
      as="header"
      gap="6"
      alignItems="flex-start"
      justifyContent="space-between"
      flexDirection={{ base: 'column', lg: 'row' }}
      marginBottom={{ base: '2', lg: '3' }}
    >
      <Flex flexDirection="column" width="100%">
        {breadcrumb ? <Box marginBottom="5">{breadcrumb}</Box> : null}
        {eyebrow ? (
          <Flex
            gap="2"
            alignItems="center"
            marginBottom="3"
            textStyle="caption"
            color="fg.secondary"
            letterSpacing="0.08em"
            textTransform="uppercase"
          >
            {eyebrow}
          </Flex>
        ) : null}
        <Text as="h1" id={id} tabIndex={id ? -1 : undefined} textStyle="pageTitle" letterSpacing="-0.025em">
          {title}
        </Text>
        {description ? (
          <Text textStyle="body" marginTop="2" color="fg.secondary" maxWidth="64ch">
            {description}
          </Text>
        ) : null}
      </Flex>
      {actions ? (
        <Box width={{ base: '100%', lg: 'auto' }} minWidth="0">
          {actions}
        </Box>
      ) : null}
    </Flex>
  )
}

PageHeader.displayName = 'PageHeader'

export type { PageHeaderProps }
