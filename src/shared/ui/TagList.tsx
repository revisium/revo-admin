import { Badge, Text, Wrap, WrapItem } from '@chakra-ui/react'

interface TagListProps {
  readonly items: ReadonlyArray<string>
  readonly emptyLabel?: string
}

// Wrapping list of neutral chips for string arrays such as repos[],
// allowed_tools[], triggers[] (.tag in the prototype: inset bg, hairline).
export const TagList = ({ items, emptyLabel = '—' }: TagListProps) => {
  if (items.length === 0) {
    return (
      <Text textStyle="small" color="fg.muted">
        {emptyLabel}
      </Text>
    )
  }

  return (
    <Wrap gap="2">
      {items.map((item) => (
        <WrapItem key={item}>
          <Badge
            className="mono"
            textStyle="caption"
            px="2"
            py="0.5"
            borderRadius="control"
            borderWidth="1px"
            color="fg.secondary"
            bg="bg.subtle"
            borderColor="border.structural"
            whiteSpace="nowrap"
          >
            {item}
          </Badge>
        </WrapItem>
      ))}
    </Wrap>
  )
}
