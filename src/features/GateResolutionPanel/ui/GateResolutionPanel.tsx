import { Box, Button, Center, Link as ChakraLink, Flex, HStack, Span, Text } from '@chakra-ui/react'
import { ArrowRight, Check, DoorOpen, MessageCircleQuestion, Pencil, X } from 'lucide-react'
import { Link } from 'react-router'
import type { InboxItemDetail } from 'src/shared/fixtures'
import { runById } from 'src/shared/fixtures'
import { toaster } from 'src/shared/ui'
import { MergeGateBody } from './MergeGateBody'
import { PlanGateBody } from './PlanGateBody'
import { QuestionBody } from './QuestionBody'

const TITLE: Record<InboxItemDetail['gateType'], string> = {
  plan_gate: 'Plan gate',
  merge_gate: 'Merge gate',
  answer_question: 'Question',
}

const notify = (title: string) => () => toaster.create({ title })

const PanelHead = ({ detail }: { readonly detail: InboxItemDetail }) => {
  const question = detail.gateType === 'answer_question'
  const run = runById(detail.runId)
  return (
    <Flex
      justify="space-between"
      align="start"
      gap="3"
      p="4"
      borderBottomWidth="1px"
      borderColor="border"
      bgGradient="to-b"
      gradientFrom="brand.tint"
      gradientTo="transparent"
    >
      <HStack gap="3" minW="0" align="start">
        <Center
          boxSize="36px"
          borderRadius="10px"
          flexShrink="0"
          color={question ? 'status.running.fg' : 'accent.gate.fg'}
          bg={question ? 'status.running.bg' : 'accent.gate.bg'}
          borderWidth="1px"
          borderColor={question ? 'status.running.border' : 'accent.gate.border'}
        >
          {question ? <MessageCircleQuestion size={19} /> : <DoorOpen size={19} />}
        </Center>
        <Box minW="0">
          <HStack gap="2" wrap="wrap">
            <Span
              px="2"
              h="20px"
              display="inline-flex"
              alignItems="center"
              borderRadius="chip"
              textStyle="semibold-micro"
              textTransform="uppercase"
              letterSpacing="0.04em"
              color={question ? 'status.running.fg' : 'accent.gate.fg'}
              bg={question ? 'status.running.bg' : 'accent.gate.bg'}
            >
              {question ? 'question' : 'human gate'}
            </Span>
            <Text textStyle="semibold-body" color="fg.0" whiteSpace="nowrap">
              {TITLE[detail.gateType]}
            </Text>
          </HStack>
          <ChakraLink
            asChild
            mt="1"
            color="fg.2"
            textStyle="regular-sm"
            _hover={{ color: 'fg.0', textDecoration: 'none' }}
          >
            <Link to={`/runs/${run.id}`}>
              <HStack gap="1.5" minW="0">
                <Text truncate>{run.title}</Text>
                <ArrowRight size={13} />
              </HStack>
            </Link>
          </ChakraLink>
        </Box>
      </HStack>
      <Text className="mono" textStyle="regular-xs" color="fg.3" flexShrink="0">
        {detail.runId}
      </Text>
    </Flex>
  )
}

const GHOST = { bg: 'transparent', color: 'fg.1', _hover: { bg: 'blackAlpha.50', color: 'fg.0' } } as const
const SECONDARY = {
  bg: 'bg.1',
  color: 'fg.1',
  borderWidth: '1px',
  borderColor: 'border.warmStrong',
  _hover: { bg: 'bg.2', borderColor: 'fg.3' },
} as const
const DANGER = {
  bg: 'bg.1',
  color: 'status.failed.fg',
  borderWidth: '1px',
  borderColor: 'status.failed.border',
  _hover: { bg: 'status.failed.bg' },
} as const
const SUCCESS = { bg: 'status.success.fg', color: 'white', _hover: { filter: 'brightness(1.06)' } } as const
const BTN = { size: 'sm', h: '36px', px: '3.5', gap: '1.5', borderRadius: 'btn' } as const

const PanelActions = ({ detail }: { readonly detail: InboxItemDetail }) => {
  const merge = detail.gateType === 'merge_gate'

  if (detail.gateType === 'answer_question') {
    return (
      <Flex gap="2" justify="flex-end" wrap="wrap" p="4" borderTopWidth="1px" borderColor="border">
        <Button {...BTN} {...GHOST} onClick={notify('Skipped for now')}>
          Skip
        </Button>
        <Button {...BTN} {...SUCCESS} onClick={notify('Answer submitted to developer')}>
          <Check size={15} />
          Submit answer
        </Button>
      </Flex>
    )
  }

  return (
    <Flex gap="2" justify="space-between" wrap="wrap" p="4" borderTopWidth="1px" borderColor="border">
      <Flex gap="2" wrap="wrap">
        <Button {...BTN} {...DANGER} onClick={notify(merge ? 'Merge blocked' : 'Plan rejected')}>
          <X size={15} />
          {merge ? 'Block merge' : 'Reject'}
        </Button>
        <Button {...BTN} {...SECONDARY} onClick={notify('Requested changes — re-routed to developer')}>
          <Pencil size={15} />
          Request changes
        </Button>
      </Flex>
      <Button
        {...BTN}
        {...SUCCESS}
        onClick={notify(merge ? 'Merge approved — integrator dispatched' : 'Plan approved — developer dispatched')}
      >
        <Check size={15} />
        {merge ? 'Approve merge' : 'Approve plan'}
      </Button>
    </Flex>
  )
}

export const GateResolutionPanel = ({ item }: { readonly item: InboxItemDetail }) => (
  <Flex direction="column" h="100%" minH="0">
    <PanelHead detail={item} />
    <Box flex="1" overflowY="auto" p="4">
      {item.gateType === 'plan_gate' ? <PlanGateBody detail={item} /> : null}
      {item.gateType === 'merge_gate' ? <MergeGateBody detail={item} /> : null}
      {item.gateType === 'answer_question' ? <QuestionBody detail={item} /> : null}
    </Box>
    <PanelActions detail={item} />
  </Flex>
)
