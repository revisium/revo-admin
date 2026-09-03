import { Flex, Span, Text } from '@chakra-ui/react'
import { type ReactNode, useId } from 'react'
import { mergeDescribedBy } from './mergeDescribedBy'

interface ControlWiringProps {
  readonly id: string
  readonly 'aria-describedby': string | undefined
  readonly 'aria-invalid': boolean
  readonly required: boolean
}

interface FormFieldProps {
  readonly label: string
  readonly hint?: string
  readonly error?: string
  readonly required?: boolean
  readonly id?: string
  readonly children: (controlProps: ControlWiringProps) => ReactNode
}

export const FormField = ({ label, hint, error, required, id: providedId, children }: FormFieldProps) => {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = mergeDescribedBy([hintId, errorId])

  return (
    <Flex flexDirection="column" gap="6px">
      <label htmlFor={id}>
        <Text as="span" color="fg.default" textStyle="bodyStrong">
          {label}
          {required ? (
            <Text as="span" color="fg.secondary" aria-hidden>
              *
            </Text>
          ) : null}
        </Text>
      </label>
      {hint ? (
        <Text as="span" id={hintId} textStyle="small" color="fg.secondary">
          {hint}
        </Text>
      ) : null}
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        required: Boolean(required),
      })}
      {/* Reserved error area to avoid layout shift when error state appears */}
      <Span minH="18px">
        {error ? (
          <Text as="span" id={errorId} textStyle="small" color="fg.secondary">
            {error}
          </Text>
        ) : null}
      </Span>
    </Flex>
  )
}

FormField.displayName = 'FormField'

export type { FormFieldProps, ControlWiringProps }
