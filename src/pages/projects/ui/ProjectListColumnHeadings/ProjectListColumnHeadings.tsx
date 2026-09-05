import { Box, Text } from '@chakra-ui/react'
import type React from 'react'

export const ProjectListColumnHeadings: React.FC = () => (
  <Box
    aria-hidden="true"
    display={{ base: 'none', xl: 'grid' }}
    gridTemplateColumns="minmax(200px, 1.7fr) minmax(135px, 0.9fr) minmax(110px, 0.65fr)"
    columnGap="4"
    paddingBottom="2"
    textStyle="caption"
    color="fg.muted"
    position="sticky"
    top="0"
    zIndex="1"
    bg="bg.canvas"
  >
    {['Project', 'Status', 'Updated'].map((heading) => (
      <Text key={heading}>{heading}</Text>
    ))}
  </Box>
)

ProjectListColumnHeadings.displayName = 'ProjectListColumnHeadings'
