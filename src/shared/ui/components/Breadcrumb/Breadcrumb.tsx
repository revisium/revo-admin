import { Box, Span, Text, chakra, type SystemStyleObject } from '@chakra-ui/react'

interface BreadcrumbProps {
  readonly items: ReadonlyArray<{
    readonly label: string
    readonly href?: string
  }>
  readonly label?: string
}

// This deliberately does not reuse the kit's InlineLink, because InlineLink
// is fg.default while breadcrumb links are fg.secondary. The small duplication
// is intentional.
export const Breadcrumb = ({ items, label = 'Breadcrumb' }: BreadcrumbProps) => {
  const linkStyles: SystemStyleObject = {
    color: 'fg.secondary',
    textStyle: 'small',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    _hover: {
      textDecorationThickness: '2px',
    },
  }

  return (
    <Box as="nav" aria-label={label}>
      <Box
        as="ol"
        display="flex"
        gap="2"
        flexWrap="wrap"
        listStyleType="none"
        margin="0"
        padding="0"
        role="list"
        // listStyleType="none" strips list roles in WebKit/VoiceOver; role="list" re-asserts it
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const ariaCurrentAttr = isLast ? 'page' : undefined

          return (
            <Box as="li" key={item.href ?? item.label} display="flex" alignItems="center" gap="2">
              {item.href ? (
                <chakra.a href={item.href} aria-current={ariaCurrentAttr} css={linkStyles}>
                  {item.label}
                </chakra.a>
              ) : (
                <Text aria-current={ariaCurrentAttr} textStyle="small" color="fg.secondary">
                  {item.label}
                </Text>
              )}
              {!isLast && <Span aria-hidden="true">/</Span>}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

Breadcrumb.displayName = 'Breadcrumb'

export type { BreadcrumbProps }
