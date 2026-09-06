import { Center, Link as ChakraLink, HStack, Span, Text } from '@chakra-ui/react'
import { ArrowRight, DoorOpen } from 'lucide-react'
import { Link } from 'react-router'
import { routes } from 'src/shared/config'

interface DecideCalloutProps {
  readonly count: number
}

export const DecideCallout = ({ count }: DecideCalloutProps) => (
  <ChakraLink
    asChild
    display="block"
    bgGradient="to-b"
    gradientFrom="bg.subtle"
    gradientTo="bg.surface"
    borderWidth="1px"
    borderColor="border.structural"
    borderRadius="card"
    boxShadow="popover"
    p="4.5"
    transition="transform 150ms, box-shadow 150ms"
    _hover={{ textDecoration: 'none', bg: 'bg.subtle', borderColor: 'border.strong' }}
  >
    <Link to={routes.inbox()}>
      <Center
        boxSize="38px"
        borderRadius="10px"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.structural"
        color="fg.secondary"
        mb="3"
      >
        <DoorOpen size={20} />
      </Center>
      <Text className="tnum" textStyle="pageTitle" color="fg.default" letterSpacing="-0.02em">
        {count}{' '}
        <Span textStyle="body" color="fg.secondary">
          gates open
        </Span>
      </Text>
      <Text textStyle="small" color="fg.secondary" mt="1">
        Plan &amp; merge gates are parked, waiting for your approval.
      </Text>
      <HStack gap="1.5" mt="3.5" color="fg.default" textStyle="bodyStrong">
        <Text>Open inbox</Text>
        <ArrowRight size={15} />
      </HStack>
    </Link>
  </ChakraLink>
)
