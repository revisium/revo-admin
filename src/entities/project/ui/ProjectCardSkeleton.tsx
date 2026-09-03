import { Box } from '@chakra-ui/react'
import { Skeleton } from 'src/shared/ui/kit'

export const ProjectCardSkeleton = () => {
  return (
    <Box
      aria-hidden="true"
      paddingBlock="5"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="border.structural"
    >
      <Skeleton shape="title" width="40%" />
      <Box marginTop="3">
        <Skeleton shape="text" width="60%" />
      </Box>
      {/* The geometry deliberately mirrors the real list row — the same `paddingBlock` and the same bottom hairline — so that swapping placeholder for data causes no layout shift. */}
    </Box>
  )
}

ProjectCardSkeleton.displayName = 'ProjectCardSkeleton'
