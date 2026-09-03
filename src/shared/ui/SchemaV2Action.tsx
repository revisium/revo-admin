import { Button } from '@chakra-ui/react'
import { BookOpen } from 'lucide-react'

export const SchemaV2Action = () => (
  <Button
    size="sm"
    h="34px"
    px="3.5"
    gap="2"
    bg="bg.1"
    color="fg.0"
    borderWidth="1px"
    borderColor="border.warmStrong"
    borderRadius="btn"
    disabled
    _disabled={{ opacity: 0.58, cursor: 'not-allowed' }}
  >
    <BookOpen size={14} />
    Schema v2
  </Button>
)
