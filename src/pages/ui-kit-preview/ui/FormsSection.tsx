import { Box, Flex } from '@chakra-ui/react'
import { Checkbox, SectionDivider, TextInput, Textarea } from 'src/shared/ui/kit'
import { FormField } from 'src/shared/ui/components'
import { PreviewSectionHeading, PreviewSubsectionHeading } from './PreviewHeading'
import {
  FORM_FIELD_LABEL_OPTIONAL,
  FORM_FIELD_LABEL_REQUIRED,
  TEXTINPUT_ERROR,
  TEXTINPUT_HINT,
  TEXTINPUT_PLACEHOLDER,
  TEXTAREA_ERROR,
  TEXTAREA_HINT,
  TEXTAREA_PLACEHOLDER,
} from './sampleContent'

const READONLY_TEXTINPUT_VALUE = 'Cannot modify'
const READONLY_TEXTAREA_VALUE = 'Cannot modify'
const CHECKBOX_CHECKED_LABEL = 'Checkbox example (checked state)'
const CHECKBOX_UNCHECKED_LABEL = 'Checkbox example (unchecked state)'

export const FormsSection = () => {
  return (
    <Box as="section">
      <PreviewSectionHeading>Forms</PreviewSectionHeading>

      <Flex flexDirection="column" gap="8">
        <Box>
          <PreviewSubsectionHeading>Text input</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="4">
            <FormField label={FORM_FIELD_LABEL_OPTIONAL} hint={TEXTINPUT_HINT}>
              {(props) => <TextInput placeholder={TEXTINPUT_PLACEHOLDER} {...props} />}
            </FormField>

            <FormField label={FORM_FIELD_LABEL_REQUIRED} error={TEXTINPUT_ERROR} required>
              {(props) => <TextInput placeholder={TEXTINPUT_PLACEHOLDER} {...props} />}
            </FormField>

            <FormField label={FORM_FIELD_LABEL_OPTIONAL}>
              {(props) => <TextInput placeholder={TEXTINPUT_PLACEHOLDER} disabled {...props} />}
            </FormField>

            <FormField label={FORM_FIELD_LABEL_OPTIONAL}>
              {(props) => <TextInput defaultValue={READONLY_TEXTINPUT_VALUE} readOnly {...props} />}
            </FormField>
          </Flex>
        </Box>

        <SectionDivider spacing="compact" />

        <Box>
          <PreviewSubsectionHeading>Textarea</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="4">
            <FormField label={FORM_FIELD_LABEL_OPTIONAL} hint={TEXTAREA_HINT}>
              {(props) => <Textarea placeholder={TEXTAREA_PLACEHOLDER} {...props} />}
            </FormField>

            <FormField label={FORM_FIELD_LABEL_REQUIRED} error={TEXTAREA_ERROR} required>
              {(props) => <Textarea placeholder={TEXTAREA_PLACEHOLDER} {...props} />}
            </FormField>

            <FormField label={FORM_FIELD_LABEL_OPTIONAL}>
              {(props) => <Textarea placeholder={TEXTAREA_PLACEHOLDER} disabled {...props} />}
            </FormField>

            <FormField label={FORM_FIELD_LABEL_OPTIONAL}>
              {(props) => <Textarea defaultValue={READONLY_TEXTAREA_VALUE} readOnly {...props} />}
            </FormField>
          </Flex>
        </Box>

        <Box>
          <PreviewSubsectionHeading>Checkbox</PreviewSubsectionHeading>
          <Flex flexDirection="column" gap="3">
            <Checkbox defaultChecked>{CHECKBOX_CHECKED_LABEL}</Checkbox>
            <Checkbox>{CHECKBOX_UNCHECKED_LABEL}</Checkbox>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

FormsSection.displayName = 'FormsSection'
