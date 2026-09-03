import { Button } from '@chakra-ui/react'
import { BookOpen } from 'lucide-react'

export const SchemaV2Action = () => (
  <Button
    size="sm"
    h="34px"
    px="3.5"
    gap="2"
    bg="bg.surface"
    color="fg.default"
    borderWidth="1px"
    borderColor="border.strong"
    borderRadius="control"
    disabled
    _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
  >
    <BookOpen size={14} />
    Schema v2
  </Button>
)
