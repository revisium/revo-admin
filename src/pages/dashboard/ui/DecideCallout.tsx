import { Center, Link as ChakraLink, HStack, Span, Text } from '@chakra-ui/react'
import { ArrowRight, DoorOpen } from 'lucide-react'
import { Link } from 'react-router'

export const DecideCallout = ({ count }: { readonly count: number }) => (
  <ChakraLink
    asChild
    display="block"
    bgGradient="to-b"
    gradientFrom="brand.tint"
    gradientTo="bg.1"
    borderWidth="1px"
    borderColor="brand.softBorder"
    borderRadius="warmCard"
    boxShadow="sh-1"
    p="4.5"
    transition="transform 150ms, box-shadow 150ms"
    _hover={{ textDecoration: 'none', transform: 'translateY(-1px)', boxShadow: 'sh-2' }}
  >
    <Link to="/inbox">
      <Center
        boxSize="38px"
        borderRadius="10px"
        bg="accent.gate.bg"
        borderWidth="1px"
        borderColor="accent.gate.border"
        color="accent.gate.fg"
        mb="3"
      >
        <DoorOpen size={20} />
      </Center>
      <Text className="tnum" textStyle="bold-lg" color="fg.0" letterSpacing="-0.02em">
        {count}{' '}
        <Span textStyle="medium-body" color="fg.2">
          gates open
        </Span>
      </Text>
      <Text textStyle="regular-sm" color="fg.2" mt="1">
        Plan &amp; merge gates are parked, waiting for your approval.
      </Text>
      <HStack gap="1.5" mt="3.5" color="brand.500" textStyle="semibold-sm">
        <Text>Open inbox</Text>
        <ArrowRight size={15} />
      </HStack>
    </Link>
  </ChakraLink>
)
