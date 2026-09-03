import { Box, Flex } from '@chakra-ui/react'
import { type KeyboardEvent, useId, useRef, useState } from 'react'
import { Button, NavLink } from 'src/shared/ui/kit'

interface ProjectSectionNavigationProps<TKey extends string> {
  readonly sections: ReadonlyArray<{ readonly key: TKey; readonly label: string; readonly href: string }>
  readonly currentKey: TKey
  readonly label?: string
}

// The compact disclosure diverges deliberately from the exported revo-project-overview.html,
// which instead makes the row horizontally scrollable. The design document requires the trigger
// in two separate places, and the scrolling row measurably hides destinations: the six labels at
// 14px/600 total roughly 424px including gaps, against 328px available on a 360px viewport with
// 16px gutters, so the last section ends up off-screen with no scrollbar affordance.
//
// Two things are deliberately NOT this component's job. Moving focus to the new section heading
// on route change belongs to the route or page, which owns the heading. And `Back to projects`
// is not rendered here: the breadcrumb above the identity block already links to the project
// list and stays visible on compact, and two identical adjacent links are worse than one.
export const ProjectSectionNavigation = <TKey extends string>({
  sections,
  currentKey,
  label = 'Project sections',
}: ProjectSectionNavigationProps<TKey>) => {
  const [expanded, setExpanded] = useState(false)
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const triggerLabel = sections.find((section) => section.key === currentKey)?.label ?? sections[0]?.label ?? label

  const handleEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      setExpanded(false)
      triggerRef.current?.focus()
    }
  }

  const handleLinkClick = () => {
    setExpanded(false)
  }

  return (
    <Box as="nav" aria-label={label} onKeyDown={handleEscape}>
      {/* The responsive display lives on this wrapper, not on the Button: the kit Button accepts
          only its own props and recipe variants, because it owns its appearance. */}
      <Box display={{ base: 'inline-flex', lg: 'none' }}>
        <Button
          ref={triggerRef}
          variant="secondary"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(!expanded)}
        >
          {triggerLabel}
        </Button>
      </Box>

      {/* One <nav> with every link always in the DOM, never two rendered branches — otherwise
          assistive technology sees two navigations. Collapsed on compact is a real display:none
          so the links leave both the tab order and the accessibility tree, rather than staying
          reachable but invisible. */}
      <Flex
        id={listId}
        display={{ base: expanded ? 'flex' : 'none', lg: 'flex' }}
        flexDirection={{ base: 'column', lg: 'row' }}
        gap="5"
        flexWrap="wrap"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor="border.structural"
      >
        {sections.map((section) => (
          <NavLink
            key={section.key}
            href={section.href}
            aria-current={section.key === currentKey ? 'page' : undefined}
            onClick={handleLinkClick}
          >
            {section.label}
          </NavLink>
        ))}
      </Flex>
    </Box>
  )
}

ProjectSectionNavigation.displayName = 'ProjectSectionNavigation'

export type { ProjectSectionNavigationProps }
