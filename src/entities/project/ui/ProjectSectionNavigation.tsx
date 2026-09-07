import { Box, Flex } from '@chakra-ui/react'
import { type KeyboardEvent, type MouseEvent as ReactMouseEvent, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button, NavLink } from 'src/shared/ui/kit'

interface ProjectSectionNavigationProps<TKey extends string> {
  readonly sections: ReadonlyArray<{
    readonly key: TKey
    readonly label: string
    readonly href: string
  }>
  readonly currentKey: TKey
  readonly label?: string
}

interface ProjectSectionNavigationState<TKey extends string> {
  readonly currentKey: TKey
  readonly expanded: boolean
  readonly pendingCompactTarget: TKey | null
  readonly focusRequest: number
}

export const ProjectSectionNavigation = <TKey extends string>({
  sections,
  currentKey,
  label = 'Project sections',
}: ProjectSectionNavigationProps<TKey>) => {
  const [navigationState, setNavigationState] = useState<ProjectSectionNavigationState<TKey>>({
    currentKey,
    expanded: false,
    pendingCompactTarget: null,
    focusRequest: 0,
  })
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const triggerContainerRef = useRef<HTMLDivElement | null>(null)

  if (navigationState.currentKey !== currentKey) {
    setNavigationState({
      currentKey,
      expanded: false,
      pendingCompactTarget: null,
      focusRequest:
        navigationState.pendingCompactTarget === currentKey
          ? navigationState.focusRequest + 1
          : navigationState.focusRequest,
    })
  }

  const expanded = navigationState.currentKey === currentKey && navigationState.expanded
  const triggerLabel = sections.find((section) => section.key === currentKey)?.label ?? sections[0]?.label ?? label

  useEffect(() => {
    const triggerContainer = triggerContainerRef.current
    if (navigationState.focusRequest === 0 || !triggerContainer) return
    if (getComputedStyle(triggerContainer).display === 'none') return

    triggerRef.current?.focus()
  }, [navigationState.focusRequest])

  const toggleExpanded = () => {
    setNavigationState((state) => ({
      ...state,
      currentKey,
      expanded: !expanded,
      pendingCompactTarget: null,
    }))
  }

  const handleEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      setNavigationState((state) => ({
        ...state,
        currentKey,
        expanded: false,
        pendingCompactTarget: null,
      }))
      triggerRef.current?.focus()
    }
  }

  const handleLinkClick = (event: ReactMouseEvent<HTMLAnchorElement>, targetKey: TKey) => {
    const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (modified || event.defaultPrevented || targetKey === currentKey || !expanded) return
    setNavigationState((state) => ({ ...state, pendingCompactTarget: targetKey }))
  }

  const handleLinkFocus = (targetKey: TKey) => {
    if (navigationState.currentKey !== currentKey || navigationState.pendingCompactTarget !== targetKey) return
    setNavigationState((state) => ({ ...state, pendingCompactTarget: null }))
  }

  return (
    <Box as="nav" aria-label={label} onKeyDown={handleEscape}>
      <Box ref={triggerContainerRef} display={{ base: 'inline-flex', lg: 'none' }}>
        <Button
          ref={triggerRef}
          variant="secondary"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={toggleExpanded}
        >
          {triggerLabel}
        </Button>
      </Box>

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
            as={Link}
            to={section.href}
            aria-current={section.key === currentKey ? 'page' : undefined}
            onClick={(event) => handleLinkClick(event, section.key)}
            onFocus={() => handleLinkFocus(section.key)}
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
