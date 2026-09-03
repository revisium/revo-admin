import { Box, Grid, Flex, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { SkipLink } from 'src/shared/ui/kit'

interface AppShellProps {
  readonly brand: ReactNode
  readonly navigation: ReactNode
  readonly railNote?: ReactNode
  readonly skipLinkLabel: string
  readonly children: ReactNode
}

export const AppShell = ({ brand, navigation, railNote, skipLinkLabel, children }: AppShellProps) => {
  return (
    <>
      <SkipLink href="#content">{skipLinkLabel}</SkipLink>
      <Grid
        minHeight="100vh"
        // Keep bg.canvas here on purpose; body stays on legacy warm canvas until old screens are retired.
        bg="bg.canvas"
        gridTemplateColumns={{ base: '1fr', lg: '220px minmax(0, 1fr)' }}
      >
        <Flex
          as="aside"
          // No aria-label: this is a complementary sidebar holding brand, nav and a note —
          // it is not itself navigation, and its contents (the nav below) label themselves.
          bg="bg.surface"
          flexDirection={{ base: 'row', lg: 'column' }}
          alignItems={{ base: 'center', lg: 'stretch' }}
          gap={{ base: '0', lg: '8' }}
          py={{ base: '3', lg: '6' }}
          px="4"
          borderRightWidth={{ base: '0px', lg: '1px' }}
          borderRightColor="border.structural"
          borderBottomWidth={{ base: '1px', lg: '0px' }}
          borderBottomColor="border.structural"
        >
          {brand}
          <Box marginLeft={{ base: 'auto', lg: '0' }}>{navigation}</Box>
          {railNote ? (
            <Text display={{ base: 'none', lg: 'block' }} marginTop="auto" textStyle="caption" color="fg.muted">
              {railNote}
            </Text>
          ) : null}
        </Flex>
        {/* minWidth='0' prevents long identifiers from forcing the whole grid beyond viewport width. */}
        <Box as="main" id="content" tabIndex={-1} minWidth="0">
          {children}
        </Box>
      </Grid>
    </>
  )
}

AppShell.displayName = 'AppShell'

export type { AppShellProps }
