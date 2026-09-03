import { HStack, Stack, Table, Text } from '@chakra-ui/react'
import { SectionHeading } from 'src/shared/ui'
import type { CostRow } from 'src/shared/fixtures'

interface CostPanelProps {
  readonly rows: ReadonlyArray<CostRow>
}

const COST_DECIMALS = 3

// Cost accounting over cost_ledger: per-attempt model/tokens/cost plus a run
// total. Pure presentational; total is a render-time fold over the props.
export const CostPanel = ({ rows }: CostPanelProps) => {
  const total = rows.reduce((sum, row) => sum + row.costAmount, 0)
  const currency = rows[0]?.currency ?? 'USD'

  return (
    <Stack gap="3">
      <SectionHeading>Cost</SectionHeading>
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Attempt</Table.ColumnHeader>
            <Table.ColumnHeader>Model</Table.ColumnHeader>
            <Table.ColumnHeader>Input</Table.ColumnHeader>
            <Table.ColumnHeader>Output</Table.ColumnHeader>
            <Table.ColumnHeader>Cost</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.attemptLabel}</Table.Cell>
              <Table.Cell>{row.modelProfile}</Table.Cell>
              <Table.Cell>{row.inputTokens.toLocaleString()}</Table.Cell>
              <Table.Cell>{row.outputTokens.toLocaleString()}</Table.Cell>
              <Table.Cell>
                {row.costAmount.toFixed(COST_DECIMALS)} {row.currency}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <HStack justify="flex-end">
        <Text textStyle="bodyStrong" color="fg.default">
          Run total: {total.toFixed(COST_DECIMALS)} {currency}
        </Text>
      </HStack>
    </Stack>
  )
}
