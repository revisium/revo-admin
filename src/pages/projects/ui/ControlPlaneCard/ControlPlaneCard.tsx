import { Box, Link as ChakraLink, HStack, Span, Stack, Text } from '@chakra-ui/react'
import { ArrowRight, GitBranch, Scan, UserRound } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router'
import { PIPELINES, ROLES } from 'src/shared/fixtures'
import { Card } from 'src/shared/ui'
import { Avatar } from 'src/shared/ui/kit'
import { StatItem } from 'src/shared/ui/components'

export const ControlPlaneCard: React.FC = () => (
  <ChakraLink
    asChild
    display="block"
    h="100%"
    color="inherit"
    _hover={{ textDecoration: 'none' }}
    _focusVisible={{ outline: '2px solid', outlineColor: 'focus.ring', outlineOffset: '3px' }}
  >
    <Link to="/method/roles">
      <Card
        as="article"
        className="group"
        p="5"
        minH="242px"
        h="100%"
        display="flex"
        flexDirection="column"
        bg="bg.subtle"
        transition="transform 150ms cubic-bezier(.2,0,0,1), box-shadow 150ms, border-color 150ms"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'popover', borderColor: 'border.strong' }}
      >
        <HStack gap="3" mb="3.5" align="center">
          <Avatar size="lg">
            <Scan size={18} />
          </Avatar>
          <Stack gap="0.5" minW="0" flex="1">
            <HStack gap="2" minW="0">
              <Text textStyle="componentTitle" color="fg.default" truncate>
                Control plane
              </Text>
              <Span
                px="1.5"
                py="0.5"
                borderRadius="4px"
                bg="bg.surface"
                borderWidth="1px"
                borderColor="border.structural"
                color="fg.muted"
                fontSize="9.5px"
                fontWeight="650"
                textTransform="uppercase"
                letterSpacing="0"
                flexShrink="0"
              >
                System
              </Span>
            </HStack>
            <Text className="mono" textStyle="caption" color="fg.muted" truncate>
              admin/control-plane/master
            </Text>
          </Stack>
          <Box
            color="fg.muted"
            transition="transform 150ms, color 150ms"
            _groupHover={{ transform: 'translateX(3px)', color: 'fg.default' }}
          >
            <ArrowRight size={16} />
          </Box>
        </HStack>
        <Text textStyle="small" color="fg.secondary" lineHeight="1.55">
          The Method: versioned roles, pipelines, playbooks, model profiles, and routing policy that govern every run.
        </Text>
        <HStack mt="auto" pt="3.5" borderTopWidth="1px" borderColor="border.structural" gap="3" wrap="wrap">
          <HStack className="mono" gap="1.5" color="fg.secondary" textStyle="caption">
            <GitBranch size={12} />
            <Span>master</Span>
          </HStack>
          <HStack gap="3" ml={{ base: '0', md: 'auto' }} wrap="wrap">
            <StatItem icon={Scan} value={PIPELINES.length} label="Pipelines" />
            <StatItem icon={UserRound} value={ROLES.length} label="Roles" />
          </HStack>
        </HStack>
      </Card>
    </Link>
  </ChakraLink>
)
