import { Box, HStack, Span, Stack, Text } from '@chakra-ui/react'
import { CheckCircle2, GitPullRequest } from 'lucide-react'
import type { DiffFile, InboxItemDetail } from 'src/shared/fixtures'
import { diffBar } from 'src/shared/fixtures'
import { RiskBlock } from './RiskBlock'

const FileRow = ({ file }: { readonly file: DiffFile }) => {
  const { addPct, delPct } = diffBar(file.add, file.del)
  return (
    <HStack gap="3" py="1.5">
      <Text className="mono" textStyle="regular-xs" color="fg.1" flex="1" minW="0" truncate>
        {file.path}
      </Text>
      <Text className="mono" textStyle="regular-micro" flexShrink="0">
        <Span color="status.success.fg">+{file.add}</Span> <Span color="status.failed.fg">−{file.del}</Span>
      </Text>
      <HStack gap="0" w="44px" h="1.5" borderRadius="pill" overflow="hidden" flexShrink="0">
        <Box h="full" w={`${addPct}%`} bg="dot.success" />
        <Box h="full" w={`${delPct}%`} bg="dot.failed" />
      </HStack>
    </HStack>
  )
}

export const MergeGateBody = ({ detail }: { readonly detail: InboxItemDetail }) => {
  const diff = detail.diff
  return (
    <Stack gap="4">
      <Text textStyle="regular-sm" color="fg.2">
        {detail.contextSummary}
      </Text>
      {diff ? (
        <Stack gap="3" p="4" borderWidth="1px" borderColor="border" borderRadius="warmCard" bg="bg.1">
          <HStack justify="space-between" gap="3" wrap="wrap">
            <HStack gap="1.5" color="fg.1" textStyle="medium-sm">
              <GitPullRequest size={14} />
              <Text className="mono">{diff.branch}</Text>
            </HStack>
            <HStack gap="2.5" textStyle="regular-xs" className="mono">
              <Span color="status.success.fg">+{diff.additions}</Span>
              <Span color="status.failed.fg">−{diff.deletions}</Span>
              <Span color="fg.3">{diff.files.length} files</Span>
            </HStack>
          </HStack>
          <Stack gap="0" borderTopWidth="1px" borderColor="border.subtle" pt="2">
            {diff.files.map((file) => (
              <FileRow key={file.path} file={file} />
            ))}
          </Stack>
          <HStack gap="3" wrap="wrap" pt="1">
            {diff.checks.map((check) => (
              <HStack key={check} gap="1.5" color="status.success.fg" textStyle="regular-xs">
                <CheckCircle2 size={13} />
                <Text color="fg.2">{check}</Text>
              </HStack>
            ))}
          </HStack>
        </Stack>
      ) : null}
      <RiskBlock risks={detail.riskSummary} />
    </Stack>
  )
}
