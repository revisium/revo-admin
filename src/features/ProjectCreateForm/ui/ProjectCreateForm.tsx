import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { type FormEvent, useCallback, useRef } from 'react'
import { useInputAutofocus } from 'src/shared/lib'
import { FormField } from 'src/shared/ui/components'
import { Button, Textarea, TextInput } from 'src/shared/ui/kit'
import { type ProjectCreateOutcome, ProjectCreateViewModel } from '../model/ProjectCreateViewModel'

interface ProjectCreateFormProps {
  readonly viewModel: ProjectCreateViewModel
  readonly onCreated: (projectId: string) => void
  readonly onCancel: () => void
}

const completeProjectCreateOutcome = (
  outcome: ProjectCreateOutcome,
  focusName: () => void,
  onCreated: (projectId: string) => void,
): void => {
  if (outcome.kind === 'invalid') {
    focusName()
    return
  }

  if (outcome.kind === 'created') onCreated(outcome.projectId)
}

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

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const outcome = await viewModel.submit()
    completeProjectCreateOutcome(outcome, () => nameInputRef.current?.focus(), onCreated)
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
            <TextInput
              {...controlProps}
              ref={setNameInput}
              invalid={Boolean(viewModel.name.visibleError)}
              value={viewModel.name.value}
              onChange={(event) => viewModel.name.setValue(event.currentTarget.value)}
              onBlur={viewModel.name.blur}
            />
          )}
        </FormField>
        <FormField label="Description" reserveErrorSpace={false}>
          {(controlProps) => (
            <Textarea
              {...controlProps}
              value={viewModel.description.value}
              onChange={(event) => viewModel.description.setValue(event.currentTarget.value)}
              onBlur={viewModel.description.blur}
            />
          )}
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
