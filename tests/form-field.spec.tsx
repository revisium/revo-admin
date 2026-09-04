import { ChakraProvider } from '@chakra-ui/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FormField } from 'src/shared/ui/components/FormField/FormField'
import { system } from 'src/shared/ui/theme/theme'

const renderField = (props: { readonly reserveErrorSpace?: boolean }) =>
  renderToStaticMarkup(
    <ChakraProvider value={system}>
      <FormField label="Search" {...props}>
        {(controlProps) => <input {...controlProps} />}
      </FormField>
    </ChakraProvider>,
  )

describe('FormField', () => {
  it('does not render an empty error placeholder when error space is disabled', () => {
    const markup = renderField({ reserveErrorSpace: false })

    expect(markup).not.toContain('min-height:18px')
  })

  it('reserves error space by default for regular forms', () => {
    const markup = renderField({})

    expect(markup).toContain('min-height:18px')
  })

  it('renders an error and its reserved space when reservation is disabled', () => {
    const markup = renderToStaticMarkup(
      <ChakraProvider value={system}>
        <FormField label="Search" error="Search failed" reserveErrorSpace={false}>
          {(controlProps) => <input {...controlProps} />}
        </FormField>
      </ChakraProvider>,
    )

    expect(markup).toContain('Search failed')
    expect(markup).toContain('min-height:18px')
  })
})
