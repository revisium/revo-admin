import { Text } from '@chakra-ui/react'
import { useState } from 'react'
import { AppShell, GlobalNavigation, PageContainer, PageHeader } from 'src/shared/ui/components'
import { SectionDivider } from 'src/shared/ui/kit'
import { ActionsSection } from './ActionsSection'
import { ContentSection } from './ContentSection'
import { FoundationsSection } from './FoundationsSection'
import { FeedbackSection } from './FeedbackSection'
import { FormsSection } from './FormsSection'
import { NavigationSection } from './NavigationSection'
import { useTimedFlag } from './previewHelpers'
import { PREVIEW_NAV_ITEMS } from './sampleContent'

const BUSY_DEMO_DURATION_MS = 2000

// Known and accepted on this page only: it renders TWO <h1> elements. PageHeader owns one, and
// the ProjectIdentityBlock specimen owns another, because in its real context — a Project page,
// where there is no PageHeader — the identity block IS the page's single h1. A showcase that
// demonstrates both components cannot avoid the duplication without crippling one of them. Every
// product page must still have exactly one h1; this is a property of the catalogue, not a pattern
// to copy.
export const UiKitPreviewPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)

  const [creating, triggerCreating] = useTimedFlag(BUSY_DEMO_DURATION_MS)
  const [confirming, triggerConfirming] = useTimedFlag(BUSY_DEMO_DURATION_MS)

  const handleToggleCreating = () => {
    triggerCreating()
  }

  const handleOpenConfirm = () => {
    setConfirmOpen(true)
  }

  const handleCloseConfirm = () => {
    setConfirmOpen(false)
  }

  const handleConfirm = () => {
    triggerConfirming(() => setConfirmOpen(false))
  }

  const feedbackProps = {
    confirmOpen,
    confirming,
    onOpenConfirm: handleOpenConfirm,
    onCloseConfirm: handleCloseConfirm,
    onConfirm: handleConfirm,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    includeArchived,
    onIncludeArchivedChange: setIncludeArchived,
  }

  return (
    <AppShell
      brand={
        <Text textStyle="componentTitle" color="fg.default">
          revo · UI kit preview
        </Text>
      }
      navigation={<GlobalNavigation items={PREVIEW_NAV_ITEMS} />}
      railNote="Verification-only route. Not part of the product."
      skipLinkLabel="Skip to preview content"
    >
      <PageContainer>
        <PageHeader
          title="UI kit preview"
          description="Every shared/ui, entities/project, and features/ProjectSearchToolbar export, rendered in its documented states. This route exists because the repo has no DOM test environment — verify visually and by keyboard."
        />
        <FoundationsSection />
        <SectionDivider />
        <ActionsSection creating={creating} onToggleCreating={handleToggleCreating} />
        <SectionDivider />
        <FormsSection />
        <SectionDivider />
        <NavigationSection />
        <SectionDivider />
        <ContentSection />
        <SectionDivider />
        <FeedbackSection {...feedbackProps} />
      </PageContainer>
    </AppShell>
  )
}

UiKitPreviewPage.displayName = 'UiKitPreviewPage'
