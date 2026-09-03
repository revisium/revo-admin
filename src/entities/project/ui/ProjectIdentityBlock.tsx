import { Box, Flex, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { CopyableProjectId } from './CopyableProjectId'

interface ProjectIdentityBlockProps {
  readonly name: string
  readonly description?: ReactNode
  readonly status: ReactNode
  readonly projectId: string
  readonly copyLabel: string
  readonly copiedMessage: string
  readonly copyFailedMessage: string
  readonly primaryAction?: ReactNode
  readonly breadcrumb?: ReactNode
  readonly headingId?: string
}

// An archived Project is NOT a disabled page. This component contains no `opacity`, no
// `pointerEvents: 'none'` and no dimming of any kind — an archived Project stays fully readable
// and navigable. The archived presentation lives entirely in the `status` slot and in which
// `primaryAction` the caller passes.
export const ProjectIdentityBlock = ({
  name,
  description,
  status,
  projectId,
  copyLabel,
  copiedMessage,
  copyFailedMessage,
  primaryAction,
  breadcrumb,
  headingId,
}: ProjectIdentityBlockProps) => {
  return (
    <Box
      as="header"
      paddingBottom="6"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="border.structural"
    >
      {breadcrumb && <Box marginBottom="5">{breadcrumb}</Box>}
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        gap={{ base: 4, lg: 6 }}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <Box minWidth="0">
          <Text as="h1" id={headingId} tabIndex={headingId ? -1 : undefined} textStyle="pageTitle" color="fg.default">
            {name}
          </Text>
          {description && (
            <Text marginTop="2" textStyle="body" color="fg.secondary" maxWidth="64ch">
              {description}
            </Text>
          )}
          <Flex alignItems="center" gap="2" flexWrap="wrap" marginTop="4">
            {status}
            <CopyableProjectId
              projectId={projectId}
              copyLabel={copyLabel}
              copiedMessage={copiedMessage}
              copyFailedMessage={copyFailedMessage}
            />
          </Flex>
        </Box>
        {primaryAction && <Box width={{ base: '100%', lg: 'auto' }}>{primaryAction}</Box>}
      </Flex>
    </Box>
  )
}

ProjectIdentityBlock.displayName = 'ProjectIdentityBlock'

export type { ProjectIdentityBlockProps }
