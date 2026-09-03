import { Box, chakra } from '@chakra-ui/react'
import { type ChangeEvent, type SubmitEvent } from 'react'
import { FormField } from 'src/shared/ui/components'
import { Checkbox, TextInput } from 'src/shared/ui/kit'

interface ProjectSearchToolbarProps {
  readonly query: string
  readonly onQueryChange: (value: string) => void
  readonly searchLabel: string
  readonly searchPlaceholder?: string
  readonly includeArchived: boolean
  readonly onIncludeArchivedChange: (value: boolean) => void
  readonly includeArchivedLabel: string
}

export const ProjectSearchToolbar = ({
  query,
  onQueryChange,
  searchLabel,
  searchPlaceholder,
  includeArchived,
  onIncludeArchivedChange,
  includeArchivedLabel,
}: ProjectSearchToolbarProps) => {
  // The <form> exists for correct semantics and keyboard behaviour, but onSubmit is
  // prevented: filtering is live as the user types, and there is nothing to submit.
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  // This toolbar stays mounted and visible during loading, during the initial-error
  // state and during no-results. It is never replaced by them — the search and filter
  // must remain available exactly when the collection region has nothing to show.
  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value)
  }

  // Changing the query or the filter must not steal focus, which is why this component
  // holds no focus effects and no `autoFocus`.
  // Ark reports the checked state as boolean | 'indeterminate', so compare against true
  // rather than coercing: this checkbox has no indeterminate state.
  const handleIncludeArchivedChange = (details: { readonly checked: boolean | 'indeterminate' }) => {
    onIncludeArchivedChange(details.checked === true)
  }

  // Include archived is a checkbox with a visible text label, never an unlabelled icon
  // and never a colour toggle. The search field's label is visible too — a placeholder
  // never replaces a label.
  //
  // chakra.form rather than Box as="form": Chakra's Box is pinned to div props and `as` does
  // not re-type, so a form-typed onSubmit is a type error on it. This component owns its form
  // element, which is exactly when the factory is the right tool.
  return (
    <chakra.form
      onSubmit={handleSubmit}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderTopStyle="solid"
      borderBottomStyle="solid"
      borderTopColor="border.structural"
      borderBottomColor="border.structural"
      paddingBlock="4"
      display="flex"
      gap="4"
      flexWrap="wrap"
      alignItems={{ base: 'stretch', lg: 'flex-end' }}
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      <Box flex={{ base: 'auto', lg: '1' }} minWidth="0">
        <FormField label={searchLabel}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              type="search"
              autoComplete="off"
              value={query}
              placeholder={searchPlaceholder}
              onChange={handleQueryChange}
            />
          )}
        </FormField>
      </Box>
      <Checkbox checked={includeArchived} onCheckedChange={handleIncludeArchivedChange}>
        {includeArchivedLabel}
      </Checkbox>
    </chakra.form>
  )
}

ProjectSearchToolbar.displayName = 'ProjectSearchToolbar'

export type { ProjectSearchToolbarProps }
