import { Box } from '@chakra-ui/react'
import { type ElementType, type ReactNode } from 'react'

interface PageContainerProps {
  readonly as?: ElementType
  readonly children: ReactNode
}

export const PageContainer = ({ as = 'div', children }: PageContainerProps) => {
  return (
    <Box
      as={as}
      maxWidth="1280px"
      marginInline="auto"
      width="100%"
      minWidth="0"
      paddingInline={{ base: '4', lg: '6', xl: '8' }}
      paddingTop={{ base: '7', lg: '12' }}
      // 72px has no exact token on the default spacing scale (jumps from 16 -> 20, i.e. 64px -> 80px)
      paddingBottom={{ base: '12', lg: '72px' }}
    >
      {children}
    </Box>
  )
}

PageContainer.displayName = 'PageContainer'

export type { PageContainerProps }
