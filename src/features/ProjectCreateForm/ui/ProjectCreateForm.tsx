import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { type SubmitEvent, useCallback, useRef } from 'react'
import { useInputAutofocus } from 'src/shared/lib'
import { FormField, type ControlWiringProps } from 'src/shared/ui/components'
import { Button, Textarea, TextInput } from 'src/shared/ui/kit'
import { ProjectCreateViewModel } from '../model/ProjectCreateViewModel'

interface ProjectCreateFormProps {
  readonly viewModel: ProjectCreateViewModel
  readonly onCreated: (projectId: string) => void
  readonly onCancel: () => void
}

interface ProjectNameControlProps {
  readonly control: ProjectCreateViewModel['name']
  readonly controlProps: ControlWiringProps
  readonly setInput: (node: HTMLInputElement | null) => void
}

interface ProjectDescriptionControlProps {
  readonly control: ProjectCreateViewModel['description']
  readonly controlProps: ControlWiringProps
}

const ProjectNameControl = observer(({ control, controlProps, setInput }: ProjectNameControlProps) => (
  <TextInput
    {...controlProps}
    ref={setInput}
    invalid={Boolean(control.visibleError)}
    value={control.value}
    onChange={(event) => control.setValue(event.currentTarget.value)}
    onBlur={() => control.blur()}
  />
))

const ProjectDescriptionControl = observer(({ control, controlProps }: ProjectDescriptionControlProps) => (
  <Textarea
    {...controlProps}
    value={control.value}
    onChange={(event) => control.setValue(event.currentTarget.value)}
    onBlur={() => control.blur()}
  />
))

export const ProjectCreateForm = observer(({ viewModel, onCreated, onCancel }: ProjectCreateFormProps) => {
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const autofocus = useInputAutofocus()
  const setNameInput = useCallback(
    (node: HTMLInputElement | null): void => {
      nameInputRef.current = node
      autofocus(node)
    },
    [autofocus],
  )

  const submit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const projectId = await viewModel.submit(() => nameInputRef.current?.focus())
    if (projectId !== undefined) onCreated(projectId)
  }

  return (
    <form noValidate onSubmit={submit}>
      <Stack gap="5">
        {viewModel.creationError ? (
          <Box role="alert" aria-live="assertive">
            <Text textStyle="body" color="fg.default">
              {viewModel.creationError}
            </Text>
          </Box>
        ) : null}
        <FormField label="Name" error={viewModel.name.visibleError} required>
          {(controlProps) => (
            <ProjectNameControl control={viewModel.name} controlProps={controlProps} setInput={setNameInput} />
          )}
        </FormField>
        <FormField label="Description" reserveErrorSpace={false}>
          {(controlProps) => <ProjectDescriptionControl control={viewModel.description} controlProps={controlProps} />}
        </FormField>
        <Flex gap="3" flexWrap="wrap" alignItems="center">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Box asChild width="120px">
            <Button type="submit" busy={viewModel.isBusy} busyLabel="Creating…">
              Create
            </Button>
          </Box>
        </Flex>
      </Stack>
    </form>
  )
})

ProjectCreateForm.displayName = 'ProjectCreateForm'

export type { ProjectCreateFormProps }
