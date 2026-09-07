import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { type RefObject, type SubmitEvent, useCallback, useRef } from 'react'
import { useBlocker } from 'react-router'
import { type Project } from 'src/entities/project'
import { ArchiveProjectDialog, DiscardChangesDialog, RestoreProjectDialog } from 'src/features/ProjectSettingsDialogs'
import { useViewModel } from 'src/shared/lib'
import { FormField, type ControlWiringProps } from 'src/shared/ui/components'
import { Button, Textarea, TextInput } from 'src/shared/ui/kit'
import { ProjectSettingsViewModel } from '../model/ProjectSettingsViewModel'

interface ProjectSettingsPageProps {
  readonly project: Project
  readonly onProjectChange: (project: Project) => void
}

interface NameControlProps {
  readonly control: ProjectSettingsViewModel['name']
  readonly controlProps: ControlWiringProps
  readonly inputRef: RefObject<HTMLInputElement | null>
  readonly readOnly: boolean
  readonly disabled: boolean
}

interface DescriptionControlProps {
  readonly control: ProjectSettingsViewModel['description']
  readonly controlProps: ControlWiringProps
  readonly readOnly: boolean
  readonly disabled: boolean
}

const NameControl = observer(({ control, controlProps, inputRef, readOnly, disabled }: NameControlProps) => (
  <TextInput
    {...controlProps}
    ref={inputRef}
    invalid={Boolean(control.visibleError)}
    value={control.value}
    readOnly={readOnly}
    disabled={disabled}
    onChange={(event) => control.setValue(event.currentTarget.value)}
    onBlur={() => control.blur()}
  />
))

const DescriptionControl = observer(({ control, controlProps, readOnly, disabled }: DescriptionControlProps) => (
  <Textarea
    {...controlProps}
    value={control.value}
    readOnly={readOnly}
    disabled={disabled}
    onChange={(event) => control.setValue(event.currentTarget.value)}
    onBlur={() => control.blur()}
  />
))

const SettingsHeading = ({ headingRef }: { readonly headingRef: RefObject<HTMLHeadingElement | null> }) => (
  <Text
    ref={headingRef}
    as="h2"
    id="project-settings-heading"
    tabIndex={-1}
    aria-describedby="project-page-status"
    textStyle="sectionTitle"
    color="fg.default"
  >
    Settings
  </Text>
)

const SaveFeedback = observer(({ viewModel }: { readonly viewModel: ProjectSettingsViewModel }) => {
  if (viewModel.isSaving) {
    return (
      <Box role="status" aria-live="polite">
        <Text textStyle="body" color="fg.secondary">
          Saving…
        </Text>
      </Box>
    )
  }

  if (viewModel.saveError) {
    return (
      <Box role="alert" aria-live="assertive">
        <Text textStyle="body" color="fg.default">
          {viewModel.saveError}
        </Text>
        {viewModel.hasCommittedRefreshFailure ? (
          <Box marginTop="3">
            <Button
              variant="secondary"
              busy={viewModel.isRefreshing}
              busyLabel="Retrying…"
              onClick={viewModel.retryRefresh}
            >
              Retry
            </Button>
          </Box>
        ) : null}
      </Box>
    )
  }

  if (viewModel.saveNotice) {
    return (
      <Box role="status" aria-live="polite">
        <Text textStyle="body" color="fg.secondary">
          {viewModel.saveNotice}
        </Text>
      </Box>
    )
  }

  return null
})

const ProjectDetails = observer(
  ({
    viewModel,
    nameInputRef,
  }: {
    readonly viewModel: ProjectSettingsViewModel
    readonly nameInputRef: RefObject<HTMLInputElement | null>
  }) => {
    const submit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()
      await viewModel.save(() => nameInputRef.current?.focus())
    }

    return (
      <Box as="section" aria-labelledby="project-details-heading">
        <Text as="h3" id="project-details-heading" textStyle="componentTitle" color="fg.default" marginBottom="5">
          Project details
        </Text>
        <form noValidate onSubmit={submit}>
          <Stack gap="5" maxWidth="640px">
            <FormField label="Name" error={viewModel.name.visibleError} required>
              {(controlProps) => (
                <NameControl
                  control={viewModel.name}
                  controlProps={controlProps}
                  inputRef={nameInputRef}
                  readOnly={viewModel.isArchived}
                  disabled={viewModel.isSaving}
                />
              )}
            </FormField>
            <FormField label="Description" reserveErrorSpace={false}>
              {(controlProps) => (
                <DescriptionControl
                  control={viewModel.description}
                  controlProps={controlProps}
                  readOnly={viewModel.isArchived}
                  disabled={viewModel.isSaving}
                />
              )}
            </FormField>
            <SaveFeedback viewModel={viewModel} />
            {!viewModel.isArchived ? (
              <Flex gap="3" flexWrap="wrap" alignItems="center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!viewModel.canCancel}
                  onClick={viewModel.cancelChanges}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!viewModel.canSave} busy={viewModel.isSaving} busyLabel="Saving…">
                  Save changes
                </Button>
              </Flex>
            ) : null}
          </Stack>
        </form>
      </Box>
    )
  },
)

const ProjectState = observer(
  ({
    viewModel,
    actionRef,
  }: {
    readonly viewModel: ProjectSettingsViewModel
    readonly actionRef: RefObject<HTMLButtonElement | null>
  }) => (
    <Box
      as="section"
      aria-labelledby="project-state-heading"
      paddingTop="6"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="border.structural"
    >
      <Text as="h3" id="project-state-heading" textStyle="componentTitle" color="fg.default">
        Project state
      </Text>
      <Text marginTop="2" textStyle="body" color="fg.secondary" maxWidth="64ch">
        {viewModel.isArchived
          ? 'This project is archived and read-only.'
          : (viewModel.stateGuardMessage ?? 'Archiving keeps project data available to read.')}
      </Text>
      {!viewModel.stateGuardMessage ? (
        <Box marginTop="4">
          <Button
            ref={actionRef}
            variant="secondary"
            disabled={viewModel.hasCommittedRefreshFailure}
            onClick={viewModel.isArchived ? viewModel.openRestore : viewModel.openArchive}
          >
            {viewModel.isArchived ? 'Restore project' : 'Archive project'}
          </Button>
        </Box>
      ) : null}
    </Box>
  ),
)

export const ProjectSettingsPage = observer(({ project, onProjectChange }: ProjectSettingsPageProps) => {
  const viewModel = useViewModel(ProjectSettingsViewModel, project, onProjectChange)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const settingsHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const stateActionRef = useRef<HTMLButtonElement | null>(null)
  const navigationFocusRef = useRef<HTMLElement | null>(null)
  const shouldBlockNavigation = useCallback(() => {
    if (!viewModel.isDirty) return false
    if (document.activeElement instanceof HTMLElement) navigationFocusRef.current = document.activeElement
    return true
  }, [viewModel])
  const blocker = useBlocker(shouldBlockNavigation)

  const currentProject = viewModel.project
  if (!currentProject) return null

  const focusSettingsAfter = async (operation: () => Promise<boolean>): Promise<void> => {
    const succeeded = await operation()
    if (succeeded) requestAnimationFrame(() => settingsHeadingRef.current?.focus())
  }

  const keepEditing = (): void => {
    if (blocker.state !== 'blocked') return
    blocker.reset()
    requestAnimationFrame(() => navigationFocusRef.current?.focus())
  }

  const discardChanges = (): void => {
    if (blocker.state !== 'blocked') return
    viewModel.cancelChanges()
    blocker.proceed()
  }

  const closeStateDialog = (): void => {
    viewModel.closeStateDialog()
    requestAnimationFrame(() => stateActionRef.current?.focus())
  }

  return (
    <Stack data-testid="project-content-settings" gap="8">
      <SettingsHeading headingRef={settingsHeadingRef} />
      <ProjectDetails viewModel={viewModel} nameInputRef={nameInputRef} />
      <ProjectState viewModel={viewModel} actionRef={stateActionRef} />
      <ArchiveProjectDialog
        open={viewModel.stateDialog === 'archive'}
        projectName={currentProject.name}
        pending={viewModel.isOperationPending}
        error={viewModel.operationError}
        onClose={closeStateDialog}
        onConfirm={() => void focusSettingsAfter(viewModel.confirmArchive)}
      />
      <RestoreProjectDialog
        open={viewModel.stateDialog === 'restore'}
        projectName={currentProject.name}
        pending={viewModel.isOperationPending}
        error={viewModel.operationError}
        onClose={closeStateDialog}
        onConfirm={() => void focusSettingsAfter(viewModel.confirmRestore)}
      />
      <DiscardChangesDialog open={blocker.state === 'blocked'} onKeepEditing={keepEditing} onDiscard={discardChanges} />
    </Stack>
  )
})

ProjectSettingsPage.displayName = 'ProjectSettingsPage'

export type { ProjectSettingsPageProps }
