import { Box, Flex, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PageHeaderProps {
  readonly title: string
  readonly description?: ReactNode
  readonly actions?: ReactNode
  readonly breadcrumb?: ReactNode
  readonly id?: string
}

export const PageHeader = ({ title, description, actions, breadcrumb, id }: PageHeaderProps) => {
  return (
    <Flex
      as="header"
      gap="6"
      alignItems="flex-start"
      justifyContent="space-between"
      flexDirection={{ base: 'column', lg: 'row' }}
      marginBottom={{ base: '7', lg: '10' }}
    >
      <Flex flexDirection="column" width="100%">
        {breadcrumb ? <Box marginBottom="5">{breadcrumb}</Box> : null}
        <Text as="h1" id={id} tabIndex={id ? -1 : undefined} textStyle="pageTitle">
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
